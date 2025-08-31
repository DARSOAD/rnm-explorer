import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterCard } from "../components/CharacterCard";
import FiltersBar from "../components/FiltersBar";
import { readUrlState, writeUrlState } from "../../../core/adapters/urlSearchParams";
import { Skeleton } from "../../shared/ui/Skeleton";

export default function ListPage() {
  const [sp, setSp] = useSearchParams();
  const u = readUrlState(sp);

  // Armar input para el service
  const input = useMemo(() => ({
    page: u.page ?? 1,
    pageSize: u.pageSize ?? 15,
    sort: u.sort ?? "NAME_ASC",
    filters: {
      status: u.status, species: u.species, gender: u.gender,
      name: u.name, origin: u.origin,
    },
  }), [u.page, u.pageSize, u.sort, u.status, u.species, u.gender, u.name, u.origin]);

  const { data, loading, error } = useCharacters(input);

  const onFiltersChange = (next: {
    sort: "NAME_ASC" | "NAME_DESC";
    status?: string; species?: string; gender?: string; name?: string; origin?: string;
  }) => {
    const nextState = { ...u, ...next, page: 1 }; // 🔁 reset page 
    const nextSp = new URLSearchParams(sp);
    writeUrlState(nextSp, nextState);
    setSp(nextSp, { replace: false });
  };

  const goPage = (p: number) => {
    const nextSp = new URLSearchParams(sp);
    writeUrlState(nextSp, { ...u, page: p });
    setSp(nextSp, { replace: false });
  };

  return (
    <main className="p-4">
      <header className="mb-3">
        <h1 className="text-2xl font-bold">Characters</h1>
      </header>

      <FiltersBar
        value={{
          sort: u.sort ?? "NAME_ASC",
          status: u.status, species: u.species, gender: u.gender,
          name: u.name ?? "", origin: u.origin ?? "",
        }}
        onChange={onFiltersChange}
      />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: u.pageSize ?? 15 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
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
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {data.items.map((c) => <CharacterCard key={c.id} c={c} />)}
            </section>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300 py-16">No characters found.</div>
          )}

          <footer className="flex items-center justify-center gap-3 mt-6">
            <button className="px-3 py-2 rounded-xl border disabled:opacity-50"
              onClick={() => goPage(Math.max(1, (u.page ?? 1) - 1))}
              disabled={!data?.pageInfo?.hasPrev}
            >
              Prev
            </button>
            <span className="text-sm">Page <strong>{data?.pageInfo?.page ?? 1}</strong> of <strong>{data?.pageInfo?.totalPages ?? 1}</strong></span>
            <button className="px-3 py-2 rounded-xl border disabled:opacity-50"
              onClick={() => goPage((u.page ?? 1) + 1)}
              disabled={!data?.pageInfo?.hasNext}
            >
              Next
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
