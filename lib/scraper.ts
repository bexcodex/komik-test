import * as cheerio from "cheerio"

const BASE_URL = "https://komiku.org"
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: "https://komiku.org/",
    },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.text()
}

export async function getRecommendations() {
  const html = await fetchHTML(BASE_URL)
  const $ = cheerio.load(html)
  const comics: any[] = []

  $("#Rekomendasi_Komik article.ls2").each((_, el) => {
    const anchor = $(el).find("a").first()
    const img = $(el).find("img")

    let title = img.attr("alt") || ""
    title = title.replace(/^Baca (Komik|Manga|Manhwa|Manhua)\s+/i, "").trim()

    const href = anchor.attr("href") || ""
    const slugMatch = href.match(/\/manga\/([^/]+)/)
    const slug = slugMatch ? slugMatch[1] : ""

    const thumbnail = img.attr("data-src") || img.attr("src") || ""

    if (title && thumbnail && slug) {
      comics.push({ title, slug, thumbnail })
    }
  })

  return comics
}

export async function getPopular() {
  const html = await fetchHTML(BASE_URL)
  const $ = cheerio.load(html)

  const sections: Record<string, any[]> = {
    manga: [],
    manhwa: [],
    manhua: [],
  }

  const selectorMap: Record<string, string> = {
    manga: "#Komik_Hot_Manga",
    manhwa: "#Komik_Hot_Manhwa",
    manhua: "#Komik_Hot_Manhua",
  }

  for (const [key, selector] of Object.entries(selectorMap)) {
    $(selector)
      .find("article.ls2")
      .each((_, el) => {
        const link = $(el).find(".ls2v > a").first()
        const img = link.find("img")
        const detail = $(el).find(".ls2j")

        let title =
          img
            .attr("alt")
            ?.replace(/^Baca (Manga|Manhwa|Manhua|Komik)\s+/i, "")
            .trim() || ""
        if (!title) title = detail.find("h3 a").text().trim()

        const href = link.attr("href") || ""
        const slugMatch = href.match(/\/manga\/([^/]+)/)
        const slug = slugMatch ? slugMatch[1] : ""

        const thumbnail = img.attr("data-src") || img.attr("src") || ""

        const infoText = detail.find(".ls2t").text().trim()
        const latestChapter = detail.find("a.ls2l").text().trim()

        if (title && thumbnail && slug) {
          sections[key].push({
            title,
            slug,
            thumbnail,
            latestChapter,
            genre: infoText.split(/\d/)[0]?.trim() || "",
          })
        }
      })
  }

  return sections
}

export async function getComicDetail(slug: string) {
  const html = await fetchHTML(`${BASE_URL}/manga/${slug}/`)
  const $ = cheerio.load(html)

  const title = $("h1 span[itemprop='name']").text().trim()
  const alternativeTitle = $("p.j2").text().trim()
  const description = $("p.desc").text().trim()
  const sinopsis = $("section#Sinopsis p").text().trim()
  const thumbnail = $("section#Informasi div.ims img").attr("src") || ""

  const info: Record<string, string> = {}
  $("section#Informasi table.inftable tr").each((_, el) => {
    const key = $(el).find("td").first().text().trim()
    const value = $(el).find("td").last().text().trim()
    if (key && value) info[key] = value
  })

  const genres: string[] = []
  $("section#Informasi ul.genre li").each((_, el) => {
    genres.push($(el).text().trim())
  })

  const chapters: any[] = []
  $("table#Daftar_Chapter tbody tr").each((_, el) => {
    if ($(el).find("th").length > 0) return

    const chapterTitle = $(el).find("td.judulseries a span").text().trim()
    const chapterLink = $(el).find("td.judulseries a").attr("href") || ""
    const views = $(el).find("td.pembaca i").text().trim()
    const date = $(el).find("td.tanggalseries").text().trim()

    const chapterMatch = chapterLink.match(/\/([^/]+)-chapter-([^/]+)\//)
    const chapterNumber = chapterMatch ? chapterMatch[2] : ""

    if (chapterTitle && chapterNumber) {
      chapters.push({
        title: chapterTitle,
        chapterNumber,
        views,
        date,
      })
    }
  })

  const similarKomik: any[] = []
  $("section#Spoiler div.grd").each((_, el) => {
    const itemTitle = $(el).find("div.h4").text().trim()
    const link = $(el).find("a").attr("href") || ""
    const itemThumbnail = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || ""

    const slugMatch = link.match(/\/manga\/([^/]+)/)
    const itemSlug = slugMatch ? slugMatch[1] : ""

    if (itemTitle && itemSlug) {
      similarKomik.push({
        title: itemTitle,
        slug: itemSlug,
        thumbnail: itemThumbnail,
      })
    }
  })

  return {
    title,
    alternativeTitle,
    description,
    sinopsis,
    thumbnail,
    info,
    genres,
    slug,
    chapters,
    similarKomik,
  }
}

export async function getChapter(slug: string, chapter: string) {
  const html = await fetchHTML(`${BASE_URL}/${slug}-chapter-${chapter}/`)
  const $ = cheerio.load(html)

  const title = $("#Judul h1").text().trim()
  const mangaTitle = $("#Judul p a b").text().trim()
  const mangaLink = $("#Judul p a").attr("href") || ""

  const mangaSlugMatch = mangaLink.match(/\/manga\/([^/]+)/)
  const mangaSlug = mangaSlugMatch ? mangaSlugMatch[1] : slug

  const images: any[] = []
  $("#Baca_Komik img").each((_, el) => {
    const src = $(el).attr("src") || ""
    const alt = $(el).attr("alt") || ""
    const id = $(el).attr("id") || ""

    if (src && (src.includes("komiku") || src.includes("upload"))) {
      images.push({ src, alt, id })
    }
  })

  // Navigation
  let prevChapter: { slug: string; chapter: string } | null = null
  let nextChapter: { slug: string; chapter: string } | null = null

  const prevLink = $(".nxpr a.rl[href*='-chapter-']").attr("href") || ""
  const nextLink = $(".nxpr a.rr[href*='-chapter-']").attr("href") || ""

  if (prevLink) {
    const match = prevLink.match(/\/([^/]+)-chapter-([^/]+)\//)
    if (match) prevChapter = { slug: match[1], chapter: match[2] }
  }

  if (nextLink) {
    const match = nextLink.match(/\/([^/]+)-chapter-([^/]+)\//)
    if (match) nextChapter = { slug: match[1], chapter: match[2] }
  }

  return {
    title,
    mangaInfo: { title: mangaTitle, slug: mangaSlug },
    images,
    meta: { chapterNumber: chapter, totalImages: images.length },
    navigation: { prevChapter, nextChapter },
  }
}

export async function searchComics(query: string) {
  const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=manga`
  const html = await fetchHTML(searchUrl)
  const $ = cheerio.load(html)

  const results: any[] = []

  $(".bge").each((_, el) => {
    const mangaLink = $(el).find(".bgei a").attr("href") || ""
    const slug = mangaLink.replace("/manga/", "").replace(/\/$/, "")
    const thumbnail = $(el).find(".bgei img").attr("src") || $(el).find(".sd").attr("src") || ""
    const title = $(el).find(".kan h3").text().trim()
    const description = $(el).find(".kan p").text().trim()
    const type = $(el).find(".tpe1_inf b").text().trim()

    if (title && slug) {
      results.push({ title, slug, thumbnail, description, type })
    }
  })

  return results
}
