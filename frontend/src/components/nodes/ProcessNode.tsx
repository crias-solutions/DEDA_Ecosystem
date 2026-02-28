import { Handle, Position, NodeProps } from '@xyflow/react'

export default function ProcessNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 bg-white border-2 border-blue-500 rounded-lg shadow-sm min-w-[120px]">
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <div className="text-sm font-medium text-gray-800">{data.label as string}</div>
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  )
}
