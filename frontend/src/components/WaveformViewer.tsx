import { useState, useEffect, useRef, useCallback } from 'react'

interface VCDSignal {
  name: string
  width: number
  values: { time: number; value: string }[]
}

interface VCDParsed {
  timescale: string
  signals: VCDSignal[]
  duration: number
}

interface WaveformViewerProps {
  stageId: string
  onClose: () => void
}

const COLORS = {
  background: '#1e1e1e',
  grid: '#333333',
  signal: '#4EC9B0',
  signalName: '#D4D4D4',
  valueHigh: '#569CD6',
  valueLow: '#CE9178',
  valueX: '#808080',
  cursor: '#FFD700',
}

export default function WaveformViewer({ stageId, onClose }: WaveformViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vcdData, setVcdData] = useState<VCDParsed | null>(null)
  const [zoom, setZoom] = useState(1)
  const [scrollX, setScrollX] = useState(0)
  const [selectedSignals, setSelectedSignals] = useState<Set<number>>(new Set())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const parseVCD = (content: string): VCDParsed => {
    const lines = content.split('\n')
    const signals: VCDSignal[] = []
    const signalMap = new Map<string, VCDSignal>()
    let currentTime = 0
    let timescale = '1ns'
    let duration = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      if (line.startsWith('$timescale')) {
        const match = line.match(/\$timescale\s+(\d+)([a-z]+)/)
        if (match) {
          timescale = `${match[1]}${match[2]}`
        }
        continue
      }

      if (line.startsWith('$var')) {
        const match = line.match(/\$var\s+\w+\s+(\d+)\s+(\S+)\s+(\S+)/)
        if (match) {
          const [, width, id, name] = match
          signalMap.set(id, {
            name,
            width: parseInt(width),
            values: [],
          })
        }
        continue
      }

      if (line.startsWith('$dumpvars')) {
        continue
      }

      if (line.startsWith('$end')) {
        continue
      }

      if (line.startsWith('#')) {
        currentTime = parseInt(line.substring(1))
        duration = Math.max(duration, currentTime)
        continue
      }

      if (line.length > 1 && !line.startsWith('$')) {
        const lastChar = line[line.length - 1]
        if (lastChar === '0' || lastChar === '1' || lastChar === 'x' || lastChar === 'X' || lastChar === 'z' || lastChar === 'Z') {
          const value = lastChar
          const id = line.substring(0, line.length - 1)
          const signal = signalMap.get(id)
          if (signal) {
            signal.values.push({ time: currentTime, value })
          }
        }
      }
    }

    signalMap.forEach((signal) => signals.push(signal))
    return { timescale, signals, duration }
  }

  const fetchVCD = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/stages/${stageId}/artifacts`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No VCD file found for this stage. Run the pipeline first.')
          return
        }
        throw new Error('Failed to fetch VCD file')
      }
      
      const data = await response.json()
      
      if (!data.content) {
        setError('No VCD content found in artifact')
        return
      }
      
      const parsed = parseVCD(data.content)
      setVcdData(parsed)
      
      const allIndices = new Set<number>()
      parsed.signals.forEach((_, idx) => allIndices.add(idx))
      setSelectedSignals(allIndices)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waveform')
    } finally {
      setLoading(false)
    }
  }, [stageId])

  useEffect(() => {
    fetchVCD()
  }, [fetchVCD])

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !vcdData || selectedSignals.size === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = container.clientWidth
    const height = container.clientHeight
    canvas.width = width
    canvas.height = height

    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, width, height)

    const padding = { top: 40, right: 20, bottom: 30, left: 150 }
    const signalHeight = 30
    const signalSpacing = 10

    const visibleSignals = vcdData.signals.filter((_, idx) => selectedSignals.has(idx))
    const totalHeight = visibleSignals.length * (signalHeight + signalSpacing)
    
    ctx.fillStyle = COLORS.grid
    ctx.fillRect(padding.left, padding.top, width - padding.left - padding.right, totalHeight)

    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (width - padding.left - padding.right) * (i / 4)
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + totalHeight)
      ctx.stroke()

      const time = (vcdData.duration * (i / 4))
      ctx.fillStyle = COLORS.signalName
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${time}ns`, x, height - 10)
    }

    visibleSignals.forEach((signal, signalIdx) => {
      const y = padding.top + signalIdx * (signalHeight + signalSpacing)

      ctx.fillStyle = COLORS.signalName
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(signal.name, padding.left - 10, y + signalHeight / 2 + 4)

      const values = signal.values
      if (values.length === 0) return

      const timeScale = (width - padding.left - padding.right) / vcdData.duration

      ctx.strokeStyle = COLORS.signal
      ctx.lineWidth = 2
      ctx.beginPath()

      let currentValue = values[0].value

      ctx.moveTo(padding.left, y + signalHeight / 2)

      values.forEach((v, idx) => {
        const x = padding.left + v.time * timeScale * zoom - scrollX
        if (x < padding.left) return
        if (x > width - padding.right) return

        ctx.lineTo(x, y + signalHeight / 2)

        if (idx < values.length - 1) {
          const nextValue = values[idx + 1].value
          if (nextValue !== currentValue) {
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = nextValue === '1' ? COLORS.valueHigh : nextValue === '0' ? COLORS.valueLow : COLORS.valueX
            ctx.moveTo(x, y + signalHeight / 2)
            currentValue = nextValue
          }
        }
      })

      ctx.stroke()

      ctx.fillStyle = currentValue === '1' ? COLORS.valueHigh : currentValue === '0' ? COLORS.valueLow : COLORS.valueX
      ctx.font = '10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(currentValue, padding.left + 10, y + 12)
    })
  }, [vcdData, zoom, scrollX, selectedSignals])

  useEffect(() => {
    drawWaveform()
  }, [drawWaveform])

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((z) => Math.max(0.1, Math.min(10, z * delta)))
    } else {
      setScrollX((x) => Math.max(0, x + e.deltaX + e.deltaY))
    }
  }

  const toggleSignal = (idx: number) => {
    const newSelected = new Set(selectedSignals)
    if (newSelected.has(idx)) {
      newSelected.delete(idx)
    } else {
      newSelected.add(idx)
    }
    setSelectedSignals(newSelected)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] h-[80%] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Waveform Viewer</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Zoom:</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r overflow-y-auto p-2">
            <h3 className="text-sm font-medium mb-2">Signals</h3>
            {vcdData?.signals.map((signal, idx) => (
              <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSignals.has(idx)}
                  onChange={() => toggleSignal(idx)}
                />
                <span className="truncate">{signal.name}</span>
              </label>
            ))}
          </div>

          <div ref={containerRef} className="flex-1 overflow-hidden" onWheel={handleWheel}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading waveform...</div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
              </div>
            )}
            {!loading && !error && !vcdData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">No waveform data</div>
              </div>
            )}
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>
      </div>
    </div>
  )
}
