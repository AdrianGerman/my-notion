"use client"
import { useParams, notFound, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getPages, savePages } from "@/lib/storage"
import { Page } from "@/types/page"
import { ArrowLeft, Download, Tag, X, Star, StarOff, Trash } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import dynamic from "next/dynamic"
import remarkGfm from "remark-gfm"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import MarkdownPreview from "@uiw/react-markdown-preview"
import html2pdf from "html2pdf.js"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function PageEditor() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement | null>(null)

  const [page, setPage] = useState<Page | null | undefined>(undefined)
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [newTag, setNewTag] = useState("")
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

  function addTag() {
    const trimmed = newTag.trim()
    if (!trimmed || page?.tags?.includes(trimmed)) return
    updatePage({
      tags: [...(page?.tags || []), trimmed]
    })
    setNewTag("")
  }

  function removeTag(tag: string) {
    updatePage({
      tags: page?.tags?.filter((t) => t !== tag)
    })
  }

  function exportToPDF() {
    if (!previewRef.current) return

    const opt = {
      margin: 0.5,
      filename: `${page?.title || "nota"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    }

    html2pdf().set(opt).from(previewRef.current).save()
  }

  function exportToMarkdown() {
    if (!page?.content) return
    const blob = new Blob([page.content], {
      type: "text/markdown;charset=utf-8"
    })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${page.title || "nota"}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function deletePage() {
    if (!window.confirm("¿Estás seguro de eliminar esta página?")) return
    const pages = getPages().filter((p) => p.id !== page?.id)
    savePages(pages)
    window.dispatchEvent(
      new StorageEvent("storage", { key: "notion-mini-pages" })
    )
    router.push("/")
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

        <div className="flex items-center gap-3">
          {mode === "preview" && (
            <>
              <button
                onClick={exportToMarkdown}
                className="flex items-center gap-1 text-sm text-white px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Exportar .md
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-1 text-sm text-white px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            </>
          )}
          <button
            onClick={deletePage}
            className="flex items-center gap-1 text-sm text-white px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
          >
            <Trash className="w-4 h-4" />
            Eliminar
          </button>
          <span className="text-sm text-blue-400 animate-pulse">
            {status === "saving" && "Guardando..."}
            {status === "saved" && "✓ Guardado"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          value={page.title}
          onChange={(e) => updatePage({ title: e.target.value })}
          className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          placeholder="Título de la página"
        />
        <button
          onClick={() => updatePage({ favorite: !page.favorite })}
          className={`p-2 rounded-lg transition ${
            page.favorite
              ? "text-yellow-400 hover:text-yellow-300"
              : "text-gray-400 hover:text-white"
          }`}
          title={page.favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {page.favorite ? <Star /> : <StarOff />}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {page.tags?.map((tag) => (
            <span
              key={tag}
              className="flex items-center bg-blue-800/50 text-blue-300 px-3 py-1 rounded-full text-sm"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            className="bg-[#1a1a1a] border border-gray-600 px-3 py-2 rounded-lg text-sm w-64"
            placeholder="Agregar etiqueta..."
          />
          <button
            onClick={addTag}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("edit")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium cursor-pointer ${
            mode === "edit"
              ? "bg-[#1a1a1a] border border-b-0 border-gray-700 text-white"
              : "bg-transparent border-b border-gray-700 text-gray-400"
          }`}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => setMode("preview")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium cursor-pointer ${
            mode === "preview"
              ? "bg-[#1a1a1a] border border-b-0 border-gray-700 text-white"
              : "bg-transparent border-b border-gray-700 text-gray-400"
          }`}
        >
          👁️ Vista Previa
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
          <div ref={previewRef}>
            <MarkdownPreview
              source={page.content}
              className="prose prose-invert max-w-none px-4 py-2"
              remarkPlugins={[remarkGfm]}
            />
          </div>
        )}
      </div>
    </main>
  )
}
