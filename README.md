# Jsonify - Advanced JSON Parser & Viewer

A modern, high-performance JSON parser and viewer web application built with Vue 3, Pinia, Monaco Editor, and Tailwind CSS.

## Features

### Core Layout
- **Two-column grid layout**: Left panel (Monaco Editor) / Right panel (Tree Viewer)
- **Responsive and resizable**: Drag the divider to adjust panel widths
- **Persistent layout**: Panel width preferences saved to localStorage

### JSON Input & Validation
- Paste JSON directly into Monaco Editor
- Upload `.json` files via toolbar
- Drag & drop JSON files
- Real-time validation with clear error messages (line/column)
- Syntax highlighting with bracket matching

### JSON Viewer (Tree View)
- Expandable/collapsible tree rendering
- Expand/Collapse all buttons
- Lazy rendering for large JSON (batch loading for 100+ items)
- Color-coded data types (string, number, boolean, null, array, object)
- Array indexes and object keys clearly displayed
- Type badges showing Array(n) / Object{n}

### Search & Navigation
- Search by keys, values, or both
- Partial match support
- Match highlighting in tree
- Match count display
- Navigate next/previous match (Enter / Shift+Enter)
- Filter mode: show only matching nodes

### Schema Generator
- Auto-generate JSON Schema (Draft-07) from input
- View schema in a dedicated tab
- Copy/Download schema

### Copy Utilities
- Copy entire JSON
- Copy selected object value (via context menu)
- Copy JSON path (e.g., `$.user.address.city`)
- Right-click context menu for quick actions

### Formatting Tools
- Format / Pretty print JSON
- Minify JSON
- Sort keys alphabetically

### Comparison Mode
- Side-by-side JSON comparison
- Highlighted differences (added, removed, changed)
- Load second JSON via paste, clipboard, or file upload

### Theme Support
- Toggle between Light and Dark mode
- Persistent user preference (localStorage)
- Custom Monaco Editor themes

### Pin / Bookmark Feature
- Pin specific nodes/paths
- View pinned items in a sidebar panel
- Copy pinned values/paths
- Persist pins locally

### File Operations
- Upload JSON file
- Download: Raw JSON, Formatted JSON, Minified JSON
- Auto-detect encoding issues

### JSON Path Query Support
- Query like: `$.users[0].name`
- Recursive descent: `$..email`
- Wildcard support: `$.users[*]`
- Results displayed with copy option

### Statistics Panel
- Total keys, objects, arrays, strings, numbers, booleans, nulls
- Max depth
- File size & character count
- Type distribution visualization

### Error Recovery Mode
- Auto-fix trailing commas
- Auto-fix unquoted keys
- Auto-fix single quotes to double quotes

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Shift + F` | Format JSON |
| `Ctrl + F` | Search |
| `Ctrl + M` | Minify JSON |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `?` | Show shortcuts |
| `Esc` | Close panels |

### Collapsible Depth Control
- Expand up to level N (0-10 or all)
- Select from dropdown in viewer toolbar

## Tech Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **UI**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Build Tool**: Vite 5

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure
```
src/
├── main.js                          # App entry point
├── App.vue                          # Root component
├── components/
│   ├── Toolbar.vue                  # Top toolbar
│   ├── MonacoEditor.vue             # Monaco Editor wrapper
│   ├── JsonTreeViewer.vue           # Tree view container
│   ├── JsonTreeNode.vue             # Recursive tree node
│   ├── SearchBar.vue                # Search UI
│   ├── JsonPathBar.vue              # JSON Path query UI
│   ├── SchemaViewer.vue             # Schema display
│   ├── CompareView.vue              # JSON comparison
│   ├── StatsPanel.vue               # Statistics dashboard
│   ├── PinnedSidebar.vue            # Pinned items panel
│   ├── ContextMenu.vue              # Right-click menu
│   ├── NotificationArea.vue         # Toast notifications
│   └── KeyboardShortcutsModal.vue   # Shortcuts help
├── stores/
│   ├── jsonStore.js                 # JSON state & logic
│   └── uiStore.js                   # UI state & preferences
├── utils/
│   └── jsonUtils.js                 # JSON utilities
└── styles/
    └── main.css                     # Global styles
```

## Performance
- Debounced parsing (300ms) to avoid UI freezes
- Lazy/batch rendering for large arrays (100 items per batch)
- Shallow refs for large parsed JSON objects
- Efficient tree expansion tracking with Sets
