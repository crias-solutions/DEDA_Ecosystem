import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { api } from '../services/api'
import type { PipelineWithStages, Stage } from '../types/pipeline'
import ProcessNode from './nodes/ProcessNode'
import InputNode from './nodes/InputNode'
import OutputNode from './nodes/OutputNode'
import StageConfig from './StageConfig'

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
}

interface ToolTemplate {
  name: string
  tool_name: string
  image: string
  command_template: string
}

const toolTemplates: ToolTemplate[] = [
  { name: 'GHDL Analysis', tool_name: 'ghdl', image: 'ghdl/ghdl:llvm', command_template: 'ghdl -a {files}' },
  { name: 'GHDL Elaboration', tool_name: 'ghdl', image: 'ghdl/ghdl:llvm', command_template: 'ghdl -e {entity}' },
  { name: 'GHDL Simulation', tool_name: 'ghdl', image: 'ghdl/ghdl:llvm', command_template: 'ghdl -r {entity} --vcd={output}' },
  { name: 'GTKWave View', tool_name: 'gtkwave', image: 'gtkwave/gtkwave:latest', command_template: 'gtkwave {vcd_file}' },
]

export default function FlowEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pipeline, setPipeline] = useState<PipelineWithStages | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (!isNew && id) {
      loadPipeline(id)
    } else {
      setLoading(false)
    }
  }, [id, isNew])

  const loadPipeline = async (pipelineId: string) => {
    try {
      setLoading(true)
      const data = await api.getPipeline(pipelineId)
      setPipeline(data)
      convertStagesToNodes(data.stages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const convertStagesToNodes = (stages: Stage[]) => {
    const newNodes: Node[] = stages.map((stage, index) => ({
      id: stage.id,
      type: getNodeType(stage.tool_name),
      position: { x: stage.position_x || 100 + index * 200, y: stage.position_y || 100 },
      data: { label: stage.name, stage },
    }))

    const newEdges: Edge[] = []
    stages.forEach((stage) => {
      stage.depends_on.forEach((depId) => {
        newEdges.push({
          id: `${depId}-${stage.id}`,
          source: depId,
          target: stage.id,
          animated: true,
        })
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const getNodeType = (toolName: string): string => {
    if (toolName === 'file_input') return 'input'
    if (toolName === 'gtkwave') return 'output'
    return 'process'
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddStage = async (template: ToolTemplate) => {
    if (!pipeline) {
      const newPipeline = await api.createPipeline({ name: 'New Pipeline' })
      navigate(`/pipeline/${newPipeline.id}`)
      return
    }

    const stageCount = pipeline.stages.length
    const newStage = await api.createStage(pipeline.id, {
      name: template.name,
      tool_name: template.tool_name,
      image: template.image,
      command: template.command_template,
      order_index: stageCount,
      position_x: 100 + stageCount * 200,
      position_y: 100,
    })

    const newNode: Node = {
      id: newStage.id,
      type: getNodeType(newStage.tool_name),
      position: { x: newStage.position_x, y: newStage.position_y },
      data: { label: newStage.name, stage: newStage },
    }

    setNodes((nds) => [...nds, newNode])
    setShowAddPanel(false)
  }

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.data.stage) {
      setSelectedStage(node.data.stage as Stage)
    }
  }

  const handleGenerateDag = async () => {
    if (!pipeline) return
    try {
      const result = await api.generateDag(pipeline.id)
      alert(`DAG generated: ${result.message}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate DAG')
    }
  }

  const handleRunPipeline = async () => {
    if (!pipeline) return
    try {
      const result = await api.runPipeline(pipeline.id)
      alert(result.message)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to run pipeline')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            + Add Stage
          </button>
          {pipeline && (
            <>
              <button
                onClick={handleGenerateDag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Generate DAG
              </button>
              <button
                onClick={handleRunPipeline}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Run
              </button>
            </>
          )}
        </div>

        {showAddPanel && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
            <h3 className="font-semibold text-gray-700 mb-3">Add Stage</h3>
            <div className="space-y-2">
              {toolTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleAddStage(template)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-700">{template.name}</div>
                  <div className="text-xs text-gray-500 truncate">{template.image}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedStage && (
        <StageConfig
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
          onUpdate={(updated) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === updated.id
                  ? { ...n, data: { ...n.data, label: updated.name, stage: updated } }
                  : n
              )
            )
            setSelectedStage(null)
          }}
        />
      )}
    </div>
  )
}
