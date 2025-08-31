// frontend/src/features/characters/pages/CharacterExplorerPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterCard } from "../components/CharacterCard";
import FiltersBar from "../components/FiltersBar";
import CharacterDetail from "../components/CharacterDetail";
import { Skeleton } from "../../shared/ui/Skeleton";

type FiltersState = {
  sort: "NAME_ASC" | "NAME_DESC";
  status?: string; species?: string; gender?: string;
  name?: string; origin?: string;
};

export default function CharacterExplorerPage() {
  const [filters, setFilters] = useState<FiltersState>({ sort: "NAME_ASC" });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const pageSize = 15;

  const input = useMemo(() => ({
    page, pageSize, sort: filters.sort,
    filters: { status: filters.status, species: filters.species, gender: filters.gender, name: filters.name, origin: filters.origin }
  }), [page, pageSize, filters]);

  const { data, loading, error } = useCharacters(input);

  
  useEffect(() => { 
    console.log("[Page] reset selectedId por cambio de filtros/paginación");
    setSelectedId(undefined); }, [page, pageSize, filters]);

  // auto-seleccionar el primero cuando llega la data
  useEffect(() => {
    if (!loading && data?.items?.length && !selectedId) {
      console.log("[Page] autoselect primer item", { id: data.items[0].id });
      setSelectedId(data.items[0].id);
    }
  }, [loading, data, selectedId]);

  const apply = (next: FiltersState) => { setFilters(next); setPage(1); };
  const goPage = (p: number) => { setPage(p); };

  return (
    <main className="p-4">
      <header className="mb-3"><h1 className="text-2xl font-bold">Characters</h1></header>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* IZQUIERDA: filtros + lista */}
        <section  className="w-full md:w-80 md:flex-shrink-0 bg-white border-r">
          <FiltersBar value={filters} onApply={apply} />

          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: pageSize }).map((_, i) => (<Skeleton key={i} className="h-72" />))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 p-4">
              There was an error loading the list. Please try again.
            </div>
          )}

          {!loading && !error && (
            <>
              {data?.items?.length ? (
                <section className="grid grid-cols-1 gap-4">
                  {data.items.map((c) => (
                    <CharacterCard
                      key={c.id}
                      c={c}
                      onSelect={setSelectedId}
                      selected={c.id === selectedId}
                    />
                  ))}
                </section>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-300 py-16">No characters found.</div>
              )}

              <footer className="flex items-center justify-center gap-3 mt-6">
                <button className="px-3 py-2 rounded-xl border disabled:opacity-50"
                  onClick={() => goPage(Math.max(1, page - 1))}
                  disabled={!data?.pageInfo?.hasPrev}>
                  Prev
                </button>
                <span className="text-sm">
                  Page <strong>{data?.pageInfo?.page ?? 1}</strong> of <strong>{data?.pageInfo?.totalPages ?? 1}</strong>
                </span>
                <button className="px-3 py-2 rounded-xl border disabled:opacity-50"
                  onClick={() => goPage(page + 1)}
                  disabled={!data?.pageInfo?.hasNext}>
                  Next
                </button>
              </footer>
            </>
          )}
        </section >

        {/* DERECHA: detalle */}
        <section className="hidden md:block flex-1 bg-gray-50">
          <CharacterDetail id={selectedId} />
        </section>
      </div>
    </main>
  );
}
