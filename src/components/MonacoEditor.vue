<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const editorContainer = ref(null)
let editor = null
let debounceTimer = null

// Expose setValue method for external use
function setValue(value) {
  if (editor) {
    const currentValue = editor.getValue()
    if (currentValue !== value) {
      editor.setValue(value)
    }
  }
}

defineExpose({ setValue })

onMounted(async () => {
  // Setup Monaco environment for web workers
  self.MonacoEnvironment = {
    getWorker: function (workerId, label) {
      const getWorkerModule = (url, options) => {
        return new Worker(url, {
          name: label,
          type: 'module',
          ...options
        })
      }
      if (label === 'json') {
        return getWorkerModule(
          new URL('monaco-editor/esm/vs/language/json/json.worker?worker', import.meta.url),
          {}
        )
      }
      return getWorkerModule(
        new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url),
        {}
      )
    }
  }

  const monaco = await import('monaco-editor')

  // Define custom themes
  monaco.editor.defineTheme('jsonify-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '0f172a', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '059669' },
      { token: 'number', foreground: '2563eb' },
      { token: 'keyword', foreground: 'd97706' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0f172a',
      'editor.lineHighlightBackground': '#f8fafc',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#475569',
      'editor.selectionBackground': '#bfdbfe',
      'editorBracketMatch.background': '#dbeafe',
      'editorBracketMatch.border': '#3b82f6',
    }
  })

  monaco.editor.defineTheme('jsonify-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: 'f1f5f9', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '4ade80' },
      { token: 'number', foreground: '60a5fa' },
      { token: 'keyword', foreground: 'fbbf24' },
    ],
    colors: {
      'editor.background': '#1e293b',
      'editor.foreground': '#f1f5f9',
      'editor.lineHighlightBackground': '#334155',
      'editorLineNumber.foreground': '#64748b',
      'editorLineNumber.activeForeground': '#94a3b8',
      'editor.selectionBackground': '#1e3a8a',
      'editorBracketMatch.background': '#1e3a5f',
      'editorBracketMatch.border': '#3b82f6',
    }
  })

  editor = monaco.editor.create(editorContainer.value, {
    value: jsonStore.rawInput || '',
    language: 'json',
    theme: uiStore.isDark ? 'jsonify-dark' : 'jsonify-light',
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    lineHeight: 20,
    padding: { top: 12 },
    scrollBeyondLastLine: false,
    renderLineHighlight: 'line',
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    formatOnPaste: false,
    tabSize: 2,
    wordWrap: 'on',
    automaticLayout: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderWhitespace: 'selection',
    guides: {
      bracketPairs: true,
      indentation: true
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
      useShadows: false
    }
  })

  // Listen for changes with debouncing
  editor.onDidChangeModelContent(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const value = editor.getValue()
      jsonStore.parseJson(value)
    }, 300) // 300ms debounce
  })

  // Watch theme changes
  watch(() => uiStore.isDark, (dark) => {
    monaco.editor.setTheme(dark ? 'jsonify-dark' : 'jsonify-light')
  })
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<style scoped>
.editor-container {
  flex: 1;
  overflow: hidden;
}
</style>
