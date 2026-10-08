import {
  Check,
  Code2,
  Copy,
  Eye,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import React from "react";
import { easeInOut, motion } from "motion/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Editor } from "@monaco-editor/react";

function Artifect() {
  const { artifacts } = useSelector((state) => state.message);
  const [collapse, setCollapse] = useState(false);
  const [tab, setTab] = useState("code");
  const [activefile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  if (!artifacts || artifacts.length === 0) return null;

  const file = artifacts[0]?.files[activefile];
  const htmlfile = artifacts[0]?.files?.find((f) => f.name === "index.html");
  const cssfile = artifacts[0]?.files?.find((f) => f.name === "style.css");
  const jsfile = artifacts[0]?.files?.find((f) => f.name === "script.js");

  const canPreview = Boolean(htmlfile);

  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
       ${cssfile?.content || ""}
    </style>
</head>
<body>
 ${htmlfile?.content || ""}
    <script>
    ${jsfile?.content || ""}
    </script>
</body>
</html>`;

  const handleCopyCode = async (code) => {
    await navigator.clipboard.writeText(file?.content || "");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const detectLang = (fileName = "") => {
    const name = fileName.toLowerCase();

    if (name.endsWith(".html")) {
      return "html";
    }
    if (name.endsWith(".css")) {
      return "css";
    }
    if (name.endsWith(".js")) {
      return "javascript";
    }
    if (name.endsWith(".jsx")) {
      return "javascript";
    }
    if (name.endsWith(".ts")) {
      return "typescript";
    }
    if (name.endsWith(".tsx")) {
      return "typescript";
    }
    if (name.endsWith(".json")) {
      return "json";
    }
    if (name.endsWith(".py")) {
      return "python";
    }
    if (name.endsWith(".java")) {
      return "java";
    }
    if (name.endsWith(".cpp")) {
      return "cpp";
    }
    if (name.endsWith(".c")) {
      return "c";
    }

    return "plaintext";
  };

  return (
    <>
    <motion.div
      initial={{ width: 400 }}
      animate={{ width: collapse ? 48 : 400 }}
      transition={{
        duration: 0.25,
        ease: easeInOut,
      }}
      className="hidden lg:flex h-full border-l border-white/[0.08] flex-col overflow-hidden shrink-0"
    >
      {!collapse ? (
        <div className="flex flex-col h-full bg-[#0d0f14]">
          <div className="h-13 px-4 border-b border-white/[0.08] flex items-center gap-3 shrink-0">
            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 cursor-pointer shrink-0"
              onClick={() => {
                setCollapse((prev) => !prev);
              }}
            >
              <PanelRightClose size={18} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Code2 className="text-indigo-400" size={12} />
              </div>
              <div className="text-[13px] font-medium text-slate-200 truncate">
                {artifacts[0]?.title}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors duration-150 cursor-pointer"
                onClick={() => {
                  handleCopyCode();
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            {canPreview && (
              <div className="flex items-center gap-1 bg-white/4 border border-white/6 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setTab("code");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "code" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"} `}
                >
                  <Code2 size={11} />
                  Code
                </button>
                <button
                  onClick={() => {
                    setTab("preview");
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "preview" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"} `}
                >
                  <Eye size={11} />
                  Preview
                </button>
              </div>
            )}

            {/* Fullscreen button — only visible in preview mode */}
            {tab === "preview" && canPreview && (
              <button
                onClick={() => setFullscreen(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 cursor-pointer shrink-0"
                title="Open fullscreen preview"
              >
                <Maximize2 size={15} />
              </button>
            )}
          </div>

          {tab === "code" && (
            <div className="flex border-b border-white/[0.08] overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden shrink-0">
              {artifacts[0]?.files?.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveFile(i);
                  }}
                  className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/5 relative cursor-pointer bg-transparent ${activefile === i ? "text-indigo-400 font-semibold" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {f?.name}
                  {activefile === i && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {tab === "preview" && canPreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <iframe
                  srcDoc={previewDoc}
                  title="preview"
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <Editor
                  theme="vs-dark"
                  language={detectLang(file?.name)}
                  value={file?.content || ""}
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex border border-white/[0.08] py-4 gap-3 flex-col h-full bg-[#0d0f14]">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 cursor-pointer shrink-0"
            onClick={() => {
              setCollapse((prev) => !prev);
            }}
          >
            <PanelRightOpen size={16} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
              className="text-[10px] font-medium text-slate-500 tracking-widest uppercase whitespace-nowrap p-3"
            >
              {artifacts[0]?.title}
            </div>
          </div>
        </div>
      )}
    </motion.div>

    {/* Fullscreen preview overlay */}
    {fullscreen && canPreview && (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0f14]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              <Eye className="text-indigo-400" size={12} />
            </div>
            <span className="text-[13px] font-medium text-slate-200">Fullscreen Preview</span>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg transition-colors duration-150 cursor-pointer"
          >
            <X size={14} />
            Close
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            srcDoc={previewDoc}
            title="fullscreen-preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-white"
          />
        </div>
      </div>
    )}
    </>
  );
}

export default Artifect;
