from uuid import UUID
from typing import List
from fastapi import APIRouter, HTTPException, status

from backend.src.database.supabase_client import supabase
from backend.src.models.pipeline import (
    Pipeline,
    PipelineCreate,
    PipelineUpdate,
    PipelineWithStages,
    Stage,
    StageCreate,
    StageUpdate,
)


router = APIRouter()


@router.get("", response_model=List[Pipeline])
async def list_pipelines():
    response = supabase.table("pipelines").select("*").execute()
    return response.data


@router.post("", response_model=Pipeline, status_code=status.HTTP_201_CREATED)
async def create_pipeline(pipeline: PipelineCreate):
    data = pipeline.model_dump()
    response = supabase.table("pipelines").insert(data).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=400, detail="Failed to create pipeline")


@router.get("/{pipeline_id}", response_model=PipelineWithStages)
async def get_pipeline(pipeline_id: UUID):
    pipeline_response = (
        supabase.table("pipelines").select("*").eq("id", str(pipeline_id)).execute()
    )
    if not pipeline_response.data:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    pipeline = pipeline_response.data[0]

    stages_response = (
        supabase.table("pipeline_stages")
        .select("*")
        .eq("pipeline_id", str(pipeline_id))
        .execute()
    )
    pipeline["stages"] = stages_response.data

    return pipeline


@router.put("/{pipeline_id}", response_model=Pipeline)
async def update_pipeline(pipeline_id: UUID, pipeline: PipelineUpdate):
    data = pipeline.model_dump(exclude_unset=True)
    data["updated_at"] = "now()"

    response = (
        supabase.table("pipelines").update(data).eq("id", str(pipeline_id)).execute()
    )
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=404, detail="Pipeline not found")


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pipeline(pipeline_id: UUID):
    supabase.table("pipelines").delete().eq("id", str(pipeline_id)).execute()
    return None


@router.get("/{pipeline_id}/stages", response_model=List[Stage])
async def list_stages(pipeline_id: UUID):
    response = (
        supabase.table("pipeline_stages")
        .select("*")
        .eq("pipeline_id", str(pipeline_id))
        .execute()
    )
    return response.data


@router.post(
    "/{pipeline_id}/stages", response_model=Stage, status_code=status.HTTP_201_CREATED
)
async def create_stage(pipeline_id: UUID, stage: StageCreate):
    data = stage.model_dump()
    data["pipeline_id"] = str(pipeline_id)
    response = supabase.table("pipeline_stages").insert(data).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=400, detail="Failed to create stage")


@router.put("/stages/{stage_id}", response_model=Stage)
async def update_stage(stage_id: UUID, stage: StageUpdate):
    data = stage.model_dump(exclude_unset=True)
    response = (
        supabase.table("pipeline_stages").update(data).eq("id", str(stage_id)).execute()
    )
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=404, detail="Stage not found")


@router.delete("/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stage(stage_id: UUID):
    supabase.table("pipeline_stages").delete().eq("id", str(stage_id)).execute()
    return None


@router.get("/stages/{stage_id}/artifacts")
async def get_stage_artifacts(stage_id: UUID):
    """Fetch the VCD artifact for a specific stage."""
    response = (
        supabase.table("artifacts")
        .select("*")
        .eq("stage_id", str(stage_id))
        .eq("file_type", "vcd")
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404, detail="No VCD artifact found for this stage"
        )

    artifact = response.data[0]

    if artifact.get("file_path"):
        try:
            with open(artifact["file_path"], "r") as f:
                content = f.read()
            return {"filename": artifact["filename"], "content": content}
        except FileNotFoundError:
            pass

    return {"filename": artifact["filename"], "content": None}
