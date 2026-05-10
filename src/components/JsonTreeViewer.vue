<template>
  <div class="tree-viewer" ref="treeContainer" @contextmenu.prevent>
    <div v-if="!jsonStore.parsedJson" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5c0 1.1.9 2 2 2h1"/>
        <path d="M16 21h1a2 2 0 002-2v-5c0-1.1.9-2 2-2a2 2 0 01-2-2V5a2 2 0 00-2-2h-1"/>
      </svg>
      <p>Paste or upload JSON to visualize</p>
    </div>
    <div v-else class="tree-root">
      <JsonTreeNode
        :data="jsonStore.parsedJson"
        :path="'$'"
        :depth="0"
        :keyName="null"
        :isLast="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, provide } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import JsonTreeNode from './JsonTreeNode.vue'

const jsonStore = useJsonStore()
const treeContainer = ref(null)

// Provide the scroll container to child nodes so they can scroll into view
provide('treeScrollContainer', treeContainer)

// Watch the search revision counter to reliably scroll to the active match node.
// Using searchRevision instead of activeSearchIndex ensures the watcher fires even when
// the index stays at 0 (e.g. repeated searches, first result navigation).
watch(() => jsonStore.searchRevision, async () => {
  if (jsonStore.searchResults.length === 0) return
  const activeResult = jsonStore.searchResults[jsonStore.activeSearchIndex]
  if (!activeResult) return

  // Expand all ancestor paths so the node is visible
  jsonStore.expandAncestors(activeResult.path)

  // Wait for DOM update after expansion
  await nextTick()
  // Small extra delay to ensure nested nodes have rendered
  await new Promise(r => setTimeout(r, 60))

  // Find the active match element and scroll to it
  const container = treeContainer.value
  if (!container) return
  const activeEl = container.querySelector('[data-tree-path="' + CSS.escape(activeResult.path) + '"]')
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
})
</script>

<style scoped>
.tree-viewer {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

/* Webkit (Chrome, Safari, Edge) custom scrollbar */
.tree-viewer::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tree-viewer::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 4px;
}

.tree-viewer::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
  border: 2px solid var(--scrollbar-track);
}

.tree-viewer::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.tree-viewer::-webkit-scrollbar-corner {
  background: var(--scrollbar-track);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.tree-root {
  min-width: fit-content;
}
</style>
