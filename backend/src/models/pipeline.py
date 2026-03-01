from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from typing import List


class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"


class PipelineCreate(PipelineBase):
    pass


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class Pipeline(PipelineBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True


class StageBase(BaseModel):
    name: str
    tool_name: str
    image: str
    command: str
    depends_on: List[str] = Field(default_factory=list)
    config: dict = Field(default_factory=dict)
    order_index: int
    position_x: float = 0.0
    position_y: float = 0.0


class StageCreate(StageBase):
    pipeline_id: Optional[UUID] = None


class StageUpdate(BaseModel):
    name: Optional[str] = None
    tool_name: Optional[str] = None
    image: Optional[str] = None
    command: Optional[str] = None
    depends_on: Optional[List[str]] = None
    config: Optional[dict] = None
    order_index: Optional[int] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None


class Stage(StageBase):
    id: UUID
    pipeline_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PipelineWithStages(Pipeline):
    stages: List[Stage] = []


class DAGGenerateRequest(BaseModel):
    pipeline_id: UUID


class DAGGenerateResponse(BaseModel):
    dag_id: str
    file_path: str
    success: bool
    message: str
