import { useRef } from 'react'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'

interface VhdEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  height?: string
}

const VHDL_KEYWORDS = [
  'abs', 'access', 'after', 'alias', 'all', 'and', 'architecture', 'array',
  'assert', 'attribute', 'begin', 'block', 'body', 'buffer', 'bus', 'case',
  'component', 'configuration', 'constant', 'disconnect', 'downto', 'else',
  'elsif', 'end', 'entity', 'exit', 'file', 'for', 'function', 'generate',
  'generic', 'group', 'guarded', 'if', 'impure', 'in', 'inertial', 'inout',
  'is', 'label', 'library', 'linkage', 'literal', 'loop', 'map', 'mod',
  'nand', 'new', 'next', 'nor', 'not', 'null', 'of', 'on', 'open', 'or',
  'others', 'out', 'package', 'port', 'postponed', 'procedure', 'process',
  'pure', 'range', 'record', 'register', 'reject', 'rem', 'report', 'return',
  'rol', 'ror', 'select', 'severity', 'shared', 'signal', 'sla', 'sll',
  'sra', 'srl', 'subtype', 'then', 'to', 'transport', 'type', 'unaffected',
  'units', 'until', 'use', 'variable', 'wait', 'when', 'while', 'with', 'xnor', 'xor'
]

const VHDL_TYPES = [
  'bit', 'bit_vector', 'boolean', 'character', 'integer', 'natural',
  'positive', 'real', 'std_logic', 'std_logic_vector', 'std_ulogic',
  'std_ulogic_vector', 'string', 'time', 'unsigned', 'signed'
]

const registerVhdLanguage = (monaco: Monaco) => {
  if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'vhdl')) {
    monaco.languages.register({ id: 'vhdl' })

    monaco.languages.setMonarchTokensProvider('vhdl', {
      ignoreCase: true,
      keywords: VHDL_KEYWORDS,
      typeKeywords: VHDL_TYPES,
      operators: [
        '<=', '=>', ':=', '/=', '>=', '<<', '>>', '**', '&', '|', ':', '=', '<', '>', '+', '-', '*', '/'
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier'
            }
          }],
          [/'[^']*'/, 'string'],
          [/"[^"]*"/, 'string'],
          [/\d+/, 'number'],
          [/\d+\.\d+/, 'number.float'],
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\-\-.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    })

    monaco.languages.setLanguageConfiguration('vhdl', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    })

    monaco.editor.defineTheme('vhdl-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'operator', foreground: 'D4D4D4' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editorLineNumber.foreground': '#858585',
        'editorCursor.foreground': '#aeafad'
      }
    })
  }
}

export default function VhdEditor({ value, onChange, readOnly = false, height = '400px' }: VhdEditorProps) {
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    registerVhdLanguage(monaco)
    monaco.editor.setTheme('vhdl-dark')
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="vhdl"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme="vhdl-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true }
        }}
      />
    </div>
  )
}
