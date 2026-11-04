import { Check, Copy, ExternalLink, FileX2, X, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
function MessageBubble({ role, content, images, verification }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode("")
    }, 2000)
  }


  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`w-fit max-w-[92vw] md:max-w-[72%]
  px-4 py-2.5 rounded-2xl
  break-words overflow-hidden
  leading-relaxed
        ${isUser
          ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
          : " text-slate-200 rounded-tl-sm"
        }`}>


        {images.length > 0 && (
          <div className='flex flex-wrap gap-3 mt-4'>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setLightBox(img)}
                loading="lazy"
                onError={(e) => e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"

              />
            ))}
          </div>
        )}


        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className='text-2xl font-bold mt-5 mb-3'>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-lg font-semibold mt-3 mb-2'>{children}</h3>
            ),
            p: ({ children }) => (
              <p className='mb-3 whitespace-pre-wrap break-words'>{children}</p>
            ),
            ul: ({ children }) => (
              <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>
            ),
            table: ({ children }) => (
              <div className='overflow-x-auto my-4'>
                <table className='min-w-full border border-white/10'>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (

              <th className='border border-white/10 bg-white/5 px-3 py-2 text-left'>
                {children}
              </th>

            ),
            td: ({ children }) => (

              <td className='border border-white/10 px-3 py-2'>
                {children}
              </td>

            ),

            a: ({ href, children }) => (

              <a href={href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink size={14} />
              </a>

            ),
            code: ({ className, children }) => {
              const value = String(children).trim()
              

              if (!className) {
                return (
                  <code className='px-1.5 py-0.5 rounded bg-white/10 text-indigo-200'>
                    {value}
                  </code>
                )

              }

              const language = className.replace("language-", "")

              return (
                <div className='my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]'>
                  <div className='flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2'>
                    <span className='uppercase text-xs text-slate-400'>
                      {language}
                    </span>
                    <button className='flex items-center gap-1 text-xs' 
                    onClick={() => copyCode(value)}>
                      {
                        copiedCode == value ?
                          <>
                            <Check size={14}/>
                            Copied
                          </> :
                          <><Copy size={14} />Copy</>
                      }
                    </button>
                  </div>


                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#0d1117",
                      fontSize: "13px",
                    }}

                  >
                    {value}
                  </SyntaxHighlighter>


                </div>
              )
            },
          img:({src})=>{
            if(!src)return null;
            return (
              <img
                src={src}
                onClick={() => setLightBox(src)}
                loading="lazy"
                onError={(e) => e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
              />
            )
          }





          }}
        >
          {content}
        </Markdown>

        {!isUser && verification && verification.status !== "SKIPPED" && (
          <div className="mt-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowVerification(prev => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified by CortexAI</span>
              {verification.score && <span className="text-emerald-300 font-semibold">({verification.score}%)</span>}
              {showVerification ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {showVerification && (
              <div className="mt-2 p-2.5 bg-black/40 border border-emerald-500/20 rounded-xl text-[12px] text-slate-300 space-y-1.5 animate-fadeIn">
                {verification.summary && (
                  <p className="text-slate-300 text-[11px] leading-relaxed">{verification.summary}</p>
                )}
                {verification.checks && verification.checks.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    {verification.checks.map((chk, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{chk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}



      </div>
      {lightBox &&
        <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6'>
          <button
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2'
            onClick={() => setLightBox(null)}
          >
            <X />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"

          />

        </div>}
    </div>
  )
}

export default MessageBubble
