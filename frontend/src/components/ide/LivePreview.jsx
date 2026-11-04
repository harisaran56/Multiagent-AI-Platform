import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RefreshCw, Monitor, Smartphone, Tablet, X, ExternalLink } from 'lucide-react';
import { setPreviewOpen } from '../../redux/ideSlice';

export default function LivePreview() {
  const dispatch = useDispatch();
  const { files, previewOpen } = useSelector(state => state.ide);
  const [device, setDevice] = useState("desktop"); // "desktop" | "tablet" | "mobile"
  const [key, setKey] = useState(0);

  if (!previewOpen) return null;

  const htmlFile = files.find(f => f.name === "index.html" || f.name.endsWith(".html"));
  const cssFile = files.find(f => f.name === "style.css" || f.name.endsWith(".css"));
  const jsFile = files.find(f => f.name === "script.js" || f.name.endsWith(".js"));

  const previewDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        ${cssFile?.content || ""}
      </style>
    </head>
    <body>
      ${htmlFile?.content || "<div style='font-family: sans-serif; padding: 20px; color: #fff;'>No HTML file found. Create index.html to preview your app.</div>"}
      <script>
        try {
          ${jsFile?.content || ""}
        } catch(e) {
          console.error("Preview script error:", e);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <div className="w-[450px] bg-[#1e1e1e] border-l border-[#2b2b2b] flex flex-col h-full shrink-0 z-10">
      {/* Header bar */}
      <div className="h-9 px-3 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Live Web Preview</span>
          <button
            onClick={() => setKey(k => k + 1)}
            title="Reload Preview"
            className="p-1 hover:bg-[#333] rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-[#181818] p-0.5 rounded">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1 rounded cursor-pointer ${device === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            title="Desktop view"
          >
            <Monitor size={12} />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`p-1 rounded cursor-pointer ${device === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            title="Tablet view"
          >
            <Tablet size={12} />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1 rounded cursor-pointer ${device === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            title="Mobile view"
          >
            <Smartphone size={12} />
          </button>
        </div>

        <button
          onClick={() => dispatch(setPreviewOpen(false))}
          className="p-1 hover:bg-[#333] rounded text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[#0d0f14] p-2 flex items-center justify-center overflow-auto">
        <div
          className={`h-full bg-white transition-all duration-200 rounded overflow-hidden shadow-2xl ${
            device === "desktop" ? "w-full" : device === "tablet" ? "w-[360px]" : "w-[280px]"
          }`}
        >
          <iframe
            key={key}
            title="Live Preview"
            srcDoc={previewDoc}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
}

