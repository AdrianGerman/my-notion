"use client"
import { useParams, notFound } from "next/navigation"
import { useState, useEffect } from "react"
import { getPages, savePages } from "@/lib/storage"
import { Page } from "@/types/page"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function PageEditor() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [page, setPage] = useState<Page | null | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const pages = getPages()
    const found = pages.find((p) => p.id === params.id)
    setPage(found || null)
  }, [params.id])

  function updatePage(updates: Partial<Page>) {
    if (!page) return
    const updatedPage = { ...page, ...updates }
    const pages = getPages().map((p) => (p.id === page.id ? updatedPage : p))
    savePages(pages)
    setPage(updatedPage)
    setSaving(true)
    setTimeout(() => setSaving(false), 500)
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

        {saving && (
          <span className="text-sm text-blue-400 animate-pulse">
            Guardando...
          </span>
        )}
      </div>

      <input
        value={page.title}
        onChange={(e) => updatePage({ title: e.target.value })}
        className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
        placeholder="Título de la página"
      />

      <textarea
        value={page.content}
        onChange={(e) => updatePage({ content: e.target.value })}
        className="w-full min-h-[300px] resize-none bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base leading-relaxed"
        placeholder="Escribe tu contenido aquí..."
      />
    </main>
  )
}
