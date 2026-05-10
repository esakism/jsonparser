<template>
  <div
    class="tree-node"
    :class="{ 'is-highlighted': isSearchMatch, 'is-active-match': isActiveMatch, 'is-filtered-out': isFilteredOut }"
    :data-tree-path="path"
  >
    <div 
      class="node-line"
      @contextmenu.prevent.stop="onContextMenu($event)"
    >
      <!-- Expand/Collapse toggle -->
      <span 
        v-if="isExpandable" 
        class="toggle"
        @click="toggleExpand"
      >
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          :class="{ 'rotate-90': isExpanded }"
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </span>
      <span v-else class="toggle-placeholder"></span>

      <!-- Key name -->
      <span v-if="keyName !== null" class="node-key" @click="toggleExpand">
        <span v-html="highlightText(displayKey, 'key')"></span>
        <span class="colon">:</span>
      </span>

      <!-- Value display -->
      <template v-if="!isExpandable">
        <span :class="'node-value type-' + valueType" v-html="highlightText(displayValue, 'value')"></span>
      </template>
      <template v-else>
        <span class="bracket" @click="toggleExpand">{{ openBracket }}</span>
        <span v-if="!isExpanded" class="collapsed-preview" @click="toggleExpand">
          {{ previewText }}
        </span>
        <span v-if="!isExpanded" class="bracket" @click="toggleExpand">{{ closeBracket }}</span>
      </template>

      <!-- Type badge -->
      <span class="type-badge" v-if="showTypeBadge">{{ typeBadgeText }}</span>

      <!-- Pin button -->
      <button 
        class="pin-btn"
        :class="{ pinned: jsonStore.isPinned(path) }"
        @click.stop="jsonStore.togglePin(path)"
        title="Pin this node"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 17v5"/><path d="M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 001 1 1 1 0 011 1z"/>
        </svg>
      </button>

      <!-- Copy path button -->
      <button 
        class="copy-btn"
        @click.stop="copyNodePath"
        title="Copy path"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
    </div>

    <!-- Children -->
    <div v-if="isExpandable && isExpanded" class="node-children">
      <template v-if="isLargeNode && useVirtualized">
        <!-- Virtualized rendering for large arrays/objects -->
        <div 
          v-for="(item, idx) in visibleChildren" 
          :key="item.key"
        >
          <JsonTreeNode
            :data="item.value"
            :path="item.path"
            :depth="depth + 1"
            :keyName="item.key"
            :isLast="idx === visibleChildren.length - 1 && allChildrenVisible"
          />
        </div>
        <div v-if="!allChildrenVisible" class="show-more" @click="showMoreChildren">
          <span>... {{ remainingCount }} more items (click to load)</span>
        </div>
      </template>
      <template v-else>
        <JsonTreeNode
          v-for="(item, idx) in childEntries"
          :key="item.key"
          :data="item.value"
          :path="item.path"
          :depth="depth + 1"
          :keyName="item.key"
          :isLast="idx === childEntries.length - 1"
        />
      </template>
      <div class="closing-bracket">
        <span class="bracket">{{ closeBracket }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { useUiStore } from '../stores/uiStore'
import { getJsonType } from '../utils/jsonUtils'

const props = defineProps({
  data: { default: null },
  path: { type: String, required: true },
  depth: { type: Number, default: 0 },
  keyName: { default: null },
  isLast: { type: Boolean, default: true }
})

const jsonStore = useJsonStore()
const uiStore = useUiStore()

const BATCH_SIZE = 100
const visibleCount = ref(BATCH_SIZE)

const valueType = computed(() => getJsonType(props.data))
const isExpandable = computed(() => valueType.value === 'object' || valueType.value === 'array')
const isExpanded = computed(() => jsonStore.expandedNodes.has(props.path))
const isArray = computed(() => Array.isArray(props.data))

const openBracket = computed(() => isArray.value ? '[' : '{')
const closeBracket = computed(() => isArray.value ? ']' : '}')

const displayKey = computed(() => {
  if (props.keyName === null) return ''
  return typeof props.keyName === 'number' ? String(props.keyName) : `"${props.keyName}"`
})

const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (props.data === undefined) return 'undefined'
  if (typeof props.data === 'string') return `"${props.data}"`
  if (typeof props.data === 'boolean') return String(props.data)
  return String(props.data)
})

const childEntries = computed(() => {
  if (!isExpandable.value) return []
  if (isArray.value) {
    return props.data.map((val, idx) => ({
      key: idx,
      value: val,
      path: `${props.path}[${idx}]`
    }))
  }
  return Object.entries(props.data).map(([key, val]) => ({
    key,
    value: val,
    path: `${props.path}.${key}`
  }))
})

const childCount = computed(() => {
  if (!isExpandable.value) return 0
  return isArray.value ? props.data.length : Object.keys(props.data).length
})

const isLargeNode = computed(() => childCount.value > BATCH_SIZE)
const useVirtualized = computed(() => isLargeNode.value)

const visibleChildren = computed(() => {
  return childEntries.value.slice(0, visibleCount.value)
})

const allChildrenVisible = computed(() => visibleCount.value >= childEntries.value.length)
const remainingCount = computed(() => childEntries.value.length - visibleCount.value)

function showMoreChildren() {
  visibleCount.value += BATCH_SIZE
}

const previewText = computed(() => {
  if (!isExpandable.value) return ''
  const count = childCount.value
  if (isArray.value) return `${count} item${count !== 1 ? 's' : ''}`
  return `${count} key${count !== 1 ? 's' : ''}`
})

const showTypeBadge = computed(() => {
  if (isExpandable.value) return true
  return false
})

const typeBadgeText = computed(() => {
  if (isArray.value) return `Array(${childCount.value})`
  if (valueType.value === 'object') return `Object{${childCount.value}}`
  return valueType.value
})

// Search highlighting
const isSearchMatch = computed(() => {
  if (!jsonStore.searchQuery) return false
  return jsonStore.searchResults.some(r => r.path === props.path)
})

const isActiveMatch = computed(() => {
  if (!jsonStore.searchQuery || jsonStore.searchResults.length === 0) return false
  const activeResult = jsonStore.searchResults[jsonStore.activeSearchIndex]
  return activeResult && activeResult.path === props.path
})

const isFilteredOut = computed(() => {
  if (!jsonStore.filterMode || !jsonStore.searchQuery) return false
  if (isSearchMatch.value) return false
  // Check if any child matches
  const hasMatchingChild = jsonStore.searchResults.some(r => r.path.startsWith(props.path + '.') || r.path.startsWith(props.path + '['))
  if (hasMatchingChild) return false
  // Check if parent matches
  const parts = props.path.split(/[.\[]/)
  let parentPath = ''
  for (const part of parts) {
    if (parentPath) parentPath += part.startsWith('[') ? part : '.' + part
    else parentPath = part
    if (jsonStore.searchResults.some(r => r.path === parentPath)) return false
  }
  return true
})

function highlightText(text, textType = 'value') {
  if (!jsonStore.searchQuery) return escapeHtml(text)
  const query = jsonStore.searchQuery.toLowerCase()
  const lowerText = text.toLowerCase()
  const idx = lowerText.indexOf(query)
  if (idx === -1) return escapeHtml(text)
  const before = text.substring(0, idx)
  const match = text.substring(idx, idx + query.length)
  const after = text.substring(idx + query.length)
  // Determine if THIS specific text (key vs value) is the active match
  let isActive = false
  if (isActiveMatch.value) {
    const activeResult = jsonStore.searchResults[jsonStore.activeSearchIndex]
    if (activeResult) {
      // If the active result type matches what we're rendering, use the active class
      isActive = activeResult.type === textType || activeResult.type === 'both'
    }
  }
  const hlClass = isActive ? 'search-highlight-active' : 'search-highlight'
  return `${escapeHtml(before)}<span class="${hlClass}">${escapeHtml(match)}</span>${escapeHtml(after)}`
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function toggleExpand() {
  if (isExpandable.value) {
    jsonStore.toggleNode(props.path)
  }
}

function onContextMenu(e) {
  uiStore.showContextMenu(e.clientX, e.clientY, props.path, props.data)
}

function copyNodePath() {
  navigator.clipboard.writeText(props.path).then(() => {
    uiStore.notify('Path copied: ' + props.path, 'success')
  })
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node.is-filtered-out {
  display: none;
}

.tree-node.is-highlighted > .node-line {
  background: color-mix(in srgb, var(--highlight-bg) 30%, transparent);
  border-radius: 4px;
}

.tree-node.is-active-match > .node-line {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 4px;
  outline: 2px solid var(--accent);
  outline-offset: 1px;
  animation: pulse-highlight 1.2s ease-in-out;
}

@keyframes pulse-highlight {
  0% { outline-color: var(--accent); box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent); }
  50% { outline-color: var(--accent); box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent); }
  100% { outline-color: var(--accent); box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent); }
}

.node-line {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: 4px;
  cursor: default;
  min-height: 24px;
  white-space: nowrap;
  position: relative;
}

.node-line:hover {
  background: var(--bg-tertiary);
}

.node-line:hover .pin-btn,
.node-line:hover .copy-btn {
  opacity: 1;
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.toggle:hover {
  color: var(--accent);
}

.toggle svg {
  transition: transform 0.15s ease;
}

.toggle svg.rotate-90 {
  transform: rotate(90deg);
}

.toggle-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.node-key {
  color: var(--type-key);
  cursor: pointer;
  font-weight: 500;
}

.colon {
  color: var(--text-muted);
  margin-right: 4px;
}

.node-value {
  font-family: 'JetBrains Mono', monospace;
}

.type-string { color: var(--type-string); }
.type-number { color: var(--type-number); }
.type-boolean { color: var(--type-boolean); }
.type-null { color: var(--type-null); font-style: italic; }

.bracket {
  color: var(--json-bracket);
  cursor: pointer;
  font-weight: 600;
}

.collapsed-preview {
  color: var(--text-muted);
  font-size: 11px;
  font-style: italic;
  cursor: pointer;
  margin: 0 4px;
}

.type-badge {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 4px;
  background: var(--badge-bg);
  color: var(--badge-text);
  margin-left: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.pin-btn, .copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  flex-shrink: 0;
}

.pin-btn:hover, .copy-btn:hover {
  color: var(--accent);
  background: var(--accent-light);
}

.pin-btn.pinned {
  opacity: 1;
  color: var(--accent);
}

.node-children {
  padding-left: 20px;
  border-left: 1px solid var(--border-color);
  margin-left: 7px;
}

.closing-bracket {
  padding-left: 6px;
}

.show-more {
  padding: 4px 8px;
  color: var(--accent);
  cursor: pointer;
  font-size: 12px;
  font-style: italic;
}

.show-more:hover {
  text-decoration: underline;
}
</style>
