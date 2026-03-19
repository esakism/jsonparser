<template>
  <div class="app-container" :class="{ dark: uiStore.isDark }">
    <!-- Toolbar -->
    <Toolbar />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Search Bar -->
      <SearchBar v-if="uiStore.showSearchBar" />
      
      <!-- JSON Path Bar -->
      <JsonPathBar v-if="uiStore.showJsonPathBar" />
      
      <!-- Split Panels -->
      <div class="panels-wrapper">
        <!-- Left Panel: Editor -->
        <div class="panel left-panel" :style="{ width: uiStore.leftPanelWidth + '%' }">
          <div class="panel-header">
            <div class="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
              <span>Editor</span>
              <span v-if="jsonStore.fileName" class="file-badge">{{ jsonStore.fileName }}</span>
            </div>
            <div class="panel-actions">
              <span v-if="jsonStore.isValid" class="status-valid">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                Valid
              </span>
              <span v-else-if="jsonStore.parseError && !jsonStore.parseError.recovered" class="status-invalid">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Invalid
              </span>
              <span v-if="jsonStore.parseError && jsonStore.parseError.recovered" class="status-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Auto-fixed
              </span>
            </div>
          </div>
          <MonacoEditor ref="editorRef" />
          <!-- Error message -->
          <div v-if="jsonStore.parseError && !jsonStore.parseError.recovered" class="error-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{{ jsonStore.parseError.message }}</span>
            <span v-if="jsonStore.parseError.line" class="error-location">
              Line {{ jsonStore.parseError.line }}, Col {{ jsonStore.parseError.column }}
            </span>
          </div>
          <div v-else-if="jsonStore.parseError && jsonStore.parseError.recovered" class="warning-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{{ jsonStore.parseError.message }}</span>
          </div>
          <!-- Drop overlay -->
          <div v-if="isDraggingFile" class="drop-overlay">
            <div class="drop-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Drop JSON file here</span>
            </div>
          </div>
        </div>

        <!-- Resizer -->
        <div 
          class="resizer" 
          :class="{ active: isResizing }"
          @mousedown="startResize"
        ></div>

        <!-- Right Panel: Viewer / Tabs -->
        <div class="panel right-panel" :style="{ width: (100 - uiStore.leftPanelWidth) + '%' }">
          <div class="panel-header">
            <div class="tab-bar">
              <button 
                class="tab-btn" 
                :class="{ active: jsonStore.activeTab === 'viewer' }"
                @click="jsonStore.activeTab = 'viewer'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Viewer
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: jsonStore.activeTab === 'schema' }"
                @click="jsonStore.activeTab = 'schema'; jsonStore.generateSchemaFromJson()"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Schema
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: jsonStore.activeTab === 'compare' }"
                @click="jsonStore.activeTab = 'compare'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Compare
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: jsonStore.activeTab === 'stats' }"
                @click="jsonStore.activeTab = 'stats'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 8v4l3 3"/></svg>
                Stats
              </button>
            </div>
            <div class="panel-actions" v-if="jsonStore.activeTab === 'viewer'">
              <button class="btn btn-ghost btn-sm" @click="jsonStore.expandAll()" data-tooltip="Expand All" title="Expand All">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm" @click="jsonStore.collapseAll()" data-tooltip="Collapse All" title="Collapse All">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <select class="depth-select" v-model.number="depthLevel" @change="jsonStore.expandToDepth(depthLevel)" title="Expand depth">
                <option :value="0">Depth 0</option>
                <option :value="1">Depth 1</option>
                <option :value="2">Depth 2</option>
                <option :value="3">Depth 3</option>
                <option :value="5">Depth 5</option>
                <option :value="10">Depth 10</option>
                <option :value="999">All</option>
              </select>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <JsonTreeViewer v-if="jsonStore.activeTab === 'viewer'" />
            <SchemaViewer v-else-if="jsonStore.activeTab === 'schema'" />
            <CompareView v-else-if="jsonStore.activeTab === 'compare'" />
            <StatsPanel v-else-if="jsonStore.activeTab === 'stats'" />
          </div>
        </div>

        <!-- Pinned Sidebar -->
        <PinnedSidebar v-if="uiStore.showPinnedSidebar" />
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu />

    <!-- Notifications -->
    <NotificationArea />

    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal v-if="uiStore.showKeyboardShortcuts" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useJsonStore } from './stores/jsonStore'
import { useUiStore } from './stores/uiStore'
import Toolbar from './components/Toolbar.vue'
import MonacoEditor from './components/MonacoEditor.vue'
import JsonTreeViewer from './components/JsonTreeViewer.vue'
import SearchBar from './components/SearchBar.vue'
import JsonPathBar from './components/JsonPathBar.vue'
import SchemaViewer from './components/SchemaViewer.vue'
import CompareView from './components/CompareView.vue'
import StatsPanel from './components/StatsPanel.vue'
import PinnedSidebar from './components/PinnedSidebar.vue'
import ContextMenu from './components/ContextMenu.vue'
import NotificationArea from './components/NotificationArea.vue'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.vue'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const editorRef = ref(null)
const isResizing = ref(false)
const isDraggingFile = ref(false)
const depthLevel = ref(2)

// Resizer logic
function startResize(e) {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = uiStore.leftPanelWidth
  
  function onMove(ev) {
    const dx = ev.clientX - startX
    const containerWidth = document.querySelector('.panels-wrapper').offsetWidth
    const pct = startWidth + (dx / containerWidth) * 100
    uiStore.setLeftPanelWidth(pct)
  }
  
  function onUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// Drag & Drop
function onDragOver(e) {
  e.preventDefault()
  isDraggingFile.value = true
}
function onDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDraggingFile.value = false
  }
}
function onDrop(e) {
  e.preventDefault()
  isDraggingFile.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  if (!file.name.endsWith('.json') && !file.type.includes('json') && !file.type.includes('text')) {
    uiStore.notify('Please upload a JSON file', 'error')
    return
  }
  jsonStore.fileName = file.name
  jsonStore.fileSize = file.size
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    jsonStore.parseJson(content)
    if (editorRef.value?.setValue) {
      editorRef.value.setValue(content)
    }
  }
  reader.readAsText(file)
}

// Keyboard shortcuts
function onKeyDown(e) {
  // Ctrl+Shift+F: Format
  if (e.ctrlKey && e.shiftKey && e.key === 'F') {
    e.preventDefault()
    const formatted = jsonStore.formatJson()
    if (editorRef.value?.setValue) editorRef.value.setValue(formatted)
    uiStore.notify('JSON formatted', 'success')
  }
  // Ctrl+F: Search
  if (e.ctrlKey && !e.shiftKey && e.key === 'f') {
    e.preventDefault()
    uiStore.showSearchBar = !uiStore.showSearchBar
  }
  // Ctrl+M: Minify
  if (e.ctrlKey && e.key === 'm') {
    e.preventDefault()
    const minified = jsonStore.minifyJson()
    if (editorRef.value?.setValue) editorRef.value.setValue(minified)
    uiStore.notify('JSON minified', 'success')
  }
  // Ctrl+Z: Undo
  if (e.ctrlKey && !e.shiftKey && e.key === 'z' && !e.target.closest('.monaco-editor')) {
    e.preventDefault()
    const val = jsonStore.undo()
    if (val !== null && editorRef.value?.setValue) editorRef.value.setValue(val)
  }
  // Ctrl+Shift+Z or Ctrl+Y: Redo
  if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
    if (!e.target.closest('.monaco-editor')) {
      e.preventDefault()
      const val = jsonStore.redo()
      if (val !== null && editorRef.value?.setValue) editorRef.value.setValue(val)
    }
  }
  // Escape: close modals
  if (e.key === 'Escape') {
    uiStore.showSearchBar = false
    uiStore.showJsonPathBar = false
    uiStore.showKeyboardShortcuts = false
    uiStore.hideContextMenu()
  }
  // ?: Show shortcuts
  if (e.key === '?' && !e.target.closest('input, textarea, .monaco-editor')) {
    uiStore.showKeyboardShortcuts = !uiStore.showKeyboardShortcuts
  }
}

// Expose file handler for toolbar
function handleUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json,text/plain'
  input.onchange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0])
  }
  input.click()
}

function handleDownload(type = 'formatted') {
  let content = ''
  let filename = 'data.json'
  if (type === 'formatted') {
    content = jsonStore.formattedJson
    filename = 'formatted.json'
  } else if (type === 'minified') {
    content = jsonStore.minifiedJson
    filename = 'minified.json'
  } else {
    content = jsonStore.rawInput
    filename = jsonStore.fileName || 'raw.json'
  }
  if (!content) {
    uiStore.notify('No JSON to download', 'warning')
    return
  }
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  uiStore.notify(`Downloaded ${filename}`, 'success')
}

// Provide handlers globally
import { provide } from 'vue'
provide('handleUpload', handleUpload)
provide('handleDownload', handleDownload)
provide('editorRef', editorRef)
provide('handleFile', handleFile)

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('dragover', onDragOver)
  document.addEventListener('dragleave', onDragLeave)
  document.addEventListener('drop', onDrop)
  
  // Initialize with sample JSON
  const sample = JSON.stringify({
    "name": "Jsonify",
    "version": "1.0.0",
    "description": "Advanced JSON Parser & Viewer",
    "features": ["Tree View", "Search", "Schema Generator", "Compare Mode", "Dark Theme"],
    "author": {
      "name": "Developer",
      "email": "dev@example.com"
    },
    "settings": {
      "theme": "dark",
      "autoFormat": true,
      "maxFileSize": "50MB"
    },
    "stats": {
      "users": 12500,
      "rating": 4.8,
      "premium": false,
      "tags": null
    }
  }, null, 2)
  
  jsonStore.parseJson(sample)
  jsonStore.expandToDepth(2)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('dragover', onDragOver)
  document.removeEventListener('dragleave', onDragLeave)
  document.removeEventListener('drop', onDrop)
})
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panels-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--toolbar-bg);
  min-height: 38px;
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.file-badge {
  background: var(--badge-bg);
  color: var(--badge-text);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-sm {
  padding: 4px 6px !important;
  font-size: 12px !important;
}

.status-valid {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--success);
  font-size: 12px;
  font-weight: 500;
}

.status-invalid {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--error);
  font-size: 12px;
  font-weight: 500;
}

.status-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--warning);
  font-size: 12px;
  font-weight: 500;
}

.error-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--error) 10%, transparent);
  color: var(--error);
  font-size: 12px;
  border-top: 1px solid color-mix(in srgb, var(--error) 20%, transparent);
  flex-shrink: 0;
}

.error-location {
  margin-left: auto;
  opacity: 0.8;
  font-family: 'JetBrains Mono', monospace;
}

.warning-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--warning) 10%, transparent);
  color: var(--warning);
  font-size: 12px;
  border-top: 1px solid color-mix(in srgb, var(--warning) 20%, transparent);
  flex-shrink: 0;
}

.tab-bar {
  display: flex;
  gap: 2px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
}

.tab-btn.active {
  background: var(--accent);
  color: white;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.depth-select {
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 11px;
  cursor: pointer;
  outline: none;
}

.drop-overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--accent) 15%, var(--bg-primary) 85%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border: 2px dashed var(--accent);
  border-radius: 8px;
  margin: 8px;
}

.drop-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--accent);
  font-size: 16px;
  font-weight: 600;
}
</style>
