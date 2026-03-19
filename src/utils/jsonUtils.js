/**
 * Attempt to fix common JSON issues
 */
export function tryFixJson(input) {
  const fixes = []
  let text = input.trim()

  // Remove trailing commas before } or ]
  const trailingComma = /,\s*([}\]])/g
  if (trailingComma.test(text)) {
    text = text.replace(trailingComma, '$1')
    fixes.push('Removed trailing commas')
  }

  // Add missing quotes around unquoted keys
  const unquotedKeys = /(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g
  if (unquotedKeys.test(text)) {
    text = text.replace(unquotedKeys, '$1"$2":')
    fixes.push('Added quotes to unquoted keys')
  }

  // Replace single quotes with double quotes
  if (text.includes("'") && !text.includes('"')) {
    text = text.replace(/'/g, '"')
    fixes.push('Replaced single quotes with double quotes')
  }

  // Try parsing
  try {
    const data = JSON.parse(text)
    return { success: true, data, fixes, fixedText: text }
  } catch {
    return { success: false, data: null, fixes: [], fixedText: text }
  }
}

/**
 * Generate JSON Schema from a JSON value
 */
export function generateSchema(value, title = 'Generated Schema') {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title,
    ...inferSchema(value)
  }
  return schema
}

function inferSchema(value) {
  if (value === null) return { type: 'null' }
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: 'array', items: {} }
    // Merge schemas of all items
    const itemSchemas = value.map(item => inferSchema(item))
    const merged = mergeSchemas(itemSchemas)
    return { type: 'array', items: merged }
  }
  switch (typeof value) {
    case 'string': return { type: 'string' }
    case 'number':
      return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' }
    case 'boolean': return { type: 'boolean' }
    case 'object': {
      const properties = {}
      const required = []
      for (const [key, val] of Object.entries(value)) {
        properties[key] = inferSchema(val)
        required.push(key)
      }
      return { type: 'object', properties, required }
    }
    default: return {}
  }
}

function mergeSchemas(schemas) {
  if (schemas.length === 0) return {}
  if (schemas.length === 1) return schemas[0]

  const types = [...new Set(schemas.map(s => s.type))]
  if (types.length === 1) {
    if (types[0] === 'object') {
      const allProps = {}
      const allRequired = new Set(schemas[0].required || [])
      for (const s of schemas) {
        for (const [key, val] of Object.entries(s.properties || {})) {
          if (!allProps[key]) allProps[key] = []
          allProps[key].push(val)
        }
        if (s.required) {
          for (const r of allRequired) {
            if (!s.required.includes(r)) allRequired.delete(r)
          }
        }
      }
      const mergedProps = {}
      for (const [key, vals] of Object.entries(allProps)) {
        mergedProps[key] = mergeSchemas(vals)
      }
      return { type: 'object', properties: mergedProps, required: [...allRequired] }
    }
    return schemas[0]
  }
  return { oneOf: schemas.filter((s, i, arr) => arr.findIndex(x => x.type === s.type) === i) }
}

/**
 * Simple JSON Path query implementation
 * Supports: $.key, $.arr[0], $.key.nested, $..recursive
 */
export function queryJsonPath(data, query) {
  if (!query.startsWith('$')) throw new Error('Query must start with $')
  
  const path = query.substring(1)
  if (!path) return data

  // Handle recursive descent
  if (path.startsWith('..')) {
    const key = path.substring(2).split(/[.\[]/)[0]
    return recursiveFind(data, key)
  }

  const tokens = tokenizePath(path)
  let current = data

  for (const token of tokens) {
    if (current === null || current === undefined) return undefined
    if (token.type === 'key') {
      current = current[token.value]
    } else if (token.type === 'index') {
      current = current[parseInt(token.value)]
    } else if (token.type === 'wildcard') {
      if (Array.isArray(current)) return current
      if (typeof current === 'object') return Object.values(current)
    }
  }
  return current
}

function tokenizePath(path) {
  const tokens = []
  let i = 0
  while (i < path.length) {
    if (path[i] === '.') {
      i++
      if (path[i] === '*') {
        tokens.push({ type: 'wildcard' })
        i++
      } else {
        let key = ''
        while (i < path.length && path[i] !== '.' && path[i] !== '[') {
          key += path[i++]
        }
        if (key) tokens.push({ type: 'key', value: key })
      }
    } else if (path[i] === '[') {
      i++
      let idx = ''
      while (i < path.length && path[i] !== ']') {
        idx += path[i++]
      }
      i++ // skip ]
      if (idx === '*') {
        tokens.push({ type: 'wildcard' })
      } else {
        tokens.push({ type: 'index', value: idx.replace(/['"]/g, '') })
      }
    } else {
      let key = ''
      while (i < path.length && path[i] !== '.' && path[i] !== '[') {
        key += path[i++]
      }
      if (key) tokens.push({ type: 'key', value: key })
    }
  }
  return tokens
}

function recursiveFind(obj, key) {
  const results = []
  function search(node) {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(item => search(item))
    } else {
      for (const [k, v] of Object.entries(node)) {
        if (k === key) results.push(v)
        search(v)
      }
    }
  }
  search(obj)
  return results
}

/**
 * Compute statistics about JSON data
 */
export function computeStats(data, rawText) {
  const stats = {
    totalKeys: 0,
    totalValues: 0,
    totalObjects: 0,
    totalArrays: 0,
    totalStrings: 0,
    totalNumbers: 0,
    totalBooleans: 0,
    totalNulls: 0,
    maxDepth: 0,
    fileSize: new Blob([rawText || '']).size,
    charCount: rawText ? rawText.length : 0
  }

  function traverse(node, depth) {
    if (depth > stats.maxDepth) stats.maxDepth = depth
    if (node === null) { stats.totalNulls++; stats.totalValues++; return }
    if (Array.isArray(node)) {
      stats.totalArrays++
      node.forEach(item => traverse(item, depth + 1))
    } else if (typeof node === 'object') {
      stats.totalObjects++
      for (const [key, val] of Object.entries(node)) {
        stats.totalKeys++
        traverse(val, depth + 1)
      }
    } else {
      stats.totalValues++
      if (typeof node === 'string') stats.totalStrings++
      else if (typeof node === 'number') stats.totalNumbers++
      else if (typeof node === 'boolean') stats.totalBooleans++
    }
  }

  traverse(data, 0)
  return stats
}

/**
 * Get type of JSON value
 */
export function getJsonType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
