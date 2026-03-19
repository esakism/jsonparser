<template>
  <div class="schema-viewer scrollbar-thin">
    <div v-if="!jsonStore.parsedJson" class="empty-state">
      <p>Parse JSON to generate schema</p>
    </div>
    <div v-else-if="jsonStore.generatedSchema" class="schema-content">
      <div class="schema-toolbar">
        <h3 class="schema-title">Generated JSON Schema</h3>
        <div class="schema-actions">
          <button class="btn btn-ghost btn-sm" @click="copySchema" title="Copy schema">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy
          </button>
          <button class="btn btn-ghost btn-sm" @click="downloadSchema" title="Download schema">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
        </div>
      </div>
      <pre class="schema-code">{{ schemaText }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'

const jsonStore = useJsonStore()
const uiStore = useUiStore()

const schemaText = computed(() => {
  if (!jsonStore.generatedSchema) return ''
  return JSON.stringify(jsonStore.generatedSchema, null, 2)
})

function copySchema() {
  navigator.clipboard.writeText(schemaText.value).then(() => {
    uiStore.notify('Schema copied to clipboard', 'success')
  })
}

function downloadSchema() {
  const blob = new Blob([schemaText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'schema.json'
  a.click()
  URL.revokeObjectURL(url)
  uiStore.notify('Schema downloaded', 'success')
}
</script>

<style scoped>
.schema-viewer {
  flex: 1;
  overflow: auto;
  padding: 16px;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
}

.schema-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.schema-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.schema-actions {
  display: flex;
  gap: 4px;
}

.schema-code {
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--type-string);
}
</style>
