// frontend/src/features/characters/components/CharacterCard.tsx
import type { CharacterCardVM } from "../../../core/adapters/Character.adapter";

type Props = {
  c: CharacterCardVM;
  onSelect?: (id: string) => void;   
  selected?: boolean;                
};

export function CharacterCard({ c, onSelect, selected }: Props) {
  const handleClick = () => {
    console.log("[Card] click", { id: c.id, name: c.name });
    onSelect?.(c.id);
  };
  return (
    <article
      onClick={handleClick}
      className={[
        "rounded-2xl shadow p-3 bg-white dark:bg-gray-900 cursor-pointer transition",
        selected ? "ring-2 ring-indigo-500" : "hover:shadow-md"
      ].join(" ")}
    >
      <img
        src={c.image ?? ""}
        alt={c.name}
        className="w-full h-52 object-cover rounded-xl mb-3 bg-gray-100"
        onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = `${c.name} (no image)`))}
      />
      <h3 className="text-lg font-semibold">{c.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {c.species ?? "—"} • {c.status ?? "Unknown"} {c.isFavorite ? "★" : ""}
      </p>
    </article>
  );
}
