<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        ref="searchInput"
        v-model="jsonStore.searchQuery"
        @input="debouncedSearch"
        @keydown.enter.exact.prevent="navigateNext"
        @keydown.shift.enter.prevent="navigatePrev"
        @keydown.escape="close"
        @keydown.down.prevent="navigateNext"
        @keydown.up.prevent="navigatePrev"
        type="text"
        placeholder="Search keys and values..."
        class="search-input"
      />
      <span v-if="jsonStore.searchResults.length" class="match-count">
        {{ jsonStore.activeSearchIndex + 1 }} / {{ jsonStore.searchResults.length }}
      </span>
      <span v-else-if="jsonStore.searchQuery" class="no-match">No matches</span>
    </div>
    
    <div class="search-actions">
      <select v-model="jsonStore.searchMode" class="search-mode" @change="debouncedSearch">
        <option value="both">Keys & Values</option>
        <option value="keys">Keys Only</option>
        <option value="values">Values Only</option>
      </select>
      
      <label class="filter-toggle" title="Filter mode - show only matching nodes">
        <input type="checkbox" v-model="jsonStore.filterMode" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter
      </label>
      
      <button class="btn btn-ghost btn-sm" @click="navigatePrev" title="Previous match (Shift+Enter / ↑)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" @click="navigateNext" title="Next match (Enter / ↓)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" @click="close" title="Close (Escape)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const searchInput = ref(null)

let debounceTimer = null

function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    jsonStore.performSearch()
  }, 200)
}

function navigateNext() {
  // If search hasn't been triggered yet (user typed then pressed Enter), perform it first
  if (jsonStore.searchQuery && jsonStore.searchResults.length === 0) {
    jsonStore.performSearch()
    return // The watcher in JsonTreeViewer will scroll to index 0
  }
  if (jsonStore.searchResults.length > 0) {
    jsonStore.nextSearchResult()
    // The watcher in JsonTreeViewer handles the scroll
  }
}

function navigatePrev() {
  if (jsonStore.searchResults.length > 0) {
    jsonStore.prevSearchResult()
  }
}

function close() {
  uiStore.showSearchBar = false
  jsonStore.searchQuery = ''
  jsonStore.searchResults = []
  jsonStore.activeSearchIndex = 0
  jsonStore.filterMode = false
}

onMounted(() => {
  searchInput.value?.focus()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--toolbar-bg);
  flex-shrink: 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px 10px;
  color: var(--text-secondary);
}

.search-input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.match-count {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.no-match {
  font-size: 12px;
  color: var(--error);
  white-space: nowrap;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-mode {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.1s;
}

.filter-toggle:hover {
  background: var(--bg-tertiary);
}

.filter-toggle input {
  display: none;
}

.filter-toggle:has(input:checked) {
  color: var(--accent);
  background: var(--accent-light);
}
</style>
