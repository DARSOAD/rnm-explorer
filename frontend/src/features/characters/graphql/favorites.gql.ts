import { gql } from "@apollo/client";

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavorite($input: FavoriteInput!) {
    toggleFavorite(input: $input) {
      characterId
      isFavorite
    }
  }
`;
