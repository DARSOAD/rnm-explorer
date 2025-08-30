import { z } from "zod";


export const SortEnum = z.enum(["NAME_ASC", "NAME_DESC"]);
export type Sort = z.infer<typeof SortEnum>;


export const CharacterListInputSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sort: SortEnum.default("NAME_ASC"),

  status: z.string().trim().min(1).optional(),
  species: z.string().trim().min(1).optional(),
  gender: z.string().trim().min(1).optional(),
  origin: z.string().uuid().optional(),
  name: z.string().trim().min(1).optional(),
});


export type CharacterListInput = z.infer<typeof CharacterListInputSchema>;


export type ListParams = CharacterListInput;
