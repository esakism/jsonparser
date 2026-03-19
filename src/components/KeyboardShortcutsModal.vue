<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>
            Keyboard Shortcuts
          </h2>
          <button class="close-btn" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-group">
            <h3>General</h3>
            <div class="shortcut-item">
              <span class="shortcut-desc">Search</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>F</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Format JSON</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Minify JSON</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>M</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Undo</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Z</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Redo</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></div>
            </div>
          </div>
          <div class="shortcut-group">
            <h3>Navigation</h3>
            <div class="shortcut-item">
              <span class="shortcut-desc">Next Match</span>
              <div class="shortcut-keys"><kbd>Enter</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Previous Match</span>
              <div class="shortcut-keys"><kbd>Shift</kbd> + <kbd>Enter</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Close Panel</span>
              <div class="shortcut-keys"><kbd>Esc</kbd></div>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-desc">Show Shortcuts</span>
              <div class="shortcut-keys"><kbd>?</kbd></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '../stores/uiStore'
const uiStore = useUiStore()

function close() {
  uiStore.showKeyboardShortcuts = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 8px;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.shortcut-group {
  margin-bottom: 20px;
}

.shortcut-group h3 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.shortcut-desc {
  font-size: 13px;
  color: var(--text-primary);
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

kbd {
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 1px 0 var(--border-color);
}
</style>
