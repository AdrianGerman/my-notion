"use client"
import { useParams, notFound } from "next/navigation"
import { useState, useEffect } from "react"
import { getPages, savePages } from "@/lib/storage"
import { Page } from "@/types/page"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

export default function PageEditor() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [page, setPage] = useState<Page | null | undefined>(undefined)
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
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

  function updatePage(updates: Partial<Page>) {
    if (!page) return
    const updated = { ...page, ...updates }
    setPage(updated)
    setStatus("saving")
  }

  function format(type: "bold" | "italic" | "heading" | "code") {
    const textarea = document.querySelector("textarea")
    if (!textarea || !page) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = page.content.slice(start, end)

    let formatted = selected
    switch (type) {
      case "bold":
        formatted = `**${selected || "texto"}**`
        break
      case "italic":
        formatted = `*${selected || "texto"}*`
        break
      case "heading":
        formatted = `# ${selected || "Título"}`
        break
      case "code":
        formatted = `\`\`\`\n${selected || "código"}\n\`\`\``
        break
    }

    const updatedContent =
      page.content.slice(0, start) + formatted + page.content.slice(end)

    updatePage({ content: updatedContent })

    // Reposiciona el cursor después de aplicar formato
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + (type === "heading" ? 2 : type === "code" ? 4 : 2),
        start + formatted.length - (type === "code" ? 4 : 2)
      )
    }, 0)
  }

  if (page === undefined) return <p className="text-gray-400">Cargando...</p>
  if (page === null) return notFound()

  return (
    <main className="p-6 space-y-6 text-gray-100 animate-fadeIn max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
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
        className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
        placeholder="Título de la página"
      />

      <div className="flex gap-2 flex-wrap mb-2">
        <FormatButton label="B" onClick={() => format("bold")} />
        <FormatButton label="I" onClick={() => format("italic")} />
        <FormatButton label="H1" onClick={() => format("heading")} />
        <FormatButton label="Code" onClick={() => format("code")} />
      </div>

      <textarea
        value={page.content}
        onChange={(e) => updatePage({ content: e.target.value })}
        className="w-full min-h-[300px] resize-none bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base leading-relaxed"
        placeholder="Escribe tu contenido aquí..."
      />
    </main>
  )
}

function FormatButton({
  label,
  onClick
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 text-sm text-gray-200 px-3 py-1 rounded-lg transition"
    >
      {label}
    </button>
  )
}
