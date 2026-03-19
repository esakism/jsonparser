<template>
  <Teleport to="body">
    <div class="notification-area">
      <TransitionGroup name="notif">
        <div 
          v-for="notif in uiStore.notifications" 
          :key="notif.id"
          :class="['notification', 'notif-' + notif.type]"
        >
          <svg v-if="notif.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          <svg v-else-if="notif.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <svg v-else-if="notif.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>{{ notif.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '../stores/uiStore'
const uiStore = useUiStore()
</script>

<style scoped>
.notification-area {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  pointer-events: auto;
  min-width: 200px;
  max-width: 400px;
}

.notif-success {
  background: #059669;
  color: white;
}

.notif-error {
  background: #dc2626;
  color: white;
}

.notif-warning {
  background: #d97706;
  color: white;
}

.notif-info {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.notif-enter-active {
  transition: all 0.2s ease;
}
.notif-leave-active {
  transition: all 0.15s ease;
}
.notif-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.notif-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
</style>
