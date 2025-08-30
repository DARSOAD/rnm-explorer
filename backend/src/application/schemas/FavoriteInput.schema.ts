import { z } from "zod";

export const FavoriteInputSchema = z.object({
  characterId: z.string().uuid("characterId must be UUID"),
  viewerId: z.string().min(1).max(200),
});

export type FavoriteInput = z.infer<typeof FavoriteInputSchema>;
