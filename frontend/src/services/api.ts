const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

import type { Pipeline, PipelineWithStages, Stage } from '../types/pipeline'

export interface CreatePipelineRequest {
  name: string
  description?: string
}

export interface CreateStageRequest {
  name: string
  tool_name: string
  image: string
  command: string
  depends_on?: string[]
  config?: Record<string, unknown>
  order_index: number
  position_x?: number
  position_y?: number
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  
  if (response.status === 204) {
    return undefined as T
  }
  
  return response.json()
}

export const api = {
  listPipelines: () => fetchJson<Pipeline[]>(`${API_URL}/api/pipelines`),
  
  getPipeline: (id: string) => fetchJson<PipelineWithStages>(`${API_URL}/api/pipelines/${id}`),
  
  createPipeline: (data: CreatePipelineRequest) => 
    fetchJson<Pipeline>(`${API_URL}/api/pipelines`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updatePipeline: (id: string, data: Partial<CreatePipelineRequest>) =>
    fetchJson<Pipeline>(`${API_URL}/api/pipelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deletePipeline: (id: string) =>
    fetchJson<void>(`${API_URL}/api/pipelines/${id}`, { method: 'DELETE' }),
  
  listStages: (pipelineId: string) =>
    fetchJson<Stage[]>(`${API_URL}/api/pipelines/${pipelineId}/stages`),
  
  createStage: (pipelineId: string, data: CreateStageRequest) =>
    fetchJson<Stage>(`${API_URL}/api/pipelines/${pipelineId}/stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStage: (stageId: string, data: Partial<CreateStageRequest>) =>
    fetchJson<Stage>(`${API_URL}/api/pipelines/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteStage: (stageId: string) =>
    fetchJson<void>(`${API_URL}/api/pipelines/stages/${stageId}`, { method: 'DELETE' }),
  
  generateDag: (pipelineId: string) =>
    fetchJson<{ dag_id: string; file_path: string; success: boolean; message: string }>(
      `${API_URL}/api/pipelines/${pipelineId}/generate-dag`,
      { method: 'POST' }
    ),
  
  runPipeline: (pipelineId: string) =>
    fetchJson<{ success: boolean; message: string; airflow_dag_id: string }>(
      `${API_URL}/api/pipelines/${pipelineId}/run`,
      { method: 'POST' }
    ),
}
