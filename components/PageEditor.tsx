"use client"
import { useParams, notFound, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getPages, savePages } from "@/lib/storage"
import { Page } from "@/types/page"
import { ArrowLeft } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import dynamic from "next/dynamic"
import remarkGfm from "remark-gfm"
import MarkdownPreview from "@uiw/react-markdown-preview"
import { jsPDF } from "jspdf"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function PageEditor() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [page, setPage] = useState<Page | null | undefined>(undefined)
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const debouncedPage = useDebounce(page, 500)

  useEffect(() => {
    const pages = getPages()
    const found = pages.find((p) => p.id === params.id)
    setPage(found || null)
  }, [params.id])

  useEffect(() => {
    if (!debouncedPage) return
    const pages = getPages().map((p) =>
      p.id === debouncedPage.id ? debouncedPage : p
    )
    savePages(pages)
    window.dispatchEvent(
      new StorageEvent("storage", { key: "notion-mini-pages" })
    )
    setStatus("saved")
    const timer = setTimeout(() => setStatus("idle"), 1000)
    return () => clearTimeout(timer)
  }, [debouncedPage])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const item = e.clipboardData?.items?.[0]
      if (item?.type.includes("image")) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            updatePage({
              content:
                (page?.content ?? "") + `\n\n![imagen pegada](${base64})\n`
            })
          }
          reader.readAsDataURL(file)
        }
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [page])

  function updatePage(updates: Partial<Page>) {
    if (!page) return
    const updated = { ...page, ...updates }
    setPage(updated)
    setStatus("saving")
  }

  function exportToMarkdown() {
    if (!page) return
    const blob = new Blob([page.content], {
      type: "text/markdown;charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${page.title || "pagina"}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportToPDF() {
    if (!page) return
    const doc = new jsPDF()
    const lines = doc.splitTextToSize(page.content, 180)
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(12)
    doc.text(lines, 10, 20)
    doc.save(`${page.title || "pagina"}.pdf`)
  }

  if (page === undefined) return <p className="text-gray-400">Cargando...</p>
  if (page === null) return notFound()

  return (
    <main className="p-6 text-gray-100 animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <span className="text-sm text-blue-400 animate-pulse">
          {status === "saving" && "Guardando..."}
          {status === "saved" && "✓ Guardado"}
        </span>
      </div>

      <input
        value={page.title}
        onChange={(e) => updatePage({ title: e.target.value })}
        className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-4"
        placeholder="Título de la página"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("edit")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            mode === "edit"
              ? "bg-[#1a1a1a] border border-b-0 border-gray-700 text-white"
              : "bg-transparent border-b border-gray-700 text-gray-400"
          }`}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => setMode("preview")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            mode === "preview"
              ? "bg-[#1a1a1a] border border-b-0 border-gray-700 text-white"
              : "bg-transparent border-b border-gray-700 text-gray-400"
          }`}
        >
          👁️ Vista Previa
        </button>
      </div>

      <div className="flex gap-2 mb-4 justify-end">
        <button
          onClick={exportToMarkdown}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
        >
          Exportar .md
        </button>
        <button
          onClick={exportToPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
        >
          Exportar PDF
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-700 rounded-b-lg p-4 shadow-lg min-h-[400px]">
        {mode === "edit" ? (
          <MDEditor
            value={page.content}
            onChange={(value) => updatePage({ content: value || "" })}
            height={500}
            preview="edit"
            previewOptions={{ remarkPlugins: [remarkGfm] }}
            textareaProps={{
              placeholder: "Escribe aquí en markdown..."
            }}
          />
        ) : (
          <MarkdownPreview
            source={page.content}
            className="prose prose-invert max-w-none px-4 py-2 rounded-sm"
            remarkPlugins={[remarkGfm]}
          />
        )}
      </div>
    </main>
  )
}
