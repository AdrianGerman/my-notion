"use client"
import { useState } from "react"
import { CreatePageModal } from "./CreatePageModal"

export function CreatePageButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all active:scale-95 cursor-pointer"
      >
        + Nueva Página
      </button>

      <CreatePageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
