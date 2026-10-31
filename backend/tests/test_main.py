from fastapi.testclient import TestClient

import main


def test_task_api(monkeypatch, tmp_path):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test.db")

    with TestClient(main.app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

        response = client.post(
            "/api/tasks",
            json={"title": "Complete CI/CD assignment"}
        )
        assert response.status_code == 201

        task = response.json()
        task_id = task["id"]
        assert task["title"] == "Complete CI/CD assignment"
        assert task["completed"] is False

        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert len(response.json()) == 1

        response = client.patch(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["completed"] is True

        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        response = client.get("/api/tasks")
        assert response.json() == []


def test_empty_task_title(monkeypatch, tmp_path):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "empty.db")

    with TestClient(main.app) as client:
        response = client.post(
            "/api/tasks",
            json={"title": "   "}
        )
        assert response.status_code == 422
