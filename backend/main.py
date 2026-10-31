import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(os.getenv("DATABASE_PATH", "/data/tasks.db"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0
            )
        """)

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield

app = FastAPI(title="Docker Task Manager API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)

def serialize(row):
    return {"id": row["id"], "title": row["title"], "completed": bool(row["completed"])}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.get("/api/tasks")
def list_tasks():
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, title, completed FROM tasks ORDER BY id DESC"
        ).fetchall()
    return [serialize(row) for row in rows]

@app.post("/api/tasks", status_code=201)
def create_task(task: TaskCreate):
    title = task.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Task title cannot be empty.")
    with connect() as conn:
        cursor = conn.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        row = conn.execute(
            "SELECT id, title, completed FROM tasks WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return serialize(row)

@app.patch("/api/tasks/{task_id}")
def toggle_task(task_id: int):
    with connect() as conn:
        row = conn.execute(
            "SELECT id, title, completed FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Task not found.")
        conn.execute(
            "UPDATE tasks SET completed = ? WHERE id = ?",
            (0 if row["completed"] else 1, task_id),
        )
        updated = conn.execute(
            "SELECT id, title, completed FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
    return serialize(updated)

@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    with connect() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found.")
