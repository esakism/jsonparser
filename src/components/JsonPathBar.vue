<template>
  <div class="jsonpath-bar">
    <div class="jsonpath-input-wrapper">
      <div class="jsonpath-label-row">
        <span class="jsonpath-label">JSONPath Query</span>
        <button class="help-btn" @click="showHelp = !showHelp" title="What is JSONPath?">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>
      <div class="jsonpath-input-row">
        <input
          ref="pathInput"
          v-model="query"
          @input="debouncedQuery"
          @keydown.enter="execute"
          @keydown.escape="close"
          type="text"
          placeholder="e.g. $.store.book[0].title or $..price"
          class="jsonpath-input"
        />
        <button class="btn btn-primary btn-sm" @click="execute">Run Query</button>
      </div>
    </div>
    
    <!-- Help / Explanation Panel -->
    <div v-if="showHelp" class="jsonpath-help">
      <div class="help-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        What is JSONPath Query?
      </div>
      <p class="help-desc">
        JSONPath lets you <strong>extract specific data</strong> from your JSON without manually
        digging through nested objects. Think of it like a search address for your data — 
        you type a path expression and it returns exactly the value(s) you need.
      </p>
      <div class="help-examples">
        <div class="help-example" @click="query = '$.name'; execute()"><code>$.name</code><span>Get the "name" field at root</span></div>
        <div class="help-example" @click="query = '$.features[0]'; execute()"><code>$.features[0]</code><span>First item in the "features" array</span></div>
        <div class="help-example" @click="query = '$..email'; execute()"><code>$..email</code><span>Find all "email" fields at any depth</span></div>
        <div class="help-example" @click="query = '$.settings.*'; execute()"><code>$.settings.*</code><span>All values inside "settings"</span></div>
      </div>
      <p class="help-hint">💡 Click any example above to try it instantly.</p>
    </div>
    
    <div v-if="jsonStore.jsonPathResult !== null" class="jsonpath-result">
      <div class="result-header">
        <span class="result-label">Result:</span>
        <button class="btn btn-ghost btn-sm" @click="copyResult" title="Copy result">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy
        </button>
      </div>
      <pre class="result-content scrollbar-thin">{{ formattedResult }}</pre>
    </div>
    
    <div v-if="jsonStore.jsonPathError" class="jsonpath-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ jsonStore.jsonPathError }}
    </div>
    
    <button class="close-btn" @click="close" title="Close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()
const pathInput = ref(null)
const query = ref(jsonStore.jsonPathQuery)
const showHelp = ref(false)

let debounceTimer = null

const formattedResult = computed(() => {
  if (jsonStore.jsonPathResult === null || jsonStore.jsonPathResult === undefined) return ''
  if (typeof jsonStore.jsonPathResult === 'object') {
    return JSON.stringify(jsonStore.jsonPathResult, null, 2)
  }
  return String(jsonStore.jsonPathResult)
})

function debouncedQuery() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(execute, 500)
}

function execute() {
  jsonStore.executeJsonPath(query.value)
}

function copyResult() {
  navigator.clipboard.writeText(formattedResult.value).then(() => {
    uiStore.notify('Result copied', 'success')
  })
}

function close() {
  uiStore.showJsonPathBar = false
  jsonStore.jsonPathResult = null
  jsonStore.jsonPathError = null
  showHelp.value = false
}

onMounted(() => {
  pathInput.value?.focus()
})
</script>

<style scoped>
.jsonpath-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--toolbar-bg);
  flex-shrink: 0;
  position: relative;
}

.jsonpath-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 300px;
}

.jsonpath-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.jsonpath-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
}

.help-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.15s;
}
.help-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent);
}

.jsonpath-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jsonpath-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  outline: none;
}

.jsonpath-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}

/* Help / Explanation Panel */
.jsonpath-help {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 2px;
}

.help-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 8px;
}

.help-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.help-desc strong {
  color: var(--text-primary);
}

.help-examples {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.help-example {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.help-example:hover {
  background: var(--bg-tertiary);
}

.help-example code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-light);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  min-width: 140px;
}

.help-example span {
  font-size: 12px;
  color: var(--text-muted);
}

.help-hint {
  font-size: 11.5px;
  color: var(--text-muted);
  font-style: italic;
}

.jsonpath-result {
  width: 100%;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.result-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.result-content {
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--type-string);
}

.jsonpath-error {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--error);
  font-size: 12px;
  padding: 4px 0;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
