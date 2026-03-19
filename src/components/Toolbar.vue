<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5c0 1.1.9 2 2 2h1"/>
          <path d="M16 21h1a2 2 0 002-2v-5c0-1.1.9-2 2-2a2 2 0 01-2-2V5a2 2 0 00-2-2h-1"/>
        </svg>
        <span class="brand-name">Jsonify</span>
      </div>
      <div class="toolbar-separator"></div>
      
      <button class="btn btn-ghost" @click="handleFormat" title="Format JSON (Ctrl+Shift+F)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        Format
      </button>
      
      <button class="btn btn-ghost" @click="handleMinify" title="Minify JSON (Ctrl+M)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        Minify
      </button>
      
      <button class="btn btn-ghost" @click="handleSort" title="Sort keys alphabetically">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        Sort Keys
      </button>

      <div class="toolbar-separator"></div>

      <button class="btn btn-ghost" @click="handleUpload()" title="Upload JSON file">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Upload
      </button>
      
      <div class="dropdown" ref="downloadDropdown">
        <button class="btn btn-ghost" @click="showDownload = !showDownload" title="Download JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="showDownload" class="dropdown-menu">
          <button class="dropdown-item" @click="handleDownload('formatted'); showDownload = false">
            Formatted JSON
          </button>
          <button class="dropdown-item" @click="handleDownload('minified'); showDownload = false">
            Minified JSON
          </button>
          <button class="dropdown-item" @click="handleDownload('raw'); showDownload = false">
            Raw JSON
          </button>
        </div>
      </div>

      <button class="btn btn-ghost" @click="handleCopy" title="Copy JSON">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy
      </button>
    </div>

    <div class="toolbar-right">
      <button class="btn btn-ghost" @click="uiStore.showSearchBar = !uiStore.showSearchBar" title="Search (Ctrl+F)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      
      <button class="btn btn-ghost" @click="uiStore.showJsonPathBar = !uiStore.showJsonPathBar" title="JSONPath Query — Extract specific data using path expressions like $.users[0].name">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span class="query-label">Query</span>
      </button>
      
      <button class="btn btn-ghost" @click="uiStore.showPinnedSidebar = !uiStore.showPinnedSidebar" title="Pinned Items">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 001 1 1 1 0 011 1z"/></svg>
        <span v-if="jsonStore.pinnedPaths.length" class="pin-count">{{ jsonStore.pinnedPaths.length }}</span>
      </button>
      
      <div class="toolbar-separator"></div>
      
      <button class="btn btn-ghost" @click="uiStore.toggleTheme()" :title="uiStore.isDark ? 'Light Mode' : 'Dark Mode'">
        <svg v-if="uiStore.isDark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      </button>
      
      <button class="btn btn-ghost" @click="uiStore.showKeyboardShortcuts = true" title="Keyboard Shortcuts (?)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const handleUpload = inject('handleUpload')
const handleDownload = inject('handleDownload')
const editorRef = inject('editorRef')

const showDownload = ref(false)
const downloadDropdown = ref(null)

function handleFormat() {
  const formatted = jsonStore.formatJson()
  if (editorRef.value?.setValue) editorRef.value.setValue(formatted)
  uiStore.notify('JSON formatted', 'success')
}

function handleMinify() {
  const minified = jsonStore.minifyJson()
  if (editorRef.value?.setValue) editorRef.value.setValue(minified)
  uiStore.notify('JSON minified', 'success')
}

function handleSort() {
  const sorted = jsonStore.sortKeys()
  if (sorted && editorRef.value?.setValue) editorRef.value.setValue(sorted)
  uiStore.notify('Keys sorted alphabetically', 'success')
}

function handleCopy() {
  if (jsonStore.formattedJson) {
    navigator.clipboard.writeText(jsonStore.formattedJson).then(() => {
      uiStore.notify('JSON copied to clipboard', 'success')
    })
  } else {
    uiStore.notify('No JSON to copy', 'warning')
  }
}

function handleClickOutside(e) {
  if (downloadDropdown.value && !downloadDropdown.value.contains(e.target)) {
    showDownload.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--toolbar-bg);
  flex-shrink: 0;
  gap: 8px;
  min-height: 44px;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  margin-right: 4px;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 4px;
  z-index: 100;
  min-width: 160px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
}

.pin-count {
  background: var(--accent);
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.query-label {
  font-size: 12px;
}
</style>
