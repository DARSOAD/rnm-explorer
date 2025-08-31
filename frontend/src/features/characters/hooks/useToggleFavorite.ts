import { useMutation, ApolloCache } from "@apollo/client";
import { TOGGLE_FAVORITE_MUTATION } from "../graphql/favorites.gql";
export const VIEWER = "global"; 

type ToggleArgs = { characterId: string; currentIsFavorite: boolean };

function updateCharacterFavoriteFlag(
  cache: ApolloCache<any>,
  characterId: string,
  isFavorite: boolean
) {
  const id = cache.identify({ __typename: "Character", id: characterId });
  if (!id) return;
  cache.modify({
    id,
    fields: {
      isFavorite() {
        return isFavorite;
      },
    },
  });
}

export function useToggleFavorite() {
  const [mutate, { loading, error }] = useMutation(TOGGLE_FAVORITE_MUTATION);
  const toggle = async ({ characterId, currentIsFavorite }: ToggleArgs) => {
    const optimisticIsFav = !currentIsFavorite;
    return mutate({
      variables: {
        input: { characterId, viewerId: VIEWER },
      },
      optimisticResponse: {
        toggleFavorite: {
          __typename: "Favorite",
          characterId,
          isFavorite: optimisticIsFav,
        },
      },
      update: (cache, { data }) => {
        const isFav = data?.toggleFavorite?.isFavorite ?? optimisticIsFav;
        updateCharacterFavoriteFlag(cache, characterId, isFav);
      },
      // fallback por si el backend no normaliza el Character en la misma operación
      onQueryUpdated: (obsQuery) => obsQuery.refetch(),
    });
  };

  return { toggle, loading, error };
}
