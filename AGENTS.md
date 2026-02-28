# AGENTS.md

> This file provides context to OpenCode and other AI coding assistants about this project.

---

## Project Overview

**Name:** DEDA Ecosystem (Digital Electronics Design Automation)

**Description:** A visual no-code orchestration platform for automating hardware design verification workflows. Users design pipelines through drag-and-drop flow-based programming using UML Activity Diagram standards. The system translates visual workflows into executable Apache Airflow DAGs that run open-source EDA tools inside Docker containers.

**Type:** Full-stack Python Application with React Frontend

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite + React Flow)                   │
│                    Port 3000 | Visual Flow Editor                    │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                         │
│         DAG Generator | Pipeline CRUD | Supabase Client              │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloud Supabase (External)                         │
│         pipelines | pipeline_stages | dag_runs | artifacts           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│              Apache Airflow + DockerOperator (Port 8080)             │
│                     LocalExecutor                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + React Flow | Visual flow-based pipeline editor |
| Backend API | FastAPI | REST API, DAG generation |
| Database | Supabase (cloud-hosted) | Pipeline/artifact storage |
| Orchestration | Apache Airflow | DAG execution |
| Container Runtime | Docker + DockerOperator | Isolated EDA tool execution |

---

## Tech Stack

- **Backend:** Python 3.12, FastAPI, Apache Airflow, Pydantic
- **Frontend:** React 18, TypeScript, React Flow (@xyflow/react), Vite
- **Database:** Supabase (PostgreSQL)
- **Containerization:** Docker, Docker Compose
- **Testing:** pytest
- **Linting:** Ruff
- **Formatting:** Ruff

---

## Project Structure

```
DEDA_Ecosystem/
├── docker/
│   ├── docker-compose.yml           # All services configuration
│   ├── airflow/
│   │   ├── Dockerfile               # Airflow custom image
│   │   └── requirements.txt        # Airflow dependencies
│   └── scripts/
│       └── entrypoint.sh            # Container startup scripts
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry
│   │   ├── config.py               # Configuration management
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── supabase_client.py  # Supabase connection
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── pipelines.py    # Pipeline CRUD endpoints
│   │   │       └── dag_generator.py # Generate Airflow DAG
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── pipeline.py         # Pydantic schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       └── dag_builder.py      # DAG generation logic
│   ├── tests/
│   │   ├── __init__.py
│   │   └── unit/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowEditor.tsx      # React Flow canvas
│   │   │   ├── PipelineList.tsx    # Dashboard view
│   │   │   ├── StageConfig.tsx      # Stage properties panel
│   │   │   └── nodes/
│   │   │       ├── InputNode.tsx
│   │   │       ├── OutputNode.tsx
│   │   │       ├── ProcessNode.tsx
│   │   │       └── DecisionNode.tsx
│   │   ├── services/
│   │   │   ├── api.ts              # Backend API client
│   │   │   └── supabase.ts         # Supabase client
│   │   ├── types/
│   │   │   └── pipeline.ts         # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── dags/
│   └── .gitkeep                     # Generated DAGs go here
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Database schema
├── .env.example                     # Environment template
├── .gitignore
├── requirements.txt                  # Root Python deps
├── LICENSE
└── README.md
```

---

## Database Schema (Supabase)

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Pipelines table
create table pipelines (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    status text default 'draft',
    created_by text
);

-- Pipeline stages (nodes in the flow)
create table pipeline_stages (
    id uuid primary key default gen_random_uuid(),
    pipeline_id uuid references pipelines(id) on delete cascade,
    name text not null,
    tool_name text not null,
    image text not null,
    command text not null,
    depends_on jsonb default '[]',
    config jsonb default '{}',
    order_index int not null,
    position_x float default 0,
    position_y float default 0,
    created_at timestamptz default now()
);

-- DAG execution tracking
create table dag_runs (
    id uuid primary key default gen_random_uuid(),
    pipeline_id uuid references pipelines(id),
    airflow_dag_id text,
    status text default 'pending',
    started_at timestamptz,
    completed_at timestamptz,
    logs text,
    created_at timestamptz default now()
);

-- Artifacts (output files)
create table artifacts (
    id uuid primary key default gen_random_uuid(),
    dag_run_id uuid references dag_runs(id),
    stage_id uuid references pipeline_stages(id),
    filename text,
    file_path text,
    file_type text,
    created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table pipelines enable row level security;
alter table pipeline_stages enable row level security;
alter table dag_runs enable row level security;
alter table artifacts enable row level security;
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL (e.g., https://xxxxx.supabase.co) | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `AIRFLOW__CORE__DAGS_FOLDER` | Path to DAGs folder (/opt/airflow/dags) | Yes |
| `AIRFLOW__CORE__EXECUTOR` | LocalExecutor | Yes |
| `AIRFLOW__WEBSERVER__BASE_URL` | http://localhost:8080 | Yes |
| `DAG_OUTPUT_DIR` | Directory for generated DAGs | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |
| `OPENAI_API_KEY` | OpenAI API key | No |

---

## EDA Tools (VHDL/GHDL/GTKWave)

### Supported Tool Stages

| Stage Type | Tool | Docker Image | Command Template |
|------------|------|--------------|------------------|
| input | file_input | deda/input-handler:latest | Copy files to workspace |
| analysis | ghdl | ghdl/ghdl:llvm | `ghdl -a {files}` |
| elaboration | ghdl | ghdl/ghdl:llvm | `ghdl -e {entity}` |
| simulation | ghdl | ghdl/ghdl:llvm | `ghdl -r {entity} --vcd={output}` |
| visualization | gtkwave | gtkwave/gtkwave:latest | `gtkwave {vcd_file}` |

### VHDL Pipeline Example

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Input   │───▶│ Analysis │───▶│Elaborate │───▶│ Simulate  │───▶│   View   │
│ (VHDL)   │    │  (GHDL)  │    │  (GHDL)  │    │  (GHDL)   │    │ (GTKWave)│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Docker Compose Services

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| deda-frontend | build: ./frontend | 3000 | React visual editor |
| deda-backend | build: ./backend | 8000 | FastAPI REST API |
| airflow-webserver | build: ./docker/airflow | 8080 | Airflow UI |
| airflow-scheduler | build: ./docker/airflow | 8793 | DAG scheduler |
| airflow-triggerer | build: ./docker/airflow | 8800 | DAG triggerer |
| airflow-worker | build: ./docker/airflow | - | DAG worker |
| postgres-airflow | postgres:15 | 5433 | Airflow metadata DB |
| redis | redis:7 | 6379 | Airflow message queue |

---

## Coding Standards

### Python (Backend)

- Follow PEP 8
- Use type hints for all functions
- Maximum line length: 88 characters
- Use docstrings for public functions and classes
- Use Pydantic for data validation

### TypeScript/React (Frontend)

- Use functional components with hooks
- Use TypeScript for all files
- Follow React Flow node/edge patterns
- Use TanStack Query for data fetching

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name` |
| Functions | snake_case | `get_user()` |
| Classes | PascalCase | `UserManager` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Private | _prefix | `_internal_method()` |
| React Components | PascalCase | `FlowEditor` |
| TypeScript Types | PascalCase | `PipelineStage` |

---

## API Endpoints

### Pipelines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pipelines | List all pipelines |
| POST | /api/pipelines | Create new pipeline |
| GET | /api/pipelines/{id} | Get pipeline details |
| PUT | /api/pipelines/{id} | Update pipeline |
| DELETE | /api/pipelines/{id} | Delete pipeline |

### Pipeline Stages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pipelines/{id}/stages | List pipeline stages |
| POST | /api/pipelines/{id}/stages | Add stage to pipeline |
| PUT | /api/stages/{id} | Update stage |
| DELETE | /api/stages/{id} | Delete stage |

### DAG Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/pipelines/{id}/generate-dag | Generate Airflow DAG |
| POST | /api/pipelines/{id}/run | Run pipeline |

---

## Common Tasks

### Install Dependencies

```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

### Run Locally with Docker Compose

```bash
# From project root
cp .env.example .env
# Edit .env with your Supabase credentials

docker compose up --build
```

### Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Airflow UI | http://localhost:8080 |

### Run Tests

```bash
# Backend
cd backend && pytest

# With coverage
cd backend && pytest --cov=src --cov-report=term-missing
```

### Run Linter

```bash
# Backend
ruff check backend/src

# Frontend
cd frontend && npm run lint
```

---

## Testing

### Backend Tests

- Files: `tests/test_<module>.py`
- Functions: `test_<function>_<scenario>()`
- Use pytest fixtures for Supabase mocking

### Frontend Tests

- Use Vitest for unit tests
- Use React Testing Library for component tests

---

## Notes

### Development Workflow

1. Start Supabase (cloud) and get credentials
2. Run database migrations in Supabase SQL Editor
3. Start Docker Compose services
4. Create pipelines in frontend
5. Generate DAGs and run in Airflow

### Key Implementation Details

- DAGs are generated as Python files in the `dags/` directory
- Airflow reads DAGs from the mounted volume
- Each pipeline stage runs in an isolated Docker container via DockerOperator
- Artifacts are stored in Supabase and can be downloaded from the frontend

### Future Extensibility

- Add Verilator for Verilog simulation
- Add Yosys for synthesis
- Add support for multiple EDA tool versions via image tags
- Implement real-time pipeline execution monitoring

---

## Documentation Standards

### README.md Guidelines

When creating or modifying README.md, apply these frameworks:

#### The Golden Circle (Simon Sinek)

Start with **why**, then **how**, then **what**:

1. **Why** - Purpose and vision
2. **How** - Process and methodology  
3. **What** - Features and technical details

Example structure:
```
## Why [Project Name]
Hardware design automation for modern engineers.

## How It Works
Visual pipelines → DAG generation → Container execution

## What It Does
- Drag-and-drop workflow builder
- VHDL/GHDL simulation pipeline
- Waveform visualization
```

#### Diataxis Framework

Structure documentation by user intent:

| Type | Purpose | Content |
|------|---------|---------|
| **Tutorial** | Learning by doing | Step-by-step hands-on guide |
| **How-to** | Accomplish a task | Action-oriented instructions |
| **Explanation** | Understand concept | Background and context |
| **Reference** | Find facts | API, commands, schema |

#### Rule of Three

Present information in groups of three:
- 3 key features
- 3 prerequisites
- 3 steps to start
- 3 ways to contribute

#### KISS Principle

- Keep sentences short
- One idea per paragraph
- Use active voice
- Avoid jargon or explain it
- Show, don't just tell
- Use code examples

#### Badge Requirements

All badges must use matching brand colors for each tool. Use these color codes:

| Tool | Color Code | Badge Format |
|------|------------|--------------|
| Python | #3776AB | `![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)` |
| React | #61DAFB | `![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)` |
| TypeScript | #3178C6 | `![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)` |
| FastAPI | #009688 | `![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)` |
| Apache Airflow | #017CEE | `![Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=flat-square&logo=apache-airflow&logoColor=white)` |
| Supabase | #3FCF8E | `![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=black)` |
| Docker | #2496ED | `![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)` |
| Vite | #646CFF | `![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)` |
| Monaco Editor | #F5A623 | `![Monaco](https://img.shields.io/badge/Monaco_Editor-F5A623?style=flat-square&logo=monaco-editor&logoColor=black)` |
| GHDL | #FF6B6B | `![GHDL](https://img.shields.io/badge/GHDL-FF6B6B?style=flat-square)` |
| GTKWave | #4ECDC4 | `![GTKWave](https://img.shields.io/badge/GTKWave-4ECDC4?style=flat-square)` |

Example badge section:
```markdown
## Tech Stack

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Apache Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=flat-square&logo=apache-airflow&logoColor=white)](https://airflow.apache.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=black)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
```

### GUIDE.md Guidelines

Create GUIDE.md for user-focused usage documentation:

#### Content Structure

1. **Quick Start** (3 steps max)
   - Prerequisites
   - Run command
   - First action

2. **Core Concepts** (explain like I'm 5)
   - What is a pipeline?
   - What is a stage?
   - How does DAG generation work?

3. **User Workflows**
   - Create a pipeline
   - Add stages
   - Configure tools
   - Run and view results

4. **Troubleshooting**
   - Common issues
   - Solutions

#### Writing Style

- Use second person ("you")
- Write actionable steps
- Include screenshots or diagrams
- Show expected output
- Keep it skimmable with headers and lists

#### Example Template

```markdown
# DEDA Ecosystem Guide

## Get Started
1. [Prerequisite]
2. [Run]
3. [Create pipeline]

## Understanding Pipelines
[Practical explanation with diagram]

## Next Steps
- [Link to how-to]
- [Link to reference]
```
