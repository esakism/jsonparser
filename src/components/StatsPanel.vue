<template>
  <div class="stats-panel scrollbar-thin">
    <div v-if="!jsonStore.stats" class="empty-state">
      <p>Parse JSON to see statistics</p>
    </div>
    <div v-else class="stats-content">
      <h3 class="stats-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        JSON Statistics
      </h3>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="color: var(--accent)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatSize(jsonStore.stats.fileSize) }}</div>
            <div class="stat-label">File Size</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-key)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalKeys.toLocaleString() }}</div>
            <div class="stat-label">Total Keys</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-number)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalObjects.toLocaleString() }}</div>
            <div class="stat-label">Objects</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-boolean)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalArrays.toLocaleString() }}</div>
            <div class="stat-label">Arrays</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-string)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalStrings.toLocaleString() }}</div>
            <div class="stat-label">Strings</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-number)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalNumbers.toLocaleString() }}</div>
            <div class="stat-label">Numbers</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-boolean)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalBooleans.toLocaleString() }}</div>
            <div class="stat-label">Booleans</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--type-null)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.totalNulls.toLocaleString() }}</div>
            <div class="stat-label">Nulls</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--text-secondary)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.maxDepth }}</div>
            <div class="stat-label">Max Depth</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="color: var(--text-secondary)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ jsonStore.stats.charCount.toLocaleString() }}</div>
            <div class="stat-label">Characters</div>
          </div>
        </div>
      </div>

      <!-- Type distribution bar -->
      <div class="distribution-section">
        <h4 class="section-title">Value Type Distribution</h4>
        <div class="distribution-bar">
          <div 
            v-for="item in distribution" 
            :key="item.type"
            class="distribution-segment"
            :style="{ width: item.pct + '%', background: item.color }"
            :title="`${item.type}: ${item.count} (${item.pct.toFixed(1)}%)`"
          ></div>
        </div>
        <div class="distribution-legend">
          <div v-for="item in distribution" :key="item.type" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.type }}: {{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJsonStore } from '../stores/jsonStore'
import { formatFileSize } from '../utils/jsonUtils'

const jsonStore = useJsonStore()

function formatSize(bytes) {
  return formatFileSize(bytes)
}

const distribution = computed(() => {
  if (!jsonStore.stats) return []
  const s = jsonStore.stats
  const total = s.totalStrings + s.totalNumbers + s.totalBooleans + s.totalNulls + s.totalObjects + s.totalArrays
  if (total === 0) return []
  return [
    { type: 'Objects', count: s.totalObjects, pct: (s.totalObjects / total) * 100, color: 'var(--accent)' },
    { type: 'Arrays', count: s.totalArrays, pct: (s.totalArrays / total) * 100, color: 'var(--type-boolean)' },
    { type: 'Strings', count: s.totalStrings, pct: (s.totalStrings / total) * 100, color: 'var(--type-string)' },
    { type: 'Numbers', count: s.totalNumbers, pct: (s.totalNumbers / total) * 100, color: 'var(--type-number)' },
    { type: 'Booleans', count: s.totalBooleans, pct: (s.totalBooleans / total) * 100, color: '#d97706' },
    { type: 'Nulls', count: s.totalNulls, pct: (s.totalNulls / total) * 100, color: 'var(--type-null)' },
  ].filter(i => i.count > 0)
})
</script>

<style scoped>
.stats-panel {
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
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.distribution-section {
  margin-top: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.distribution-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.distribution-segment {
  min-width: 2px;
  transition: width 0.3s ease;
}

.distribution-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
