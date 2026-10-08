import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, ExternalLink, FileText, X } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const isImageUrl = (value) =>
  typeof value === "string" &&
  /https?:\/\/[^\s]+(?:\.(?:png|jpe?g|gif|webp|svg|avif))(?:\?[^\s]*)?/i.test(
    value,
  );

function MessageBubble({ role, content, images = [], attachment }) {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [brokenImages, setBrokenImages] = useState([]);

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  };

  const handleBrokenImage = (src) => {
    if (!src) return;
    setBrokenImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
  };

  ///////////////////////////////////////////////////
  const markdownComponents = {
    a: ({ href, children, ...props }) => {
      const isDownloadLink =
        typeof children === "string" &&
        children.toLowerCase().includes("download");

      if (href && isImageUrl(href) && !brokenImages.includes(href)) {
        return (
          <img
            src={href}
            alt="Shared image"
            loading="lazy"
            onError={() => handleBrokenImage(href)}
            onClick={() => setLightBox(href)}
            className="my-2 max-h-72 rounded-xl object-contain border border-white/10 cursor-zoom-in hover:opacity-90 transition"
          />
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-300 underline inline-flex items-center gap-1"
          {...props}
        >
          {children}
          {isDownloadLink ? <Download size={16} /> : <ExternalLink size={16} />}
        </a>
      );
    },

    img: ({ src, alt, ...props }) => {
      if (!src || brokenImages.includes(src)) return null;
      return (
        <img
          src={src}
          alt={alt ?? "Image"}
          loading="lazy"
          onError={() => handleBrokenImage(src)}
          onClick={() => setLightBox(src)}
          className="my-2 max-h-72 rounded-xl object-contain border border-white/10 cursor-zoom-in hover:opacity-90 transition"
          {...props}
        />
      );
    },

    //? components of li rfgm markdown
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg sm:text-xl font-semibold mt-3 mb-2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base sm:text-lg font-semibold mt-2.5 mb-1.5">
        {children}
      </h3>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 scrollbar-none [&::-webkit-scrollbar]:hidden">
        <table className="min-w-full border border-white/10 text-xs sm:text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-white/10 bg-white/5 px-3 py-2 text-left text-slate-300">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-white/10 px-3 py-2 text-slate-400">
        {children}
      </td>
    ),

    code: ({ className, children }) => {
      const value = String(children).trim();

      if (!className) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 text-[12px]">
            {value}
          </code>
        );
      }

      const language = className?.replace("language-", "");

      return (
        <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          <div className="flex cursor-pointer items-center justify-between bg-[#1b1d24] border-b border-white/10 px-3.5 py-1.5">
            <span className="uppercase text-[11px] font-medium text-slate-400">
              {language}
            </span>
            <button
              onClick={() => {
                copyCode(value);
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {copiedCode == value ? (
                <>
                  <Check size={13} /> Copied
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </button>
          </div>

          <SyntaxHighlighter
            style={oneDark}
            wrapLongLines
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: "12px 14px",
              background: "#0d1117",
              fontSize: "12.5px",
            }}
            language={language}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-fit max-w-[88%] sm:max-w-[80%] md:max-w-[75%] break-words overflow-hidden px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[13.5px] sm:text-[14px] leading-relaxed
          ${isUser ? "bg-linear-to-r from-indigo-500/80 to-violet-600/80 text-white rounded-tr-xs shadow-sm shadow-indigo-500/15" : "text-slate-200 rounded-tl-xs"}`}
      >
        {/* Uploaded file attachment (image or PDF) */}
        {attachment?.url && (
          <div className="mb-2.5">
            {attachment.type?.startsWith("image/") ? (
              <div className="relative group/img w-fit">
                <img
                  src={attachment.url}
                  alt={attachment.name || "Uploaded image"}
                  onClick={() => setLightBox(attachment.url)}
                  className="max-h-56 max-w-[280px] sm:max-w-[320px] rounded-xl object-cover border border-white/[0.12] cursor-zoom-in transition-all duration-200 group-hover/img:border-indigo-300/30 shadow-md shadow-black/20"
                />
                {/* Hover overlay with zoom hint */}
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover/img:bg-black/20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover/img:opacity-100 text-[11px] font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full transition-opacity duration-200">
                    Click to preview
                  </span>
                </div>
                {/* Filename tag */}
                {attachment.name && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-block text-[10px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md truncate max-w-full">
                      {attachment.name}
                    </span>
                  </div>
                )}
              </div>
            ) : attachment.type === "application/pdf" ? (
              <button
                type="button"
                onClick={() => window.open(attachment.url, "_blank")}
                className="flex items-center gap-3 pl-3 pr-4 py-2.5 bg-white/[0.07] hover:bg-white/[0.11] backdrop-blur-sm border border-white/[0.1] hover:border-indigo-400/20 rounded-xl transition-all duration-200 cursor-pointer group/pdf w-full max-w-[280px] sm:max-w-[300px]"
              >
                {/* PDF Icon Badge */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/15 border border-red-500/25 shrink-0 group-hover/pdf:from-red-500/30 group-hover/pdf:to-orange-500/20 transition-all duration-200">
                  <FileText size={19} className="text-red-400 group-hover/pdf:text-red-300 transition-colors" />
                </div>
                {/* File Info */}
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-[12.5px] font-medium text-slate-100 truncate max-w-full w-full text-left group-hover/pdf:text-white transition-colors leading-tight">
                    {attachment.name || "Document.pdf"}
                  </span>
                  <span className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">
                    PDF • Click to open
                  </span>
                </div>
                {/* Open indicator */}
                <ExternalLink size={13} className="text-slate-500 shrink-0 group-hover/pdf:text-indigo-300 transition-colors" />
              </button>
            ) : null}
          </div>
        )}

        {content ? (
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </Markdown>
        ) : null}

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images
              .filter((img) => img && !brokenImages.includes(img))
              .map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="flex flex-col items-start gap-3"
                >
                  <img
                    src={img}
                    alt="Generated image"
                    onClick={() => window.open(img, "_blank")}
                    loading="lazy"
                    onError={() => handleBrokenImage(img)}
                    className="w-full max-w-2xl max-h-[70vh] rounded-xl object-contain border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                  />
                  <a
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-300 underline hover:text-blue-200 transition"
                  >
                    <Download size={16} />
                    Download Image
                  </a>
                </div>
              ))}
          </div>
        )}
      </div>

      {lightBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setLightBox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
          <img
            src={lightBox}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
