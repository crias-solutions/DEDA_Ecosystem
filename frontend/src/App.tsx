import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FlowEditor from './components/FlowEditor'
import PipelineList from './components/PipelineList'

function App() {
  return (
    <BrowserRouter>
      <div className="h-full w-full bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              DEDA Ecosystem
            </h1>
            <p className="text-sm text-gray-500">
              Hardware Design Automation Platform
            </p>
          </div>
        </header>
        
        <main className="h-[calc(100vh-80px)]">
          <Routes>
            <Route path="/" element={<PipelineList />} />
            <Route path="/pipeline/:id" element={<FlowEditor />} />
            <Route path="/pipeline/new" element={<FlowEditor />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
