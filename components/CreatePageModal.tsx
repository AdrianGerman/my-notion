"use client"
import { useState } from "react"
import { Page } from "@/types/page"
import { getPages, savePages } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"

export function CreatePageModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")

  if (!isOpen) return null

  function createPage() {
    const id = nanoid()
    const newPage: Page = {
      id,
      title: title.trim() || "Nueva Página",
      content: "",
      createdAt: new Date().toISOString(),
      tags: [],
      favorite: false
    }
    const pages = getPages()
    savePages([...pages, newPage])
    window.dispatchEvent(
      new StorageEvent("storage", { key: "notion-mini-pages" })
    )
    setTitle("")
    onClose()
    router.push(`/page/${id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-4 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-100">Crear Nueva Página</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-600 text-gray-100"
          placeholder="Nombre de la página"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={createPage}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  )
}
