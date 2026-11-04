import { createSlice } from "@reduxjs/toolkit";

const defaultVsCodeSettings = {
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "editor.lineNumbers": "on",
  "editor.renderWhitespace": "selection",
  "editor.cursorBlinking": "smooth",
  "editor.formatOnSave": true,
  "workbench.colorTheme": "vs-dark",
  "files.autoSave": "afterDelay",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/.DS_Store": true
  }
};

const initialSampleFiles = [
  {
    id: "file-1",
    name: "index.html",
    path: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CortexAI Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-container">
    <header class="hero">
      <div class="badge">🚀 CortexAI IDE Workspace</div>
      <h1>Intelligent Cloud IDE</h1>
      <p>Uploaded repository loaded in VS Code format with agent pair-programming.</p>
      <button id="cta-btn" class="primary-btn">Get Started</button>
    </header>
  </div>
  <script src="script.js"></script>
</body>
</html>`
  },
  {
    id: "file-2",
    name: "style.css",
    path: "style.css",
    language: "css",
    content: `:root {
  --bg-color: #0d0f14;
  --card-bg: #161922;
  --accent: #6366f1;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.hero {
  text-align: center;
  padding: 40px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}`
  },
  {
    id: "file-3",
    name: "script.js",
    path: "script.js",
    language: "javascript",
    content: `// CortexAI Interactive Script
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("cta-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      console.log("Welcome to CortexAI IDE! Your VS Code environment is ready.");
    });
  }
  console.log("CortexAI IDE Project initialized successfully.");
});`
  },
  {
    id: "file-4",
    name: "settings.json",
    path: ".vscode/settings.json",
    language: "json",
    content: JSON.stringify(defaultVsCodeSettings, null, 2)
  }
];

export const detectLanguageFromFileName = (fileName = "") => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".less")) return "css";
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "javascript";
  if (lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx")) return "cpp";
  if (lower.endsWith(".c")) return "c";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".php")) return "php";
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "shell";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  if (lower.endsWith(".xml") || lower.endsWith(".svg")) return "xml";
  if (lower.endsWith(".sql")) return "sql";
  return "plaintext";
};

const ideSlice = createSlice({
  name: "ide",
  initialState: {
    isOpen: false, // Whether the full IDE modal/pane is opened
    viewMode: "chat", // "chat" | "ide" | "split"
    projectName: "cortex-workspace",
    files: initialSampleFiles,
    openTabs: ["index.html", "style.css", ".vscode/settings.json"],
    activeTab: "index.html",
    activeSidebarTab: "explorer", // "explorer" | "search" | "git" | "settings"
    isRightAgentOpen: true, // Right side agent section open by default on opening
    activeBottomPanel: null, // "terminal" | "problems" | "output" | "agent" | null
    isBottomPanelOpen: false,
    previewOpen: false,
    vscodeSettings: defaultVsCodeSettings,
    settingsFetched: false,
    settingsSource: "default", // "folder" | "fetched" | "default"
    searchQuery: "",
    searchResults: [],
    repoLoading: {
      isLoading: false,
      repoName: "",
      totalFiles: 0,
      processedFiles: 0,
      percentage: 0,
      currentFile: "",
      phase: ""
    },
    toast: null, // { id, message, type: "info" | "success" | "error" | "warn" }
    terminalHistory: [
      { type: "info", text: "CortexAI Integrated Terminal v2.4 (x86_64-node)" },
      { type: "info", text: "Type 'help' for available IDE and Agent commands." }
    ]
  },
  reducers: {
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      if (action.payload === "ide" || action.payload === "split") {
        state.isOpen = true;
      }
    },
    setProject: (state, action) => {
      const { name, files, vscodeSettings } = action.payload;
      state.projectName = name || "project-repo";
      state.files = files;
      if (files.length > 0) {
        state.activeTab = files[0].path;
        state.openTabs = [files[0].path];
      } else {
        state.activeTab = null;
        state.openTabs = [];
      }
      if (vscodeSettings) {
        state.vscodeSettings = { ...state.vscodeSettings, ...vscodeSettings };
        state.settingsFetched = true;
        state.settingsSource = "folder";
      }
      state.isOpen = true;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    addOrUpdateFile: (state, action) => {
      const { path, content, name, language } = action.payload;
      const existingIndex = state.files.findIndex(f => f.path === path);
      if (existingIndex >= 0) {
        state.files[existingIndex] = {
          ...state.files[existingIndex],
          content,
          isModified: true
        };
      } else {
        const newFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: name || path.split("/").pop(),
          path,
          content: content || "",
          language: language || detectLanguageFromFileName(path),
          isModified: false
        };
        state.files.push(newFile);
      }
      if (!state.openTabs.includes(path)) {
        state.openTabs.push(path);
      }
      state.activeTab = path;
    },
    deleteFile: (state, action) => {
      const pathToDelete = action.payload;
      state.files = state.files.filter(f => f.path !== pathToDelete);
      state.openTabs = state.openTabs.filter(p => p !== pathToDelete);
      if (state.activeTab === pathToDelete) {
        state.activeTab = state.openTabs[state.openTabs.length - 1] || null;
      }
    },
    updateFileContent: (state, action) => {
      const { path, content } = action.payload;
      const file = state.files.find(f => f.path === path);
      if (file) {
        file.content = content;
        file.isModified = true;
      }
      // If this file was .vscode/settings.json, also update parsed vscodeSettings
      if (path === ".vscode/settings.json" || path.endsWith("/.vscode/settings.json")) {
        try {
          const parsed = JSON.parse(content);
          state.vscodeSettings = { ...state.vscodeSettings, ...parsed };
          state.settingsFetched = true;
          state.settingsSource = "editor";
        } catch {
          // ignore parse errors while typing
        }
      }
    },
    openTab: (state, action) => {
      const path = action.payload;
      if (!state.openTabs.includes(path)) {
        state.openTabs.push(path);
      }
      state.activeTab = path;
    },
    closeTab: (state, action) => {
      const path = action.payload;
      const index = state.openTabs.indexOf(path);
      state.openTabs = state.openTabs.filter(p => p !== path);
      if (state.activeTab === path) {
        if (state.openTabs.length > 0) {
          const newIndex = Math.max(0, index - 1);
          state.activeTab = state.openTabs[newIndex];
        } else {
          state.activeTab = null;
        }
      }
    },
    closeOtherTabs: (state, action) => {
      const keepPath = action.payload;
      state.openTabs = [keepPath];
      state.activeTab = keepPath;
    },
    closeAllTabs: (state) => {
      state.openTabs = [];
      state.activeTab = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setActiveSidebarTab: (state, action) => {
      state.activeSidebarTab = action.payload;
    },
    toggleBottomPanel: (state, action) => {
      const panel = action.payload;
      if (state.activeBottomPanel === panel && state.isBottomPanelOpen) {
        state.isBottomPanelOpen = false;
      } else {
        state.activeBottomPanel = panel || "terminal";
        state.isBottomPanelOpen = true;
      }
    },
    setBottomPanelOpen: (state, action) => {
      state.isBottomPanelOpen = action.payload;
    },
    setPreviewOpen: (state, action) => {
      state.previewOpen = action.payload;
    },
    updateVsCodeSetting: (state, action) => {
      const { key, value } = action.payload;
      state.vscodeSettings[key] = value;
      // Also update .vscode/settings.json file if present
      const settingsFile = state.files.find(f => f.path === ".vscode/settings.json" || f.path.endsWith("/.vscode/settings.json"));
      if (settingsFile) {
        settingsFile.content = JSON.stringify(state.vscodeSettings, null, 2);
      }
    },
    fetchVsCodeSettings: (state) => {
      // Check if project files contain any .vscode/settings.json
      const settingsFile = state.files.find(f => f.path.includes(".vscode/settings.json"));
      if (settingsFile && settingsFile.content) {
        try {
          const parsed = JSON.parse(settingsFile.content);
          state.vscodeSettings = { ...state.vscodeSettings, ...parsed };
          state.settingsFetched = true;
          state.settingsSource = "folder";
        } catch (err) {
          console.warn("Could not parse existing settings.json", err);
          state.settingsFetched = true;
          state.settingsSource = "default";
        }
      } else {
        // Generate/Inject recommended default settings into the project
        state.settingsFetched = true;
        state.settingsSource = "fetched";
        const hasSettings = state.files.some(f => f.path === ".vscode/settings.json");
        if (!hasSettings) {
          state.files.push({
            id: `file-${Date.now()}`,
            name: "settings.json",
            path: ".vscode/settings.json",
            language: "json",
            content: JSON.stringify(state.vscodeSettings, null, 2),
            isModified: false
          });
        }
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      const query = action.payload.trim().toLowerCase();
      if (!query) {
        state.searchResults = [];
        return;
      }
      const results = [];
      state.files.forEach(file => {
        const lines = file.content.split("\n");
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            results.push({
              filePath: file.path,
              fileName: file.name,
              lineNumber: index + 1,
              lineContent: line.trim()
            });
          }
        });
      });
      state.searchResults = results.slice(0, 100);
    },
    addTerminalLog: (state, action) => {
      state.terminalHistory.push(action.payload);
    },
    toggleRightAgent: (state) => {
      state.isRightAgentOpen = !state.isRightAgentOpen;
    },
    setRightAgentOpen: (state, action) => {
      state.isRightAgentOpen = action.payload;
    },
    clearTerminalLogs: (state) => {
      state.terminalHistory = [];
    },
    setRepoLoading: (state, action) => {
      state.repoLoading = { ...state.repoLoading, ...action.payload };
    },
    resetRepoLoading: (state) => {
      state.repoLoading = {
        isLoading: false,
        repoName: "",
        totalFiles: 0,
        processedFiles: 0,
        percentage: 0,
        currentFile: "",
        phase: ""
      };
    },
    showToast: (state, action) => {
      const payload = typeof action.payload === "string" 
        ? { message: action.payload, type: "info" } 
        : action.payload;
      state.toast = {
        id: Date.now(),
        message: payload.message,
        type: payload.type || "info"
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
    loadArtifactsIntoIde: (state, action) => {
      const artifact = action.payload;
      if (!artifact || !artifact.files) return;
      const formattedFiles = artifact.files.map((file, idx) => ({
        id: `artifact-file-${idx}-${Date.now()}`,
        name: file.name,
        path: file.name,
        content: file.content || "",
        language: detectLanguageFromFileName(file.name),
        isModified: false
      }));

      // Add default .vscode settings
      formattedFiles.push({
        id: `artifact-vscode-${Date.now()}`,
        name: "settings.json",
        path: ".vscode/settings.json",
        language: "json",
        content: JSON.stringify(state.vscodeSettings, null, 2),
        isModified: false
      });

      state.projectName = artifact.title || "generated-project";
      state.files = formattedFiles;
      state.openTabs = formattedFiles.map(f => f.path);
      state.activeTab = formattedFiles[0]?.path || null;
      state.isOpen = true;
      state.viewMode = "ide";
    }
  }
});

export const {
  setIsOpen,
  setViewMode,
  setProject,
  setFiles,
  addOrUpdateFile,
  deleteFile,
  updateFileContent,
  openTab,
  closeTab,
  closeOtherTabs,
  closeAllTabs,
  setActiveTab,
  setActiveSidebarTab,
  toggleBottomPanel,
  setBottomPanelOpen,
  setPreviewOpen,
  updateVsCodeSetting,
  fetchVsCodeSettings,
  setSearchQuery,
  addTerminalLog,
  clearTerminalLogs,
  loadArtifactsIntoIde,
  toggleRightAgent,
  setRightAgentOpen,
  setRepoLoading,
  resetRepoLoading,
  showToast,
  hideToast
} = ideSlice.actions;

export default ideSlice.reducer;

