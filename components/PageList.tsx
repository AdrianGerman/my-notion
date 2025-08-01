"use client"
import { useEffect, useState } from "react"
import { getPages } from "@/lib/storage"
import { Page } from "@/types/page"
import Link from "next/link"
import { Tag, XCircle, Star } from "lucide-react"

export function PageList() {
  const [pages, setPages] = useState<Page[]>([])
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    const load = () => setPages(getPages())
    load()
    window.addEventListener("storage", load)
    return () => window.removeEventListener("storage", load)
  }, [])

  const allTags = Array.from(new Set(pages.flatMap((page) => page.tags || [])))

  const filtered = filter
    ? pages.filter((p) => p.tags?.includes(filter))
    : pages

  const sortedPages = [...filtered].sort((a, b) => {
    return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0)
  })

  return (
    <div className="space-y-4">
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center border-b border-gray-700 pb-2 mb-4">
          <span className="text-sm text-gray-400">Filtrar por etiqueta:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border cursor-pointer ${
                filter === tag
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-[#1a1a1a] text-gray-300 border-gray-600 hover:bg-[#2a2a2a]"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="ml-2 flex items-center gap-1 text-sm text-red-400 hover:text-red-500 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      )}

      {sortedPages.length === 0 && (
        <p className="text-gray-400 text-sm">
          No hay páginas con esa etiqueta.
        </p>
      )}

      {sortedPages.map((page) => (
        <Link
          key={page.id}
          href={`/${page.id}`}
          className="block p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:border-blue-600 transition"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{page.title}</h3>
            {page.favorite && <Star className="w-5 h-5 text-yellow-400" />}
          </div>

          {page.tags && page.tags.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {page.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-blue-300 bg-blue-800/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
