<template>
  <div class="compare-view">
    <div v-if="!jsonStore.parsedJson" class="empty-state">
      <p>Parse JSON first, then load a second JSON to compare</p>
    </div>
    <template v-else>
      <!-- Compare input area -->
      <div class="compare-input-section" v-if="!jsonStore.compareParsed">
        <div class="compare-prompt">
          <h3>Load Second JSON for Comparison</h3>
          <p>Paste JSON or upload a file to compare against the current JSON</p>
        </div>
        <div class="compare-actions">
          <button class="btn btn-primary" @click="pasteCompare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            Paste from Clipboard
          </button>
          <button class="btn btn-ghost" @click="uploadCompare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload File
          </button>
        </div>
        <textarea
          v-model="compareText"
          class="compare-textarea scrollbar-thin"
          placeholder="Or paste JSON here..."
          rows="10"
        ></textarea>
        <button v-if="compareText" class="btn btn-primary" @click="loadCompare" style="margin-top:8px">
          Compare
        </button>
        <div v-if="jsonStore.compareError" class="compare-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ jsonStore.compareError }}
        </div>
      </div>

      <!-- Diff results -->
      <div v-else class="diff-results scrollbar-thin">
        <div class="diff-toolbar">
          <h3 class="diff-title">
            Comparison Results
            <span class="diff-count">{{ jsonStore.diffResults?.length || 0 }} differences</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="resetCompare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear
          </button>
        </div>

        <div v-if="!jsonStore.diffResults || jsonStore.diffResults.length === 0" class="no-diff">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          <p>JSONs are identical!</p>
        </div>

        <div v-else class="diff-list">
          <div 
            v-for="diff in jsonStore.diffResults" 
            :key="diff.path"
            :class="['diff-item', 'diff-' + diff.type]"
          >
            <div class="diff-path">
              <span :class="'diff-badge diff-badge-' + diff.type">{{ diff.type }}</span>
              <code>{{ diff.path }}</code>
            </div>
            <div class="diff-values">
              <div v-if="diff.type === 'removed' || diff.type === 'changed'" class="diff-old">
                <span class="diff-label">Old:</span>
                <code>{{ formatValue(diff.oldValue) }}</code>
              </div>
              <div v-if="diff.type === 'added' || diff.type === 'changed'" class="diff-new">
                <span class="diff-label">New:</span>
                <code>{{ formatValue(diff.newValue) }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const compareText = ref('')

function loadCompare() {
  jsonStore.setCompareInput(compareText.value)
}

async function pasteCompare() {
  try {
    const text = await navigator.clipboard.readText()
    compareText.value = text
    jsonStore.setCompareInput(text)
  } catch {
    uiStore.notify('Could not read clipboard', 'error')
  }
}

function uploadCompare() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        compareText.value = ev.target.result
        jsonStore.setCompareInput(ev.target.result)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function resetCompare() {
  jsonStore.compareParsed = null
  jsonStore.compareInput = ''
  jsonStore.diffResults = null
  jsonStore.compareError = null
  compareText.value = ''
}

function formatValue(val) {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') {
    const str = JSON.stringify(val)
    return str.length > 100 ? str.substring(0, 100) + '...' : str
  }
  return String(val)
}
</script>

<style scoped>
.compare-view {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
}

.compare-input-section {
  padding: 16px;
  overflow: auto;
}

.compare-prompt {
  margin-bottom: 16px;
}

.compare-prompt h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.compare-prompt p {
  font-size: 13px;
  color: var(--text-secondary);
}

.compare-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.compare-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  resize: vertical;
  outline: none;
}

.compare-textarea:focus {
  border-color: var(--accent);
}

.compare-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--error);
  font-size: 12px;
  margin-top: 8px;
}

.diff-results {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.diff-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.diff-title {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--badge-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.no-diff {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--success);
  text-align: center;
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diff-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.diff-added {
  background: var(--diff-added);
  border-color: color-mix(in srgb, var(--success) 30%, var(--border-color));
}

.diff-removed {
  background: var(--diff-removed);
  border-color: color-mix(in srgb, var(--error) 30%, var(--border-color));
}

.diff-changed {
  background: var(--diff-changed);
  border-color: color-mix(in srgb, var(--warning) 30%, var(--border-color));
}

.diff-path {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.diff-path code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
}

.diff-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.diff-badge-added { background: var(--success); color: white; }
.diff-badge-removed { background: var(--error); color: white; }
.diff-badge-changed { background: var(--warning); color: white; }

.diff-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diff-old, .diff-new {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
}

.diff-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 30px;
}

.diff-old code, .diff-new code {
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
}
</style>
