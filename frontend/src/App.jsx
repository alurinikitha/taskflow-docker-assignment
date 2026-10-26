import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    setError("");
    try {
      const response = await fetch(`${API}/api/tasks`);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
    } catch {
      setError("Cannot connect to the API. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setError("");
    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle })
      });
      if (!response.ok) throw new Error();
      const task = await response.json();
      setTasks(current => [task, ...current]);
      setTitle("");
    } catch {
      setError("Task could not be saved. Check the backend and try again.");
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/api/tasks/${task.id}`, { method: "PATCH" });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setTasks(current => current.map(item => item.id === updated.id ? updated : item));
    } catch {
      setError("Could not update this task.");
    }
  }

  async function deleteTask(task) {
    try {
      const response = await fetch(`${API}/api/tasks/${task.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setTasks(current => current.filter(item => item.id !== task.id));
    } catch {
      setError("Could not delete this task.");
    }
  }

  const visibleTasks = useMemo(() => tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "done") return task.completed;
    return true;
  }), [tasks, filter]);

  const completed = tasks.filter(task => task.completed).length;

  return (
    <main className="page-shell">
      <nav className="topbar">
        <a className="brand" href="#"><span className="brand-mark">T</span> taskflow</a>
        <span className="status"><span className="status-dot" /> Docker-ready demo</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span /> YOUR DAY, WITH A LITTLE MORE CLARITY</div>
        <h1>Make space for<br /><em>what matters.</em></h1>
        <p className="hero-copy">A simple, thoughtful task manager. Add your next step, keep track of progress, and let the small wins add up.</p>
      </section>

      <section className="workspace">
        <div className="stats">
          <div><span className="stat-label">TOTAL TASKS</span><strong>{tasks.length.toString().padStart(2, "0")}</strong></div>
          <div><span className="stat-label">COMPLETED</span><strong>{completed.toString().padStart(2, "0")}</strong></div>
          <div className="progress-wrap"><span className="stat-label">YOUR PROGRESS</span><strong>{tasks.length ? Math.round(completed / tasks.length * 100) : 0}%</strong><div className="progress"><span style={{width: `${tasks.length ? completed / tasks.length * 100 : 0}%`}} /></div></div>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <span className="plus">＋</span>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="What would you like to get done?" maxLength={160} aria-label="New task" />
          <button type="submit">Add task <span>↗</span></button>
        </form>

        <div className="list-heading">
          <h2>Your tasks <span>{visibleTasks.length}</span></h2>
          <div className="filters" role="group" aria-label="Filter tasks">
            {["all", "active", "done"].map(option => <button key={option} className={filter === option ? "selected" : ""} onClick={() => setFilter(option)} type="button">{option === "all" ? "All" : option === "active" ? "In progress" : "Completed"}</button>)}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        <div className="task-list">
          {loading ? <div className="empty-state"><div className="empty-icon">↻</div><strong>Loading your tasks…</strong></div> :
            visibleTasks.length === 0 ? <div className="empty-state"><div className="empty-icon">{filter === "done" ? "✓" : "✳"}</div><strong>{filter === "done" ? "No completed tasks yet" : filter === "active" ? "You're all caught up" : "A fresh start"}</strong><p>Add a task above and it will appear here.</p></div> :
            visibleTasks.map((task, index) => <article className={`task-row ${task.completed ? "is-done" : ""}`} key={task.id} style={{animationDelay: `${index * 45}ms`}}>
              <button className={`check ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task)} aria-label={task.completed ? "Mark task incomplete" : "Complete task"}>{task.completed ? "✓" : ""}</button>
              <span className="task-title">{task.title}</span>
              <span className={`task-tag ${task.completed ? "tag-done" : ""}`}>{task.completed ? "DONE" : "TO DO"}</span>
              <button className="delete-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}>×</button>
            </article>)
          }
        </div>
        <div className="workspace-footer"><span>✦ One step at a time.</span><span>Saved to your database</span></div>
      </section>

      <footer className="page-footer"><span>BUILT WITH REACT + FASTAPI</span><span>PACKAGED FOR DOCKER <b>●</b></span></footer>
    </main>
  );
}
