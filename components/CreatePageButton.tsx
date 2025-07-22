"use client"
import { Page } from "@/types/page"
import { getPages, savePages } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"

export function CreatePageButton() {
  const router = useRouter()

  function createPage() {
    const id = nanoid()
    const newPage: Page = {
      id,
      title: "Nueva Página",
      content: "",
      createdAt: new Date().toISOString()
    }
    const pages = getPages()
    savePages([...pages, newPage])
    router.push(`/page/${id}`)
  }

  return (
    <button
      onClick={createPage}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all active:scale-95"
    >
      + Nueva Página
    </button>
  )
}
