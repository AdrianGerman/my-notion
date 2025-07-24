"use client"
import { Page } from "@/types/page"

interface ConfirmDeleteModalProps {
  page: Page
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDeleteModal({
  page,
  onCancel,
  onConfirm
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-4 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-100">
          ¿Borrar esta página?
        </h2>
        <p className="text-gray-400">
          Esta acción no se puede deshacer. Se eliminará{" "}
          <span className="text-red-400 font-medium">{page.title}</span>.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  )
}
