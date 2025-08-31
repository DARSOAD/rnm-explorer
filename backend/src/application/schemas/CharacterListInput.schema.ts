import { z } from "zod";

export const CharacterSortEnum = z.enum(["NAME_ASC", "NAME_DESC"]);

const Filters = z.object({
  status: z.string().trim().min(1).optional(),
  species: z.string().trim().min(1).optional(),
  gender: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  origin: z.string().trim().min(1).optional(),   // filtrar por nombre de origen
  originId: z.string().trim().min(1).optional(), // filtrar por ID de origen
}).partial().default({});

export const CharacterListInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sort: CharacterSortEnum.default("NAME_ASC"),
  filters: Filters,
});

export type CharacterListInput = z.infer<typeof CharacterListInputSchema>;

export function normalizeCharacterListInput(raw: unknown): CharacterListInput {
  return CharacterListInputSchema.parse(raw);
}
