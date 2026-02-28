# DEDA Ecosystem Guide

## Get Started

1. **Prerequisite**: Create a Supabase project at supabase.com
2. **Run**: Execute `docker compose up --build` in the project root
3. **Access**: Open http://localhost:3000 in your browser

---

## Core Concepts

### What is a Pipeline?

A pipeline is a sequence of steps. Each step runs a tool. The tools process your hardware design.

### What is a Stage?

A stage is one step in the pipeline. It has three parts:
- **Name** - Human-readable label
- **Tool** - The Docker image to run
- **Command** - What the tool executes

### How Does DAG Generation Work?

DAG stands for Directed Acyclic Graph. It describes task dependencies. The backend converts your visual pipeline into a Python file. Airflow reads this file and executes tasks in order.

---

## User Workflows

### Create a Pipeline

1. Click **+ New Pipeline** on the dashboard
2. Enter a name for your pipeline
3. Click **Create**

### Add Stages

1. Click **+ Add Stage** in the toolbar
2. Choose a tool template from the list
3. The stage appears on the canvas

### Configure Tools

1. Click a stage node on the canvas
2. The configuration panel opens
3. Edit the name, command, or Docker image
4. For file input stages, write VHDL code in the editor
5. Click **Save**

### Connect Stages

1. Drag from one node's output handle
2. Drop onto another node's input handle
3. A connection line appears

### Generate and Run

1. Click **Generate DAG** to create the Airflow file
2. Click **Run** to trigger execution
3. View results in the Airflow UI at http://localhost:8080

---

## Supported Tools

### GHDL Stages

| Stage | Command | Description |
|-------|---------|-------------|
| Analysis | `ghdl -a {files}` | Check VHDL syntax |
| Elaboration | `ghdl -e {entity}` | Build the design |
| Simulation | `ghdl -r {entity} --vcd={output}` | Run and generate waveforms |

### GTKWave Stage

| Stage | Command | Description |
|-------|---------|-------------|
| View | `gtkwave {vcd_file}` | Display waveform |

---

## Troubleshooting

### Services Won't Start

Check that Docker Desktop is running. Verify ports 3000, 8000, and 8080 are free.

### Database Connection Failed

Ensure your `.env` file has valid Supabase credentials. The keys must match your Supabase project settings.

### DAG Not Appearing in Airflow

Check that the DAGs folder is mounted correctly. Verify the generated file exists in the `dags/` directory.

### VHDL Compilation Errors

Review your VHDL code for syntax errors. Use the Monaco editor's error highlighting. Ensure all required libraries are included.

---

## Next Steps

- Explore the [README.md](../README.md) for architecture details
- Check [AGENTS.md](../AGENTS.md) for developer context
- Visit the FastAPI docs at http://localhost:8000/docs
