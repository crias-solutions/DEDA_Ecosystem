import os
from typing import List, Dict, Any

from backend.src.database.supabase_client import supabase
from backend.src.config import settings


def generate_dag_code(pipeline_id: str, stages: List[Dict[str, Any]]) -> str:
    """Generate Airflow DAG Python code from pipeline stages."""

    stage_tasks = []
    for stage in stages:
        stage_id = stage["id"]
        image = stage["image"]
        command = stage["command"]
        depends_on = stage.get("depends_on", [])

        task_id = f"task_{stage_id.replace('-', '_')}"

        depends_task_ids = [f"task_{dep.replace('-', '_')}" for dep in depends_on]

        stage_tasks.append(
            {
                "task_id": task_id,
                "image": image,
                "command": command,
                "depends_on": depends_task_ids,
            }
        )

    dag_id = f"deda_pipeline_{pipeline_id}"

    imports = """from datetime import datetime
from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from docker.types import Mount

"""

    dag_template = f'''{dag_id}_DAG = DAG(
    dag_id="{dag_id}",
    start_date=datetime(2024, 1, 1),
    schedule_interval=None,
    catchup=False,
    default_args={{
        "owner": "deda",
        "depends_on_past": False,
    }},
)

'''

    for task in stage_tasks:
        dag_template += f'''
{task["task_id"]} = DockerOperator(
    task_id="{task["task_id"]}",
    image="{task["image"]}",
    command="{task["command"]}",
    docker_url="unix://var/run/docker.sock",
    network_mode="bridge",
    mounts=[
        Mount(source="/tmp/deda-workspace", target="/workspace", type="bind"),
    ],
    auto_remove=True,
    dag={dag_id}_DAG,
)
'''

        for dep in task["depends_on"]:
            dag_template += f"{task['task_id']}.set_upstream({dep})\n"

    return imports + dag_template


async def generate_dag(pipeline_id: str) -> Dict[str, Any]:
    """Generate and save DAG file for a pipeline."""

    pipeline_response = (
        supabase.table("pipelines").select("*").eq("id", pipeline_id).execute()
    )
    if not pipeline_response.data:
        raise ValueError("Pipeline not found")

    stages_response = (
        supabase.table("pipeline_stages")
        .select("*")
        .eq("pipeline_id", pipeline_id)
        .execute()
    )
    stages = sorted(stages_response.data, key=lambda s: s.get("order_index", 0))

    dag_code = generate_dag_code(pipeline_id, stages)

    os.makedirs(settings.dag_output_dir, exist_ok=True)

    dag_filename = f"deda_pipeline_{pipeline_id}.py"
    dag_filepath = os.path.join(settings.dag_output_dir, dag_filename)

    with open(dag_filepath, "w") as f:
        f.write(dag_code)

    return {
        "dag_id": f"deda_pipeline_{pipeline_id}",
        "file_path": dag_filepath,
        "success": True,
        "message": f"DAG generated successfully at {dag_filepath}",
    }
