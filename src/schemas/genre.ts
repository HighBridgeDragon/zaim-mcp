import { z } from "zod";

const genreItemSchema = z
  .object({
    id: z.number(),
    category_id: z.number(),
    name: z.string(),
    sort: z.number(),
    active: z.number(),
    modified: z.string(),
    parent_genre_id: z.number(),
    local_id: z.number(),
  })
  .passthrough();

export const homeGenreResponseSchema = z
  .object({
    genres: z.array(genreItemSchema),
    requested: z.number(),
  })
  .passthrough();
