import { PageList } from "@/components/PageList"
import { CreatePageButton } from "@/components/CreatePageButton"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-gray-100 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Mis Páginas</h1>
          <CreatePageButton />
        </header>

        <section className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Lista de Páginas</h2>
          <PageList />
        </section>
      </div>
    </main>
  )
}
