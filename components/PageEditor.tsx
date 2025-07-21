"use client"
import { useParams, notFound } from "next/navigation"
import { useState, useEffect } from "react"
import { getPages } from "@/lib/storage"
import { Page } from "@/types/page"

export default function PageEditor() {
  const params = useParams<{ id: string }>()
  const [page, setPage] = useState<Page | null | undefined>(undefined)

  useEffect(() => {
    const pages = getPages()
    const found = pages.find((p) => p.id === params.id)
    setPage(found || null)
  }, [params.id])

  if (page === undefined) return <p className="text-gray-400">Cargando...</p>
  if (page === null) return notFound()

  return (
    <main className="p-6 text-gray-100">
      <h1 className="text-2xl font-bold">Editando: {page.title}</h1>
      {/* Aquí pondremos el editor real */}
    </main>
  )
}
