"use server"

import { searchComics as search } from "./scraper"

export async function searchComics(query: string) {
  return search(query)
}
