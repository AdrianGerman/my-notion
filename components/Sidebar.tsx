"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Page } from "@/types/page"
import Link from "next/link"
import { getPages } from "@/lib/storage"
import { CreatePageButton } from "@/components/CreatePageButton"
import { CreatePageModal } from "@/components/CreatePageModal"
import { Menu, X } from "lucide-react"

export default function Sidebar() {
  const [pages, setPages] = useState<Page[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const pathname = usePathname()

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

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1f1f1f] border border-gray-700 rounded-lg p-2 text-gray-300 hover:bg-[#2a2a2a]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 bg-[#121212] text-gray-200 w-64 p-4 border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:block
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mini Notion</h1>
          <button
            className="md:hidden p-1 text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
          >
            +
          </button>

          <input
            type="text"
            placeholder="Buscar página..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <nav className="mt-4 flex-1 overflow-auto space-y-2">
          {filteredPages.length === 0 ? (
            <p className="text-gray-500 text-sm italic px-1">Sin resultados</p>
          ) : (
            filteredPages.map((page) => (
              <Link
                key={page.id}
                href={`/page/${page.id}`}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm truncate transition
                ${
                  pathname === `/page/${page.id}`
                    ? "bg-[#1f1f1f] text-white font-semibold border border-blue-500"
                    : "hover:bg-[#1f1f1f] text-gray-300"
                }`}
              >
                {page.title || "Sin título"}
              </Link>
            ))
          )}
        </nav>
      </aside>
      <CreatePageModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  )
}
