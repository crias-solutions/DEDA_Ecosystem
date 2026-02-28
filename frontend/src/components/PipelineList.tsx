import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Pipeline } from '../types/pipeline'
import { loadExamplePipeline } from './PipelineExamples'

export default function PipelineList() {
  const navigate = useNavigate()
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [loadingExample, setLoadingExample] = useState(false)

  useEffect(() => {
    loadPipelines()
  }, [])

  const loadPipelines = async () => {
    try {
      setLoading(true)
      const data = await api.listPipelines()
      setPipelines(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pipelines')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createPipeline({ name: newName, description: newDescription })
      setNewName('')
      setNewDescription('')
      setShowCreate(false)
      loadPipelines()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pipeline')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pipeline?')) return
    try {
      await api.deletePipeline(id)
      loadPipelines()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pipeline')
    }
  }

  const handleLoadExample = async () => {
    try {
      setLoadingExample(true)
      const pipelineId = await loadExamplePipeline()
      navigate(`/pipeline/${pipelineId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load example')
    } finally {
      setLoadingExample(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading pipelines...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Pipelines</h2>
        <div className="flex gap-2">
          <button
            onClick={handleLoadExample}
            disabled={loadingExample}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loadingExample ? 'Loading...' : 'Load Example'}
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreate ? 'Cancel' : 'New Pipeline'}
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create
          </button>
        </form>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {pipelines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No pipelines yet. Create your first pipeline to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <Link to={`/pipeline/${pipeline.id}`} className="block">
                <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600">
                  {pipeline.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {pipeline.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  pipeline.status === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : pipeline.status === 'draft'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {pipeline.status}
                </span>
                <button
                  onClick={() => handleDelete(pipeline.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
