import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { tryFixJson, generateSchema, queryJsonPath, computeStats } from '../utils/jsonUtils'

export const useJsonStore = defineStore('json', () => {
  // State
  const rawInput = ref('')
  const parsedJson = shallowRef(null)
  const parseError = ref(null)
  const isValid = ref(false)
  const fileName = ref('')
  const fileSize = ref(0)

  // History for undo/redo
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistory = 50

  // Search
  const searchQuery = ref('')
  const searchResults = ref([])
  const activeSearchIndex = ref(0)
  const searchRevision = ref(0) // incremented on every search navigation to force watcher triggers
  const searchMode = ref('both') // 'keys', 'values', 'both'
  const filterMode = ref(false)

  // Tree state
  const expandedNodes = ref(new Set())
  const expandDepth = ref(2)

  // Pins
  const pinnedPaths = ref(JSON.parse(localStorage.getItem('jsonify_pins') || '[]'))

  // Comparison
  const compareMode = ref(false)
  const compareInput = ref('')
  const compareParsed = shallowRef(null)
  const compareError = ref(null)
  const diffResults = shallowRef(null)

  // Schema
  const showSchema = ref(false)
  const generatedSchema = shallowRef(null)

  // Stats
  const showStats = ref(false)
  const stats = computed(() => {
    if (!parsedJson.value) return null
    return computeStats(parsedJson.value, rawInput.value)
  })

  // JSON Path query
  const jsonPathQuery = ref('')
  const jsonPathResult = shallowRef(null)
  const jsonPathError = ref(null)

  // Active tab
  const activeTab = ref('viewer') // 'viewer', 'schema', 'compare', 'stats'

  // Computed
  const formattedJson = computed(() => {
    if (!parsedJson.value) return ''
    try {
      return JSON.stringify(parsedJson.value, null, 2)
    } catch { return '' }
  })

  const minifiedJson = computed(() => {
    if (!parsedJson.value) return ''
    try {
      return JSON.stringify(parsedJson.value)
    } catch { return '' }
  })

  // Actions
  function parseJson(input, addToHistory = true) {
    rawInput.value = input
    if (!input || !input.trim()) {
      parsedJson.value = null
      parseError.value = null
      isValid.value = false
      return
    }

    try {
      parsedJson.value = JSON.parse(input)
      parseError.value = null
      isValid.value = true
      if (addToHistory) pushHistory(input)
    } catch (e) {
      // Try error recovery
      const fixed = tryFixJson(input)
      if (fixed.success) {
        parsedJson.value = fixed.data
        parseError.value = { message: 'Auto-fixed: ' + fixed.fixes.join(', '), recovered: true }
        isValid.value = true
        if (addToHistory) pushHistory(input)
      } else {
        parsedJson.value = null
        isValid.value = false
        parseError.value = extractErrorInfo(e, input)
      }
    }

    // Update search if active
    if (searchQuery.value) performSearch()
    // Update schema if tab active
    if (activeTab.value === 'schema') generateSchemaFromJson()
    // Update stats
    if (activeTab.value === 'stats') { /* computed handles this */ }
  }

  function extractErrorInfo(error, input) {
    const msg = error.message
    let line = 1, column = 1
    const posMatch = msg.match(/position\s+(\d+)/i)
    if (posMatch) {
      const pos = parseInt(posMatch[1])
      const before = input.substring(0, pos)
      line = (before.match(/\n/g) || []).length + 1
      column = pos - before.lastIndexOf('\n')
    }
    return { message: msg, line, column, position: posMatch ? parseInt(posMatch[1]) : 0 }
  }

  function pushHistory(input) {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    if (history.value.length >= maxHistory) {
      history.value.shift()
    }
    history.value.push(input)
    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      parseJson(history.value[historyIndex.value], false)
      return history.value[historyIndex.value]
    }
    return null
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      parseJson(history.value[historyIndex.value], false)
      return history.value[historyIndex.value]
    }
    return null
  }

  function formatJson() {
    if (parsedJson.value) {
      const formatted = JSON.stringify(parsedJson.value, null, 2)
      rawInput.value = formatted
      return formatted
    }
    return rawInput.value
  }

  function minifyJson() {
    if (parsedJson.value) {
      const minified = JSON.stringify(parsedJson.value)
      rawInput.value = minified
      return minified
    }
    return rawInput.value
  }

  function sortKeys(obj = null) {
    const data = obj || parsedJson.value
    if (!data) return null
    const sorted = sortObjectKeys(data)
    parsedJson.value = sorted
    const formatted = JSON.stringify(sorted, null, 2)
    rawInput.value = formatted
    return formatted
  }

  function sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => sortObjectKeys(item))
    }
    if (obj !== null && typeof obj === 'object') {
      const sorted = {}
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key])
      })
      return sorted
    }
    return obj
  }

  // Search
  function performSearch() {
    if (!searchQuery.value || !parsedJson.value) {
      searchResults.value = []
      activeSearchIndex.value = 0
      return
    }
    const results = []
    const query = searchQuery.value.toLowerCase()
    searchNode(parsedJson.value, '$', query, results)
    searchResults.value = results
    activeSearchIndex.value = results.length > 0 ? 0 : 0
    // Always bump revision so the watcher fires even if activeSearchIndex stays at 0
    searchRevision.value++
  }

  function searchNode(node, path, query, results) {
    if (node === null || node === undefined) {
      if (searchMode.value !== 'keys' && 'null'.includes(query)) {
        results.push({ path, type: 'value', value: null })
      }
      return
    }
    if (typeof node === 'object') {
      if (Array.isArray(node)) {
        node.forEach((item, i) => {
          const itemPath = `${path}[${i}]`
          searchNode(item, itemPath, query, results)
        })
      } else {
        Object.keys(node).forEach(key => {
          const keyPath = `${path}.${key}`
          if (searchMode.value !== 'values' && key.toLowerCase().includes(query)) {
            results.push({ path: keyPath, type: 'key', key })
          }
          searchNode(node[key], keyPath, query, results)
        })
      }
    } else {
      if (searchMode.value !== 'keys') {
        const strVal = String(node).toLowerCase()
        if (strVal.includes(query)) {
          results.push({ path, type: 'value', value: node })
        }
      }
    }
  }

  function nextSearchResult() {
    if (searchResults.value.length > 0) {
      activeSearchIndex.value = (activeSearchIndex.value + 1) % searchResults.value.length
      searchRevision.value++
    }
  }

  function prevSearchResult() {
    if (searchResults.value.length > 0) {
      activeSearchIndex.value = (activeSearchIndex.value - 1 + searchResults.value.length) % searchResults.value.length
      searchRevision.value++
    }
  }

  // Tree expansion
  function toggleNode(path) {
    const s = new Set(expandedNodes.value)
    if (s.has(path)) {
      s.delete(path)
    } else {
      s.add(path)
    }
    expandedNodes.value = s
  }

  // Expand all ancestors of a path so the node becomes visible in the tree
  function expandAncestors(path) {
    if (!path || !parsedJson.value) return
    const s = new Set(expandedNodes.value)
    // Parse path like $.users[0].name into ancestor segments: $, $.users, $.users[0], $.users[0].name
    const ancestors = []
    let current = ''
    for (let i = 0; i < path.length; i++) {
      const ch = path[i]
      if ((ch === '.' || ch === '[') && current.length > 0 && i > 0) {
        ancestors.push(current)
      }
      current += ch
    }
    // Don't add the final path itself—only its ancestors need expanding
    // ancestors now contains all prefixes ending before '.' or '['
    for (const ancestor of ancestors) {
      s.add(ancestor)
    }
    // Also ensure '$' root is expanded
    s.add('$')
    expandedNodes.value = s
  }

  function expandAll() {
    const paths = new Set()
    collectExpandablePaths(parsedJson.value, '$', paths)
    expandedNodes.value = paths
  }

  function collapseAll() {
    expandedNodes.value = new Set()
  }

  function expandToDepth(depth) {
    expandDepth.value = depth
    const paths = new Set()
    collectExpandablePaths(parsedJson.value, '$', paths, 0, depth)
    expandedNodes.value = paths
  }

  function collectExpandablePaths(node, path, paths, currentDepth = 0, maxDepth = Infinity) {
    if (currentDepth >= maxDepth) return
    if (node !== null && typeof node === 'object') {
      paths.add(path)
      if (Array.isArray(node)) {
        node.forEach((item, i) => {
          collectExpandablePaths(item, `${path}[${i}]`, paths, currentDepth + 1, maxDepth)
        })
      } else {
        Object.keys(node).forEach(key => {
          collectExpandablePaths(node[key], `${path}.${key}`, paths, currentDepth + 1, maxDepth)
        })
      }
    }
  }

  // Pins
  function togglePin(path) {
    const idx = pinnedPaths.value.indexOf(path)
    if (idx >= 0) {
      pinnedPaths.value.splice(idx, 1)
    } else {
      pinnedPaths.value.push(path)
    }
    localStorage.setItem('jsonify_pins', JSON.stringify(pinnedPaths.value))
  }

  function isPinned(path) {
    return pinnedPaths.value.includes(path)
  }

  function getValueAtPath(path) {
    if (!parsedJson.value || !path) return undefined
    try {
      const parts = path.replace(/\$/g, '').replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
      let current = parsedJson.value
      for (const part of parts) {
        if (current === null || current === undefined) return undefined
        current = current[part]
      }
      return current
    } catch {
      return undefined
    }
  }

  // Schema generation
  function generateSchemaFromJson() {
    if (!parsedJson.value) {
      generatedSchema.value = null
      return
    }
    generatedSchema.value = generateSchema(parsedJson.value)
  }

  // Comparison
  function setCompareInput(input) {
    compareInput.value = input
    try {
      compareParsed.value = JSON.parse(input)
      compareError.value = null
      computeDiff()
    } catch (e) {
      compareParsed.value = null
      compareError.value = e.message
      diffResults.value = null
    }
  }

  function computeDiff() {
    if (!parsedJson.value || !compareParsed.value) {
      diffResults.value = null
      return
    }
    diffResults.value = diffObjects(parsedJson.value, compareParsed.value, '$')
  }

  function diffObjects(a, b, path) {
    const diffs = []
    if (a === b) return diffs
    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
      diffs.push({ path, type: 'changed', oldValue: a, newValue: b })
      return diffs
    }
    if (a === null || b === null) {
      if (a !== b) diffs.push({ path, type: 'changed', oldValue: a, newValue: b })
      return diffs
    }
    if (typeof a !== 'object') {
      if (a !== b) diffs.push({ path, type: 'changed', oldValue: a, newValue: b })
      return diffs
    }
    if (Array.isArray(a)) {
      const maxLen = Math.max(a.length, b.length)
      for (let i = 0; i < maxLen; i++) {
        const itemPath = `${path}[${i}]`
        if (i >= a.length) {
          diffs.push({ path: itemPath, type: 'added', newValue: b[i] })
        } else if (i >= b.length) {
          diffs.push({ path: itemPath, type: 'removed', oldValue: a[i] })
        } else {
          diffs.push(...diffObjects(a[i], b[i], itemPath))
        }
      }
    } else {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
      for (const key of allKeys) {
        const keyPath = `${path}.${key}`
        if (!(key in a)) {
          diffs.push({ path: keyPath, type: 'added', newValue: b[key] })
        } else if (!(key in b)) {
          diffs.push({ path: keyPath, type: 'removed', oldValue: a[key] })
        } else {
          diffs.push(...diffObjects(a[key], b[key], keyPath))
        }
      }
    }
    return diffs
  }

  // JSON Path query
  function executeJsonPath(query) {
    jsonPathQuery.value = query
    if (!query || !parsedJson.value) {
      jsonPathResult.value = null
      jsonPathError.value = null
      return
    }
    try {
      const result = queryJsonPath(parsedJson.value, query)
      jsonPathResult.value = result
      jsonPathError.value = null
    } catch (e) {
      jsonPathResult.value = null
      jsonPathError.value = e.message
    }
  }

  // Copy value at a path
  function copyPath(path) {
    navigator.clipboard.writeText(path).catch(() => {})
  }

  function copyValue(path) {
    const val = getValueAtPath(path)
    const text = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return {
    rawInput, parsedJson, parseError, isValid, fileName, fileSize,
    history, historyIndex,
    searchQuery, searchResults, activeSearchIndex, searchRevision, searchMode, filterMode,
    expandedNodes, expandDepth,
    pinnedPaths,
    compareMode, compareInput, compareParsed, compareError, diffResults,
    showSchema, generatedSchema,
    showStats, stats,
    jsonPathQuery, jsonPathResult, jsonPathError,
    activeTab,
    formattedJson, minifiedJson,
    parseJson, formatJson, minifyJson, sortKeys,
    undo, redo,
    performSearch, nextSearchResult, prevSearchResult,
    toggleNode, expandAncestors, expandAll, collapseAll, expandToDepth,
    togglePin, isPinned, getValueAtPath,
    generateSchemaFromJson,
    setCompareInput, computeDiff,
    executeJsonPath,
    copyPath, copyValue,
    pushHistory
  }
})
