import { useToggleFavorite } from "../hooks/useToggleFavorite";

type Props = {
  characterId: string;
  isFavorite: boolean;
  className?: string;
};

export default function FavoriteButton({ characterId, isFavorite, className }: Props) {
  const { toggle, loading, error } = useToggleFavorite();

  const handleClick = () => {
    void toggle({ characterId, currentIsFavorite: isFavorite });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1",
          isFavorite
            ? "bg-yellow-100 text-yellow-800 ring-yellow-200 hover:bg-yellow-200"
            : "bg-gray-100 text-gray-700 ring-gray-200 hover:bg-gray-200",
          loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="text-base">{isFavorite ? "★" : "☆"}</span>
        {isFavorite ? "Favorited" : "Add to favorites"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">
          Could not update favorite. Try again.
        </p>
      )}
    </div>
  );
}
