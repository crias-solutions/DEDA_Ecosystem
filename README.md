# DEDA Ecosystem

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Apache Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=for-the-badge&logo=apache-airflow&logoColor=white)](https://airflow.apache.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-F77F00?style=for-the-badge&logo=mozilla)](https://opensource.org/licenses/MPL-2.0)

---

## Why

Hardware design verification is slow. Engineers waste time on repetitive simulation setups. They repeat the same steps for every project. Manual workflows lead to errors. We need automation.

DEDA Ecosystem automates hardware design verification. It turns visual pipelines into executable simulations. Engineers focus on design, not tooling.

---

## How

Users draw workflows in a visual editor. Each step becomes a Docker container. Apache Airflow orchestrates execution. Results flow back to the browser.

Three services work together:
- **Frontend**: Visual flow builder
- **Backend**: API and DAG generator
- **Airflow**: Pipeline execution engine

---

## What

DEDA Ecosystem provides three core capabilities:

1. **Visual Pipeline Builder** - Drag-and-drop design with React Flow
2. **VHDL Simulation** - GHDL analysis, elaboration, and simulation
3. **Waveform Viewer** - View signals in GTKWave

---

## Get Started

Three prerequisites:
- Supabase account
- Docker Desktop
- Git

Run three commands:

```bash
git clone https://github.com/crias-solutions/DEDA_Ecosystem.git
cd DEDA_Ecosystem
docker compose up --build
```

Open http://localhost:3000

---

## Architecture

Three layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI | React + React Flow | Visual pipeline editor |
| API | FastAPI | REST endpoints and DAG generation |
| Runtime | Apache Airflow | Container orchestration |

Three external services:
- **Supabase**: Database for pipelines and artifacts
- **Airflow**: DAG execution (local or cloud)
- **Docker**: Isolated tool containers

---

## Tech Stack

| Tool | Badge |
|------|-------|
| Python | ![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white) |
| React | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black) |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| FastAPI | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) |
| Apache Airflow | ![Airflow](https://img.shields.io/badge/Apache_Airflow-017CEE?style=flat-square&logo=apache-airflow&logoColor=white) |
| Supabase | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=black) |
| Docker | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) |
| Vite | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| Monaco Editor | ![Monaco](https://img.shields.io/badge/Monaco_Editor-F5A623?style=flat-square) |

---

## Features

Three main features:

- **Flow-Based Design** - Build pipelines visually with drag-and-drop
- **VHDL Support** - Write code in the Monaco editor with syntax highlighting
- **Automated Execution** - Generate Airflow DAGs with one click

---

## Supported EDA Tools

| Tool | Purpose | Docker Image |
|------|---------|--------------|
| GHDL | Analysis, Elaboration, Simulation | ghdl/ghdl:llvm |
| GTKWave | Waveform Visualization | gtkwave/gtkwave:latest |

| Tool | Badge |
|------|-------|
| GHDL | ![GHDL](https://img.shields.io/badge/GHDL-FF6B6B?style=flat-square) |
| GTKWave | ![GTKWave](https://img.shields.io/badge/GTKWave-4ECDC4?style=flat-square) |

---

## Example Pipeline

Three steps to create a VHDL simulation:

```
Input (VHDL file) → GHDL Analysis → GHDL Elaboration → GHDL Simulation → GTKWave View
```

---

## Documentation

Three resources:

- **README.md** - This file (overview)
- **GUIDE.md** - Step-by-step usage instructions
- **AGENTS.md** - Developer context for AI assistants

---

## License

Mozilla Public License 2.0 - See [LICENSE](LICENSE)
