from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from backend.src.services.dag_builder import generate_dag
from backend.src.models.pipeline import DAGGenerateResponse


router = APIRouter()


@router.post(
    "/pipelines/{pipeline_id}/generate-dag", response_model=DAGGenerateResponse
)
async def generate_dag_endpoint(pipeline_id: UUID):
    """Generate Airflow DAG from pipeline stages."""
    try:
        result = await generate_dag(str(pipeline_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate DAG: {str(e)}")


@router.post("/pipelines/{pipeline_id}/run")
async def run_pipeline(pipeline_id: UUID):
    """Trigger Airflow DAG run for a pipeline."""
    try:
        await generate_dag(str(pipeline_id))
        dag_id = f"deda_pipeline_{pipeline_id}"

        return {
            "success": True,
            "message": f"DAG {dag_id} generated. Use Airflow UI to trigger execution.",
            "airflow_dag_id": dag_id,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run pipeline: {str(e)}")
