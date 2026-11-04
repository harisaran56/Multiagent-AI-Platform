import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFileContent, detectLanguageFromFileName } from '../../redux/ideSlice';

export default function MonacoEditorContainer({ onCursorChange, editorRef }) {
  const dispatch = useDispatch();
  const { files, activeTab, vscodeSettings } = useSelector(state => state.ide);

  const activeFile = files.find(f => f.path === activeTab);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track cursor changes for Status Bar
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      }
    });

    // Add format command shortcut
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1e1e1e] text-slate-500 gap-2 select-none">
        <p className="text-sm">No file open in editor</p>
        <p className="text-xs text-slate-600">Select a file from Explorer to edit or upload a folder repository</p>
      </div>
    );
  }

  const editorLanguage = activeFile.language || detectLanguageFromFileName(activeFile.name);

  return (
    <div className="flex-1 w-full h-full bg-[#1e1e1e] overflow-hidden">
      <Editor
        theme={vscodeSettings["workbench.colorTheme"] || "vs-dark"}
        language={editorLanguage}
        value={activeFile.content}
        onChange={(value) => {
          dispatch(updateFileContent({
            path: activeFile.path,
            content: value || ""
          }));
        }}
        onMount={handleEditorDidMount}
        options={{
          fontSize: vscodeSettings["editor.fontSize"] || 14,
          tabSize: vscodeSettings["editor.tabSize"] || 2,
          wordWrap: vscodeSettings["editor.wordWrap"] || "on",
          minimap: { enabled: Boolean(vscodeSettings["editor.minimap.enabled"]) },
          lineNumbers: vscodeSettings["editor.lineNumbers"] || "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          renderWhitespace: vscodeSettings["editor.renderWhitespace"] || "selection",
          renderLineHighlight: "all"
        }}
      />
    </div>
  );
}

