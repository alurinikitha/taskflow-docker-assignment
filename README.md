# Taskflow – Dockerized Web Application

## Project Overview
Taskflow is a task management web application built with a React frontend and FastAPI backend. It uses SQLite to store tasks and Docker Compose to run the application services.

## Technologies Used
- Frontend: React, Vite
- Backend: Python, FastAPI
- Database: SQLite
- Containerization: Docker and Docker Compose

## Features
- Create and manage tasks
- Web-based user interface
- Backend API with FastAPI
- Persistent database storage using a Docker volume

## Project Structure
- `frontend/` – Frontend application and Dockerfile
- `backend/` – Backend application and Dockerfile
- `docker-compose.yml` – Configuration to run both services
- `README.md` – Project documentation

## Prerequisites
Install Docker Desktop and ensure it is running.

## Run the Application
Clone or download this repository, open a terminal in the project directory, and run:

```bash
docker compose up --build -d
```

Open the application:
- Frontend: http://localhost:8080
- Backend API documentation: http://localhost:8000/docs
- Backend health check: http://localhost:8000/api/health

To stop the application:

```bash
docker compose down
```

## Docker Hub Images
- Frontend: https://hub.docker.com/r/nikithaalurii/docker-task-manager-frontend
- Backend: https://hub.docker.com/r/nikithaalurii/docker-task-manager-backend

Image tag: `1.0`

## Database Persistence
The SQLite database is stored using a Docker volume so the data can persist when the containers are stopped and restarted.

## Author
Student project – Docker containerization assignment.
