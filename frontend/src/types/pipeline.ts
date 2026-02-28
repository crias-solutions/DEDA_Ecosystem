export interface Pipeline {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Stage {
  id: string
  pipeline_id: string
  name: string
  tool_name: string
  image: string
  command: string
  depends_on: string[]
  config: Record<string, unknown>
  order_index: number
  position_x: number
  position_y: number
  created_at: string
}

export interface PipelineWithStages extends Pipeline {
  stages: Stage[]
}
