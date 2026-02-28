-- DEDA Ecosystem Database Schema
-- Run this in your Supabase SQL Editor

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

-- Allow public read access (for MVP - restrict in production)
create policy "Allow public read pipelines" on pipelines for select using (true);
create policy "Allow public insert pipelines" on pipelines for insert with check (true);
create policy "Allow public update pipelines" on pipelines for update using (true);
create policy "Allow public delete pipelines" on pipelines for delete using (true);

create policy "Allow public read stages" on pipeline_stages for select using (true);
create policy "Allow public insert stages" on pipeline_stages for insert with check (true);
create policy "Allow public update stages" on pipeline_stages for update using (true);
create policy "Allow public delete stages" on pipeline_stages for delete using (true);

create policy "Allow public read dag_runs" on dag_runs for select using (true);
create policy "Allow public insert dag_runs" on dag_runs for insert with check (true);
create policy "Allow public update dag_runs" on dag_runs for update using (true);

create policy "Allow public read artifacts" on artifacts for select using (true);
create policy "Allow public insert artifacts" on artifacts for insert with check (true);

-- Create indexes for better query performance
create index idx_pipeline_stages_pipeline_id on pipeline_stages(pipeline_id);
create index idx_dag_runs_pipeline_id on dag_runs(pipeline_id);
create index idx_artifacts_dag_run_id on artifacts(dag_run_id);
