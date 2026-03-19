<template>
  <Teleport to="body">
    <div 
      v-if="uiStore.contextMenu.show"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <div class="context-menu-item" @click="copyValue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy Value
      </div>
      <div class="context-menu-item" @click="copyPath">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        Copy Path
      </div>
      <div class="context-menu-item" @click="copyAsJson">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 002-2v-5c0-1.1.9-2 2-2a2 2 0 01-2-2V5a2 2 0 00-2-2h-1"/></svg>
        Copy as JSON
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="togglePin">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 001 1 1 1 0 011 1z"/></svg>
        {{ jsonStore.isPinned(uiStore.contextMenu.path) ? 'Unpin' : 'Pin' }} Node
      </div>
      <div class="context-menu-item" @click="expandChildren">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        Expand Children
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="searchInNode">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search in Node
      </div>
    </div>
    <!-- Click catcher to close -->
    <div 
      v-if="uiStore.contextMenu.show"
      class="context-overlay"
      @click="uiStore.hideContextMenu()"
      @contextmenu.prevent="uiStore.hideContextMenu()"
    ></div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()

const menuStyle = computed(() => {
  const { x, y } = uiStore.contextMenu
  return {
    position: 'fixed',
    left: `${Math.min(x, window.innerWidth - 220)}px`,
    top: `${Math.min(y, window.innerHeight - 300)}px`,
    zIndex: 1000
  }
})

function copyValue() {
  const path = uiStore.contextMenu.path
  const val = uiStore.contextMenu.value
  const text = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val ?? 'null')
  navigator.clipboard.writeText(text).then(() => {
    uiStore.notify('Value copied', 'success')
  })
  uiStore.hideContextMenu()
}

function copyPath() {
  navigator.clipboard.writeText(uiStore.contextMenu.path).then(() => {
    uiStore.notify('Path copied: ' + uiStore.contextMenu.path, 'success')
  })
  uiStore.hideContextMenu()
}

function copyAsJson() {
  const val = uiStore.contextMenu.value
  const json = JSON.stringify(val, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    uiStore.notify('JSON copied', 'success')
  })
  uiStore.hideContextMenu()
}

function togglePin() {
  jsonStore.togglePin(uiStore.contextMenu.path)
  uiStore.hideContextMenu()
}

function expandChildren() {
  const path = uiStore.contextMenu.path
  const value = uiStore.contextMenu.value
  if (value && typeof value === 'object') {
    const s = new Set(jsonStore.expandedNodes)
    s.add(path)
    if (Array.isArray(value)) {
      value.forEach((_, i) => {
        if (typeof value[i] === 'object' && value[i] !== null) {
          s.add(`${path}[${i}]`)
        }
      })
    } else {
      Object.keys(value).forEach(key => {
        if (typeof value[key] === 'object' && value[key] !== null) {
          s.add(`${path}.${key}`)
        }
      })
    }
    jsonStore.expandedNodes = s
  }
  uiStore.hideContextMenu()
}

function searchInNode() {
  uiStore.showSearchBar = true
  uiStore.hideContextMenu()
}
</script>

<style scoped>
.context-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}
</style>
