"use client"
import { useEffect, useState } from "react"
import { Page } from "@/types/page"
import Link from "next/link"
import { getPages } from "@/lib/storage"
import { CreatePageButton } from "@/components/CreatePageButton"

export default function Sidebar() {
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    const load = () => {
      const loaded = getPages().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setPages(loaded)
    }

    load()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "notion-mini-pages") load()
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <aside className="w-64 bg-[#121212] text-gray-200 h-screen p-4 border-r border-gray-700 fixed top-0 left-0 flex flex-col">
      <h1 className="text-xl font-bold mb-6">Mini Notion</h1>

      <CreatePageButton />

      <nav className="mt-6 flex-1 overflow-auto space-y-2">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/page/${page.id}`}
            className="block px-3 py-2 rounded-lg hover:bg-[#1f1f1f] text-sm truncate"
          >
            {page.title || "Sin título"}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
