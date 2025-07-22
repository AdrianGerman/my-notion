"use client"
import { useState, useEffect } from "react"
import { Page } from "@/types/page"
import Link from "next/link"
import { getPages } from "@/lib/storage"

export function PageList() {
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    const loadedPages = getPages()
    const sortedPages = loadedPages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setPages(sortedPages)
  }, [])

  if (pages.length === 0)
    return (
      <p className="text-gray-400 text-center italic">
        No hay páginas creadas aún.
      </p>
    )

  return (
    <ul className="space-y-3">
      {pages.map((page) => (
        <li key={page.id}>
          <Link
            href={`/page/${page.id}`}
            className="block bg-[#2a2a2a] border border-gray-600 rounded-lg px-4 py-3 hover:bg-[#333] transition-all shadow"
          >
            <h3 className="text-lg font-medium">{page.title}</h3>
            <p className="text-sm text-gray-400">
              {new Date(page.createdAt).toLocaleString()}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
