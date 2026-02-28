from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.src.api.routes import pipelines, dag_generator
from backend.src.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="DEDA Ecosystem API",
        description="Digital Electronics Design Automation - Pipeline orchestration API",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(pipelines.router, prefix="/api/pipelines", tags=["pipelines"])
    app.include_router(dag_generator.router, prefix="/api", tags=["dag-generator"])

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "supabase_url": settings.supabase_url is not None}

    return app


app = create_app()
