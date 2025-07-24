"use client"
import { useState, useEffect } from "react"
import { Page } from "@/types/page"
import Link from "next/link"
import { getPages, savePages } from "@/lib/storage"

export function PageList() {
  const [pages, setPages] = useState<Page[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null)

  function loadPages() {
    const loadedPages = getPages()
    const sortedPages = loadedPages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setPages(sortedPages)
  }

  function requestDelete(page: Page) {
    setPageToDelete(page)
    setConfirmOpen(true)
  }

  function confirmDelete() {
    if (!pageToDelete) return
    const updated = getPages().filter((p) => p.id !== pageToDelete.id)
    savePages(updated)
    window.dispatchEvent(
      new StorageEvent("storage", { key: "notion-mini-pages" })
    )
    setPageToDelete(null)
    setConfirmOpen(false)
    loadPages()
  }

  useEffect(() => {
    loadPages()

    function handleStorageChange(e: StorageEvent) {
      if (e.key === "notion-mini-pages") {
        loadPages()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <>
      {pages.length === 0 ? (
        <p className="text-gray-400 text-center italic">
          No hay páginas creadas aún.
        </p>
      ) : (
        <ul className="space-y-3">
          {pages.map((page) => (
            <li key={page.id} className="relative group">
              <Link
                href={`/page/${page.id}`}
                className="block bg-[#2a2a2a] border border-gray-600 rounded-lg px-4 py-3 hover:bg-[#333] transition-all shadow"
              >
                <h3 className="text-lg font-medium">{page.title}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(page.createdAt).toLocaleString()}
                </p>
              </Link>

              <button
                onClick={() => requestDelete(page)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                title="Borrar página"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {confirmOpen && pageToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-4 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-100">
              ¿Borrar esta página?
            </h2>
            <p className="text-gray-400">
              Esta acción no se puede deshacer. Se eliminará{" "}
              <span className="text-red-400 font-medium">
                {pageToDelete.title}
              </span>
              .
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
