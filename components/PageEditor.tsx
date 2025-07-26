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

  useEffect(() => {
    const pages = getPages()
    const found = pages.find((p) => p.id === params.id)
    setPage(found || null)
  }, [params.id])

  function updatePage(updates: Partial<Page>) {
    if (!page) return
    const pages = getPages()
    const updatedPages = pages.map((p) =>
      p.id === page.id ? { ...p, ...updates } : p
    )
    savePages(updatedPages)
    setPage((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  if (page === undefined) return <p className="text-gray-400">Cargando...</p>
  if (page === null) return notFound()

  return (
    <main className="p-6 space-y-6 text-gray-100 animate-fadeIn">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>
      <input
        value={page.title}
        onChange={(e) => updatePage({ title: e.target.value })}
        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-2xl font-bold"
      />

      <textarea
        value={page.content}
        onChange={(e) => updatePage({ content: e.target.value })}
        className="w-full h-[300px] bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2"
        placeholder="Escribe tu contenido aquí..."
      />
    </main>
  )
}
