import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Stage } from '../types/pipeline'
import VhdEditor from './VhdEditor'

interface StageConfigProps {
  stage: Stage
  onClose: () => void
  onUpdate: (stage: Stage) => void
}

export default function StageConfig({ stage, onClose, onUpdate }: StageConfigProps) {
  const [name, setName] = useState(stage.name)
  const [command, setCommand] = useState(stage.command)
  const [image, setImage] = useState(stage.image)
  const [fileContent, setFileContent] = useState('')
  const [saving, setSaving] = useState(false)
  const isFileInput = stage.tool_name === 'file_input'

  useEffect(() => {
    if (isFileInput && stage.config?.content) {
      setFileContent(stage.config.content as string)
    }
  }, [stage.config, isFileInput])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData: { name: string; command: string; image: string; config?: Record<string, unknown> } = { name, command, image }
      if (isFileInput) {
        updateData.config = { content: fileContent }
      }
      const updated = await api.updateStage(stage.id, updateData)
      onUpdate(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update stage')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Stage Configuration</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tool</label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">{stage.tool_name}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Docker Image</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Command</label>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            rows={4}
          />
        </div>

        {isFileInput && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VHDL Code</label>
            <VhdEditor
              value={fileContent}
              onChange={setFileContent}
              height="300px"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depends On</label>
          <div className="text-sm text-gray-500">
            {stage.depends_on.length === 0 ? 'No dependencies' : stage.depends_on.join(', ')}
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
