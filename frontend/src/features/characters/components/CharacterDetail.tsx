// frontend/src/features/characters/components/CharacterDetail.tsx
import { useCharacterDetail } from "../hooks/useCharacterDetail";
import { Skeleton } from "../../shared/ui/Skeleton";
import CommentsPanel from "./CommentsPanel";
import FavoriteButton from "./FavoriteButton";

export default function CharacterDetail({ id }: { id?: string }) {
  const { data, loading, error } = useCharacterDetail(id);
  console.log("[Detail] render", { id, loading, hasData: !!data, error });

  if (!id) {
    return (
      <aside className="h-full flex items-center justify-center text-gray-500">
        Select a character to see details
      </aside>
    );
  }

  if (loading) {
    console.log("[Detail] loading", { id, loading, hasData: !!data, error });
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-40 w-40 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.log("[Detail] error", { id, loading, hasData: !!data, error });
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 p-4">
        Could not load character details. Please try again.
      </div>
    );
  }

  if (!data) {
    console.log("[Detail] data", { id, loading, hasData: !!data, error });
    return <div className="text-gray-500">Character not found.</div>;
  }

  console.log("[Detail] return", { id, loading, hasData: !!data, error });
  return (
    
    <section className="space-y-6">
      <header className="flex items-center gap-4">
        {data.image && (
          <img src={data.image} alt={data.name} className="h-20 w-20 rounded-xl object-cover ring-1 ring-black/5" />
        )}
        <div>
          <h2 className="text-2xl font-bold">{data.name}</h2>
          {data.isFavorite && (
            <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
              ★ Favorite
            </span>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><dt className="text-xs uppercase text-gray-500">Status</dt><dd className="text-sm">{data.status ?? "—"}</dd></div>
        <div><dt className="text-xs uppercase text-gray-500">Species</dt><dd className="text-sm">{data.species ?? "—"}</dd></div>
        <div><dt className="text-xs uppercase text-gray-500">Gender</dt><dd className="text-sm">{data.gender ?? "—"}</dd></div>
        <div><dt className="text-xs uppercase text-gray-500">Origin</dt><dd className="text-sm">{data.originId?? "—"}</dd></div>
      </dl>

      {/* """"""""""""*/}
      
      {/* Botón de favoritos */}
      {id && (
          <FavoriteButton
            characterId={id}
            isFavorite={!!data.isFavorite}
            className="ml-auto"
          />
        )}
      {/* """"""""""""*/}
      {id && (
        <div className="pt-4 border-t">
          <CommentsPanel characterId={id} />
        </div>
      )}
    </section>
  );
}
