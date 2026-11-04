/**
 * Converts a flat array of file objects { path, name, content, language } into a nested tree
 */
export function buildFileTree(files) {
  const root = {
    name: "root",
    path: "",
    isDirectory: true,
    children: []
  };

  files.forEach(file => {
    const parts = file.path.split(/[/\\]+/).filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existing = current.children.find(child => child.name === part);

      if (!existing) {
        if (isLast) {
          existing = {
            ...file,
            name: part,
            path: currentPath,
            isDirectory: false
          };
        } else {
          existing = {
            name: part,
            path: currentPath,
            isDirectory: true,
            children: []
          };
        }
        current.children.push(existing);
      }
      current = existing;
    }
  });

  // Sort: directories first alphabetically, then files alphabetically
  const sortTree = (node) => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortTree);
  };

  sortTree(root);
  return root.children;
}

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "ico", "webp", "mp4", "mov", "mp3", "wav", 
  "zip", "tar", "gz", "7z", "rar", "pdf", "exe", "dmg", "bin", "iso", 
  "woff", "woff2", "ttf", "eot", "otf"
]);

const IGNORED_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".cache",
  "coverage",
  ".venv",
  "venv",
  "vendor",
  ".turbo",
  ".idea",
  "__pycache__"
]);

/**
 * Modern Folder Picker using File System Access API
 * This avoids Chrome's "Upload 109,827 files" prompt because it never descends into node_modules!
 */
export async function openProjectFolderWithFileSystemApi(onProgress = () => {}) {
  if (typeof window.showDirectoryPicker !== "function") {
    return null; // Fallback to input file picker
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      id: "cortex-workspace-picker",
      mode: "read"
    });

    const topFolderName = dirHandle.name || "project-repo";
    const files = [];
    let vscodeSettings = null;
    let fileIndex = 0;

    onProgress({
      current: 0,
      total: 100,
      percentage: 5,
      fileName: topFolderName,
      phase: `Reading ${topFolderName} source files...`
    });

    // Recursive directory scanner that immediately skips node_modules, .git, etc.
    async function scanHandle(handle, pathPrefix = "") {
      for await (const entry of handle.values()) {
        const entryName = entry.name;
        const lowerName = entryName.toLowerCase();

        if (entry.kind === "directory") {
          // Immediately skip heavy dependency/build folders BEFORE reading their contents!
          if (IGNORED_DIR_NAMES.has(lowerName)) {
            continue;
          }
          await scanHandle(entry, `${pathPrefix}${entryName}/`);
        } else if (entry.kind === "file") {
          fileIndex++;
          const relativePath = `${pathPrefix}${entryName}`;

          // Yield every 20 files for smooth animations
          if (fileIndex % 20 === 0) {
            await new Promise(r => setTimeout(r, 0));
            const pct = Math.min(95, Math.round((fileIndex / (fileIndex + 20)) * 90) + 10);
            onProgress({
              current: fileIndex,
              total: fileIndex + 50,
              percentage: pct,
              fileName: entryName,
              phase: `Indexed ${fileIndex} source files...`
            });
          }

          const ext = entryName.split(".").pop().toLowerCase();
          const isBinary = BINARY_EXTENSIONS.has(ext);

          try {
            const fileObj = await entry.getFile();
            let content = "";

            if (relativePath === ".vscode/settings.json" || relativePath.endsWith("/.vscode/settings.json")) {
              content = await fileObj.text();
              try {
                vscodeSettings = JSON.parse(content);
              } catch (e) {
                console.warn("Error parsing .vscode/settings.json", e);
              }
            } else if (isBinary) {
              content = `/* Binary file: ${entryName} (${Math.round(fileObj.size / 1024)} KB) */`;
            } else if (fileObj.size > 1.5 * 1024 * 1024) {
              content = `/* Large file: ${entryName} (${Math.round(fileObj.size / 1024)} KB) - Loaded in preview mode */`;
            } else {
              content = await fileObj.text();
            }

            files.push({
              id: `upload-${Date.now()}-${fileIndex}`,
              name: entryName,
              path: relativePath,
              rawPath: relativePath,
              content: content,
              size: fileObj.size,
              isModified: false
            });
          } catch (err) {
            console.warn("Could not read file:", entryName, err);
          }
        }
      }
    }

    await scanHandle(dirHandle, "");

    onProgress({
      current: fileIndex,
      total: fileIndex,
      percentage: 100,
      fileName: "Ready",
      phase: `Completed! Loaded ${files.length} files.`
    });

    await new Promise(r => setTimeout(r, 300));

    return {
      name: topFolderName,
      files,
      vscodeSettings
    };
  } catch (err) {
    if (err.name === "AbortError") {
      // User cancelled directory picker
      return { cancelled: true };
    }
    console.warn("showDirectoryPicker failed, falling back to input:", err);
    return null;
  }
}

/**
 * Fallback: Reads all files from a legacy directory input (e.g. webkitdirectory)
 */
export async function readFolderFiles(fileList, onProgress = () => {}) {
  const files = [];
  let vscodeSettings = null;
  const totalCount = fileList.length;

  onProgress({
    current: 0,
    total: totalCount,
    percentage: 5,
    fileName: fileList[0]?.name || "",
    phase: "Scanning workspace files..."
  });

  for (let i = 0; i < totalCount; i++) {
    const f = fileList[i];
    const relPath = f.webkitRelativePath || f.name;

    // Yield to the browser main thread every 25 files so animations stay 60fps
    if (i % 25 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
      const pct = Math.min(95, Math.round((i / totalCount) * 90) + 5);
      onProgress({
        current: i,
        total: totalCount,
        percentage: pct,
        fileName: f.name,
        phase: `Indexing files (${i} / ${totalCount})...`
      });
    }

    // Skip heavy build/dependency folders
    const lowerPath = relPath.toLowerCase();
    const isIgnored = Array.from(IGNORED_DIR_NAMES).some(dir => 
      lowerPath.includes(`/${dir}/`) || 
      lowerPath.includes(`\\${dir}\\`) ||
      lowerPath.startsWith(`${dir}/`) ||
      lowerPath.startsWith(`${dir}\\`)
    );
    if (isIgnored) {
      continue;
    }

    const fileName = f.name;
    const ext = fileName.split(".").pop().toLowerCase();
    const isBinary = BINARY_EXTENSIONS.has(ext);

    let content = "";
    try {
      if (relPath.endsWith(".vscode/settings.json") || relPath.endsWith(".vscode\\settings.json")) {
        content = await f.text();
        try {
          vscodeSettings = JSON.parse(content);
        } catch (e) {
          console.warn("Error parsing .vscode/settings.json", e);
        }
      } else if (isBinary) {
        content = `/* Binary file: ${fileName} (${Math.round(f.size / 1024)} KB) */`;
      } else if (f.size > 1.5 * 1024 * 1024) {
        content = `/* Large file: ${fileName} (${Math.round(f.size / 1024)} KB) - Loaded in preview mode */`;
      } else {
        content = await f.text();
      }

      files.push({
        id: `upload-${Date.now()}-${i}`,
        name: fileName,
        path: relPath.replace(/^[^/\\\\]+[/\\]/, ""), // strip top root folder name
        rawPath: relPath,
        content: content,
        size: f.size,
        isModified: false
      });
    } catch (err) {
      console.warn("Could not read file text:", f.name, err);
    }
  }

  onProgress({
    current: totalCount,
    total: totalCount,
    percentage: 100,
    fileName: "Ready",
    phase: "Workspace loaded successfully!"
  });

  await new Promise(resolve => setTimeout(resolve, 300));

  const normalizedFiles = files.map(f => {
    let cleanPath = f.path.replace(/^[/\\]+/, "");
    if (!cleanPath) cleanPath = f.name;
    return {
      ...f,
      path: cleanPath
    };
  });

  return {
    files: normalizedFiles,
    vscodeSettings
  };
}
