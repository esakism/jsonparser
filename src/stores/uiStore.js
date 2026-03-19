import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Theme
  const isDark = ref(localStorage.getItem('jsonify_theme') === 'dark' || 
    (!localStorage.getItem('jsonify_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('jsonify_theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Panel sizing
  const leftPanelWidth = ref(parseFloat(localStorage.getItem('jsonify_panel_width') || '50'))
  const showPinnedSidebar = ref(false)

  function setLeftPanelWidth(w) {
    leftPanelWidth.value = Math.max(20, Math.min(80, w))
    localStorage.setItem('jsonify_panel_width', String(leftPanelWidth.value))
  }

  // Modals
  const showSearchBar = ref(false)
  const showJsonPathBar = ref(false)
  const showKeyboardShortcuts = ref(false)

  // Context menu
  const contextMenu = ref({ show: false, x: 0, y: 0, path: '', value: null })

  function showContextMenu(x, y, path, value) {
    contextMenu.value = { show: true, x, y, path, value }
  }

  function hideContextMenu() {
    contextMenu.value = { ...contextMenu.value, show: false }
  }

  // Notifications
  const notifications = ref([])
  let notifId = 0

  function notify(message, type = 'info', duration = 3000) {
    const id = ++notifId
    notifications.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id)
      }, duration)
    }
  }

  // Init
  applyTheme()

  return {
    isDark, toggleTheme, applyTheme,
    leftPanelWidth, setLeftPanelWidth,
    showPinnedSidebar,
    showSearchBar, showJsonPathBar, showKeyboardShortcuts,
    contextMenu, showContextMenu, hideContextMenu,
    notifications, notify
  }
})
