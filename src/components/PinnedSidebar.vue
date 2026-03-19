<template>
  <div class="pinned-sidebar scrollbar-thin">
    <div class="sidebar-header">
      <h3>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 17v5"/><path d="M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 001 1 1 1 0 011 1z"/>
        </svg>
        Pinned Items
      </h3>
      <button class="btn btn-ghost btn-sm" @click="uiStore.showPinnedSidebar = false">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div v-if="jsonStore.pinnedPaths.length === 0" class="empty-pins">
      <p>No pinned items yet</p>
      <p class="hint">Click the pin icon on any node to pin it</p>
    </div>

    <div v-else class="pin-list">
      <div 
        v-for="path in jsonStore.pinnedPaths" 
        :key="path"
        class="pin-item"
      >
        <div class="pin-path" @click="copyPath(path)">
          <code>{{ path }}</code>
        </div>
        <div class="pin-value">
          {{ formatValue(jsonStore.getValueAtPath(path)) }}
        </div>
        <div class="pin-actions">
          <button class="btn btn-ghost btn-sm" @click="copyValue(path)" title="Copy value">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" @click="jsonStore.togglePin(path)" title="Unpin">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()

function formatValue(val) {
  if (val === undefined) return 'undefined'
  if (val === null) return 'null'
  if (typeof val === 'object') {
    const str = JSON.stringify(val)
    return str.length > 80 ? str.substring(0, 80) + '...' : str
  }
  return String(val)
}

function copyPath(path) {
  navigator.clipboard.writeText(path).then(() => {
    uiStore.notify('Path copied', 'success')
  })
}

function copyValue(path) {
  const val = jsonStore.getValueAtPath(path)
  const text = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
  navigator.clipboard.writeText(text).then(() => {
    uiStore.notify('Value copied', 'success')
  })
}
</script>

<style scoped>
.pinned-sidebar {
  width: 280px;
  border-left: 1px solid var(--border-color);
  background: var(--panel-bg);
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar-header h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-pins {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.hint {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.pin-list {
  padding: 8px;
}

.pin-item {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 6px;
  transition: background 0.1s;
}

.pin-item:hover {
  background: var(--bg-secondary);
}

.pin-path {
  cursor: pointer;
  margin-bottom: 4px;
}

.pin-path code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent);
  word-break: break-all;
}

.pin-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-secondary);
  word-break: break-all;
  margin-bottom: 4px;
}

.pin-actions {
  display: flex;
  gap: 4px;
}
</style>
