import type { CharacterCardVM } from "../../../core/adapters/Character.adapter";

export function CharacterCard({ c }: { c: CharacterCardVM }) {
  return (
    <article className="rounded-2xl shadow p-3 bg-white dark:bg-gray-900">
      <img
        src={c.image ?? ""}
        alt={c.name}
        className="w-full h-52 object-cover rounded-xl mb-3 bg-gray-100"
        onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = `${c.name} (no image)`))}
      />
      <h3 className="text-lg font-semibold">{c.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {c.status ?? "Unknown"} • {c.species ?? "Unknown"} • {c.gender ?? "Unknown"}
      </p>
    </article>
  );
}
