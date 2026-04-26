from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.envelope import ok
from app.tasks.events import task_store

router = APIRouter()


@router.post("/demo")
async def create_demo_task():
    task = task_store.create_demo_task("demo")
    return ok({"task_id": task.task_id, "status": task.status, "progress": task.progress})


@router.get("/{task_id}/events")
async def stream_task_events(task_id: str):
    return StreamingResponse(task_store.stream(task_id), media_type="text/event-stream")
