import axios from "axios";
import * as cheerio from "cheerio";

// Define Types
export interface MangaDetail {
  title: string;
  alternativeTitle: string;
  description: string;
  sinopsis: string;
  thumbnail: string;
  info: Record<string, string>;
  genres: string[];
  slug: string;
  firstChapter: ChapterInfo;
  latestChapter: ChapterInfo;
  chapters: ChapterListItem[];
  similarKomik: SimilarManga[];
}

export interface ChapterInfo {
  title: string;
  originalLink: string | null;
  apiLink: string | null;
  chapterNumber: string;
}

export interface ChapterListItem {
  title: string;
  originalLink: string | null;
  apiLink: string | null;
  views: string;
  date: string;
  chapterNumber: string;
}

export interface SimilarManga {
  title: string;
  originalLink: string;
  apiLink: string | null;
  thumbnail: string;
  type: string;
  genres: string;
  synopsis: string;
  views: string;
  slug: string;
}

export interface ChapterDetail {
  title: string;
  mangaInfo: {
    title: string;
    originalLink: string | null;
    apiLink: string | null;
    slug: string;
  };
  description: string;
  chapterInfo: Record<string, string>;
  images: Array<{
    src: string;
    alt: string;
    id: string;
    fallbackSrc: string;
  }>;
  meta: {
    chapterNumber: string;
    totalImages: number;
    publishDate: string;
    viewAnalyticsUrl: string;
    slug: string;
  };
  navigation: {
    prevChapter: ChapterNav | null;
    nextChapter: ChapterNav | null;
    allChapters: string | null;
  };
  additionalDescription: string;
}

export interface ChapterNav {
  originalLink: string;
  apiLink: string;
  slug: string;
  chapter: string;
}

export interface SearchResult {
  title: string;
  altTitle: string | null;
  slug: string;
  href: string;
  thumbnail: string;
  type: string;
  genre: string | null;
  description: string;
  // chapter info omitted in original search controller return but present in parse
}

export interface LatestManga {
  title: string;
  originalLink: string;
  thumbnail: string;
  type: string;
  genre: string;
  updateTime: string;
  latestChapterTitle: string;
  latestChapterLink: string | null;
  isColored: boolean;
  updateCountText: string;
  mangaSlug: string;
  apiDetailLink: string | null;
  apiChapterLink: string | null;
}

const URL_KOMIKU = "https://komiku.org/";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Referer: "https://komiku.id/",
  "Cache-Control": "public, max-age=3600",
};

// Utils
function extractSlugAndChapter(url: string) {
    const matches =
      url.match(/\/([^\/]+?)-chapter-([^\/]+?)(?:\/|$)/) ||
      url.match(/\/manga\/[^\/]+\/chapter\/([^\/]+?)(?:\/|$)/);
    if (matches && matches[1] && matches[2]) {
      return {
        slug: matches[1],
        chapter: matches[2],
      };
    } else if (url.includes("-chapter-")) {
      const parts = url.split("/");
      const chapterPart = parts.find((part) => part.includes("-chapter-"));
      if (chapterPart) {
        const chapterMatch = chapterPart.match(/^(.*?)-chapter-(.*?)$/);
        if (chapterMatch && chapterMatch[1] && chapterMatch[2]) {
          return {
            slug: chapterMatch[1],
            chapter: chapterMatch[2],
          };
        }
      }
    }
    return { slug: "", chapter: "" };
}

// API Functions

export async function getLatest(): Promise<LatestManga[]> {
  try {
    const { data } = await axios.get(URL_KOMIKU, {
      headers: HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const komikTerbaru: LatestManga[] = [];

    $("#Terbaru div.ls4w article.ls4").each((i, el) => {
      const element = $(el);

      const linkElement = element.find(".ls4v > a").first();
      const imgElement = linkElement.find("img");
      const detailElement = element.find(".ls4j");

      const titleFromImgAlt = imgElement
        .attr("alt")
        ?.replace(/^Baca (Manga|Manhwa|Manhua)\s+/i, "")
        .trim();
      const titleFromH3 = detailElement.find("h3 > a").text().trim();
      const title = titleFromH3 || titleFromImgAlt || "Judul Tidak Tersedia";

      const originalLinkPath = linkElement.attr("href");
      const originalLink = originalLinkPath?.startsWith("http")
        ? originalLinkPath
        : originalLinkPath
        ? `${URL_KOMIKU.slice(0, -1)}${originalLinkPath}`
        : "";

      let thumbnail = imgElement.attr("data-src") || "";
      if (!thumbnail || thumbnail.trim() === "") {
        thumbnail = imgElement.attr("src") || "";
      }

      const typeGenreTimeString = detailElement.find("span.ls4s").text().trim();
      let type = "Unknown";
      let genre = "Unknown";
      let updateTime = "Unknown";

      const typeMatch = typeGenreTimeString.match(/^(Manga|Manhwa|Manhua)/i);
      if (typeMatch) {
        type = typeMatch[0];
        const restOfString = typeGenreTimeString.substring(type.length).trim();
        const timeMatch = restOfString.match(/(.+?)\s+([\d\w\s]+lalu)$/i);
        if (timeMatch) {
          genre = timeMatch[1].trim();
          updateTime = timeMatch[2].trim();
        } else {
          genre = restOfString;
        }
      } else {
        const parts = typeGenreTimeString.split(/\s+/);
        if (parts.length >= 2) {
          if (parts[parts.length - 1] === "lalu" && parts.length > 2) {
            updateTime = parts.slice(-2).join(" ");
            genre = parts.slice(0, -2).join(" ");
          } else {
            genre = typeGenreTimeString;
          }
        } else {
          genre = typeGenreTimeString;
        }
      }

      const latestChapterElement = detailElement.find("a.ls24");
      const latestChapterTitle = latestChapterElement.text().trim();
      const latestChapterLinkPath = latestChapterElement.attr("href");
      const latestChapterLink = latestChapterLinkPath?.startsWith("http")
        ? latestChapterLinkPath
        : latestChapterLinkPath
        ? `${URL_KOMIKU.slice(0, -1)}${latestChapterLinkPath}`
        : null;

      const isColored = element.find(".ls4v span.warna").length > 0;
      const updateCountText = element.find(".ls4v span.up").text().trim();

      let mangaSlug = "";
      if (originalLinkPath) {
        const slugMatches = originalLinkPath.match(/\/manga\/([^/]+)/);
        if (slugMatches && slugMatches[1]) {
          mangaSlug = slugMatches[1];
        }
      }
      const apiDetailLink = mangaSlug ? `/detail-komik/${mangaSlug}` : null;

      let apiChapterLink = null;
      if (latestChapterLinkPath && mangaSlug) {
        const chapterNumMatch =
          latestChapterLinkPath.match(/-chapter-([\d.]+)\/?$/i) ||
          latestChapterLinkPath.match(/\/([\d.]+)\/?$/i);
        if (chapterNumMatch && chapterNumMatch[1]) {
          const chapterNumber = chapterNumMatch[1];
          apiChapterLink = `/baca-chapter/${mangaSlug}/${chapterNumber}`;
        }
      }

      if (
        title &&
        title !== "Judul Tidak Tersedia" &&
        thumbnail &&
        originalLink
      ) {
        komikTerbaru.push({
          title,
          originalLink,
          thumbnail,
          type,
          genre,
          updateTime,
          latestChapterTitle,
          latestChapterLink,
          isColored,
          updateCountText,
          mangaSlug,
          apiDetailLink,
          apiChapterLink,
        });
      }
    });

    return komikTerbaru;
  } catch (err) {
    console.error("Error in getLatest:", err);
    throw new Error("Failed to fetch latest manga");
  }
}

export async function getMangaDetail(slug: string): Promise<MangaDetail> {
  const url = `${URL_KOMIKU}manga/${slug}/`;
  try {
    const { data } = await axios.get(url, {
      headers: HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    const title = $("h1 span[itemprop='name']").text().trim();
    const alternativeTitle = $("p.j2").text().trim();
    const description = $("p.desc").text().trim();
    const sinopsis = $("section#Sinopsis p").text().trim();

    const thumbnail = $("section#Informasi div.ims img").attr("src") || "";

    const infoTable: Record<string, string> = {};
    $("section#Informasi table.inftable tr").each((i, el) => {
      const key = $(el).find("td").first().text().trim();
      const value = $(el).find("td").last().text().trim();
      infoTable[key] = value;
    });

    const genres: string[] = [];
    $("section#Informasi ul.genre li").each((i, el) => {
      genres.push($(el).text().trim());
    });

    const firstChapterLink = $("#Judul div.new1:contains('Awal:') a").attr(
      "href"
    );
    const latestChapterLink = $("#Judul div.new1:contains('Terbaru:') a").attr(
      "href"
    );

    let firstChapterSlug = "";
    let firstChapterNumber = "";
    if (firstChapterLink) {
      const chapterMatches = firstChapterLink.match(
        /\/([^/]+)-chapter-([^/]+)\//
      );
      if (chapterMatches && chapterMatches[1] && chapterMatches[2]) {
        firstChapterSlug = chapterMatches[1];
        firstChapterNumber = chapterMatches[2];
      }
    }

    let latestChapterSlug = "";
    let latestChapterNumber = "";
    if (latestChapterLink) {
      const chapterMatches = latestChapterLink.match(
        /\/([^/]+)-chapter-([^/]+)\//
      );
      if (chapterMatches && chapterMatches[1] && chapterMatches[2]) {
        latestChapterSlug = chapterMatches[1];
        latestChapterNumber = chapterMatches[2];
      }
    }

    const firstChapter: ChapterInfo = {
      title: $("#Judul div.new1:contains('Awal:') a")
        .text()
        .replace("Awal:", "")
        .trim(),
      originalLink: firstChapterLink || null,
      apiLink:
        firstChapterSlug && firstChapterNumber
          ? `/baca-chapter/${firstChapterSlug}/${firstChapterNumber}`
          : null,
      chapterNumber: firstChapterNumber,
    };

    const latestChapter: ChapterInfo = {
      title: $("#Judul div.new1:contains('Terbaru:') a")
        .text()
        .replace("Terbaru:", "")
        .trim(),
      originalLink: latestChapterLink || null,
      apiLink:
        latestChapterSlug && latestChapterNumber
          ? `/baca-chapter/${latestChapterSlug}/${latestChapterNumber}`
          : null,
      chapterNumber: latestChapterNumber,
    };

    const chapters: ChapterListItem[] = [];
    $("table#Daftar_Chapter tbody tr").each((i, el) => {
      if ($(el).find("th").length > 0) return;

      const chapterTitle = $(el).find("td.judulseries a span").text().trim();
      const chapterLink = $(el).find("td.judulseries a").attr("href");
      const views = $(el).find("td.pembaca i").text().trim();
      const date = $(el).find("td.tanggalseries").text().trim();

      let chapterSlug = "";
      let chapterNumber = "";
      if (chapterLink) {
        const chapterMatches = chapterLink.match(/\/([^/]+)-chapter-([^/]+)\//);
        if (chapterMatches && chapterMatches[1] && chapterMatches[2]) {
          chapterSlug = chapterMatches[1];
          chapterNumber = chapterMatches[2];
        }
      }

      chapters.push({
        title: chapterTitle,
        originalLink: chapterLink || null,
        apiLink:
          chapterSlug && chapterNumber
            ? `/baca-chapter/${chapterSlug}/${chapterNumber}`
            : null,
        views,
        date,
        chapterNumber,
      });
    });

    const similarKomik: SimilarManga[] = [];
    try {
      $("section#Spoiler div.grd").each((i, el) => {
        try {
          const title = $(el).find("div.h4").text().trim();
          const link = $(el).find("a").attr("href");

          let thumbnail = $(el).find("img").attr("src") || "";

          if (
            $(el).find("img").hasClass("lazy") ||
            (thumbnail && thumbnail.includes("lazy.jpg"))
          ) {
            thumbnail = $(el).find("img").attr("data-src") || thumbnail;
          }

          const type = $(el).find("div.tpe1_inf b").text().trim() || "";
          const genres =
            $(el).find("div.tpe1_inf").text().replace(type, "").trim() || "";
          const synopsis = $(el).find("p").text().trim() || "";
          const views = $(el).find("div.vw").text().trim() || "";

          let similarKomikSlug = "";
          if (link) {
            const mangaMatches = link.match(/\/manga\/([^/]+)/);
            if (mangaMatches && mangaMatches[1]) {
              similarKomikSlug = mangaMatches[1];
            }
          }

          similarKomik.push({
            title,
            originalLink: link || "",
            apiLink: similarKomikSlug
              ? `/detail-komik/${similarKomikSlug}`
              : null,
            thumbnail,
            type,
            genres,
            synopsis,
            views,
            slug: similarKomikSlug,
          });
        } catch (itemError) {
          // ignore
        }
      });
    } catch (sectionError) {
       // ignore
    }

    return {
      title,
      alternativeTitle,
      description,
      sinopsis,
      thumbnail,
      info: infoTable,
      genres,
      slug,
      firstChapter: {
        ...firstChapter,
        originalLink: firstChapter.originalLink?.startsWith("http")
          ? firstChapter.originalLink
          : `https://komiku.id${firstChapter.originalLink}`,
      },
      latestChapter: {
        ...latestChapter,
        originalLink: latestChapter.originalLink?.startsWith("http")
          ? latestChapter.originalLink
          : `https://komiku.id${latestChapter.originalLink}`,
      },
      chapters: chapters.map((chapter) => ({
        ...chapter,
        originalLink: chapter.originalLink?.startsWith("http")
          ? chapter.originalLink
          : `https://komiku.id${chapter.originalLink}`,
      })),
      similarKomik: similarKomik.map((komik) => ({
        ...komik,
        originalLink: komik.originalLink?.startsWith("http")
          ? komik.originalLink
          : `https://komiku.id${komik.originalLink}`,
      })),
    };
  } catch (err) {
    console.error("Error fetching komik detail:", err);
    throw err;
  }
}

export async function getChapter(slug: string, chapter: string): Promise<ChapterDetail> {
    const chapterUrl = `${URL_KOMIKU}${slug}-chapter-${chapter}/`;
    try {
        const { data } = await axios.get(chapterUrl, {
            headers: HEADERS,
            timeout: 10000, 
        });

        const $ = cheerio.load(data);

        const title = $("#Judul h1").text().trim();
        const mangaTitleElement = $("#Judul p a b");
        const mangaTitle = mangaTitleElement.text().trim();
        const mangaLink = mangaTitleElement.parent().attr("href") || ""; 
        const description =
            $("#Description")
                .first()
                .contents()
                .filter(function () {
                    return this.type === "text";
                })
                .text()
                .trim() +
            " " +
            $("#Description b").first().text().trim() +
            " " +
            $("#Description a[href='/'] b").first().text().trim();

        let mangaSlug = "";
        if (mangaLink) {
            const mangaMatches = mangaLink.match(/\/manga\/([^/]+)/);
            if (mangaMatches && mangaMatches[1]) {
                mangaSlug = mangaMatches[1];
            }
        }

        const chapterInfo: Record<string, string> = {};
        $("#Judul table.tbl tbody tr").each((i, el) => {
            const key = $(el).find("td").first().text().trim();
            const value = $(el).find("td").last().text().trim();
            chapterInfo[key] = value;
        });

        const images: Array<{ src: string; alt: string; id: string; fallbackSrc: string }> = [];
        $("#Baca_Komik img").each((i, el) => {
            const src = $(el).attr("src") || "";
            const alt = $(el).attr("alt") || "";
            const id = $(el).attr("id") || "";

            if (
                src &&
                (src.includes("komiku.org/upload") ||
                    src.includes("cdn.komiku.org/upload") ||
                    src.includes("img.komiku.org/upload")) &&
                id
            ) {
                images.push({
                    src,
                    alt,
                    id,
                    fallbackSrc: src
                        .replace("cdn.komiku.id", "img.komiku.id")
                        .replace("komiku.id/upload", "img.komiku.id/upload"),
                });
            }
        });

        const chapterValueInfo = $(".chapterInfo").attr("valuechapter") || "";
        const totalImages =
            $(".chapterInfo").attr("valuegambar") || images.length.toString();
        const viewAnalyticsUrl = $(".chapterInfo").attr("valueview") || "";
        const additionalDescription = $("#Komentar p").first().text().trim();
        const publishDate =
            $("time[property='datePublished']").attr("datetime") ||
            $("time").first().text().trim();

        let prevChapterLink = "";
        const prevLinkElement = $(".nxpr a.rl[href*='-chapter-']");
        if (prevLinkElement.length > 0) {
            prevChapterLink = prevLinkElement.attr("href") || "";
        }

        let nextChapterLink = "";
        const nextLinkElementRR = $(".nxpr a.rr[href*='-chapter-']");
        if (nextLinkElementRR.length > 0) {
            nextChapterLink = nextLinkElementRR.attr("href") || "";
        } else {
            $(".nxpr a[href*='-chapter-']").each((i, el) => {
                const potentialNextHref = $(el).attr("href");
                if (potentialNextHref && potentialNextHref !== prevChapterLink) {
                    nextChapterLink = potentialNextHref;
                    return false;
                }
            });
        }

        let prevChapterInfo: ChapterNav | null = null;
        if (prevChapterLink) {
            const { slug: prevSlug, chapter: prevChapter } =
                extractSlugAndChapter(prevChapterLink);
            if (prevSlug && prevChapter) {
                prevChapterInfo = {
                    originalLink: prevChapterLink.startsWith("http")
                        ? prevChapterLink
                        : `${URL_KOMIKU}${
                            prevChapterLink.startsWith("/")
                                ? prevChapterLink.substring(1)
                                : prevChapterLink
                        }`,
                    apiLink: `/baca-chapter/${prevSlug}/${prevChapter}`,
                    slug: prevSlug,
                    chapter: prevChapter,
                };
            }
        }

        let nextChapterInfo: ChapterNav | null = null;
        if (nextChapterLink) {
            const { slug: nextSlug, chapter: nextChapter } =
                extractSlugAndChapter(nextChapterLink);
            if (nextSlug && nextChapter) {
                nextChapterInfo = {
                    originalLink: nextChapterLink.startsWith("http")
                        ? nextChapterLink
                        : `${URL_KOMIKU}${
                            nextChapterLink.startsWith("/")
                                ? nextChapterLink.substring(1)
                                : nextChapterLink
                        }`,
                    apiLink: `/baca-chapter/${nextSlug}/${nextChapter}`,
                    slug: nextSlug,
                    chapter: nextChapter,
                };
            }
        }

        return {
            title,
            mangaInfo: {
                title: mangaTitle,
                originalLink: mangaLink?.startsWith("http")
                    ? mangaLink
                    : mangaLink
                        ? `${URL_KOMIKU}${
                            mangaLink.startsWith("/") ? mangaLink.substring(1) : mangaLink
                        }`
                        : null,
                apiLink: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
                slug: mangaSlug,
            },
            description,
            chapterInfo,
            images,
            meta: {
                chapterNumber: chapterValueInfo || chapter,
                totalImages: parseInt(totalImages) || 0,
                publishDate,
                viewAnalyticsUrl,
                slug: slug,
            },
            navigation: {
                prevChapter: prevChapterInfo,
                nextChapter: nextChapterInfo,
                allChapters: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
            },
            additionalDescription,
        };
    } catch (err) {
        console.error("Error fetching chapter:", err);
        throw err;
    }
}

export async function searchManga(keyword: string): Promise<SearchResult[]> {
  const searchUrl = `https://komiku.org/?s=${encodeURIComponent(
    keyword
  )}&post_type=manga`;

  try {
    const { data } = await axios.get(searchUrl, {
      headers: HEADERS,
    });

    const $ = cheerio.load(data);
    let hasil: SearchResult[] = [];

    // Helper for results parsing
    const parseResults = ($context: cheerio.CheerioAPI, resultsArray: SearchResult[]) => {
      // @ts-ignore
      $context(".bge").each((i, el) => {
        try {
          const bgei = $context(el).find(".bgei");
          const kan = $context(el).find(".kan");

          const mangaLink = bgei.find("a").attr("href") || "";
          const slug = mangaLink.replace("/manga/", "").replace(/\/$/, "");

          const thumbnail = bgei.find("img").attr("src") || "";
          const title = kan.find("h3").text().trim();
          const altTitle = kan.find(".judul2").text().trim();
          const description = kan.find("p").text().trim();
          const type = bgei.find(".tpe1_inf b").text().trim();
          const genre = bgei.find(".tpe1_inf").text().replace(type, "").trim();
          const href = `/detail-komik/${slug}/`;

          resultsArray.push({
            title,
            altTitle: altTitle || null,
            slug,
            href,
            thumbnail,
            type,
            genre: genre || null,
            description,
          });
        } catch (error) {
          console.log("Error parsing manga item:", error);
        }
      });
    };

    const htmxElement = $(".daftar span[hx-get]");
    let useBackupMethod = false;

    if (htmxElement.length > 0) {
      const htmxApiUrl = htmxElement.attr("hx-get");

      if (htmxApiUrl) {
        try {
          const htmxResponse = await axios.get(htmxApiUrl, {
            headers: {
              ...HEADERS,
              "HX-Request": "true",
              Referer: searchUrl,
            },
          });

          const htmxHtml = htmxResponse.data;
          const $htmx = cheerio.load(htmxHtml);

          if ($htmx(".bge").length > 0) {
            parseResults($htmx, hasil);
          } else {
            useBackupMethod = true;
          }
        } catch (htmxError) {
          useBackupMethod = true;
        }
      } else {
        useBackupMethod = true;
      }
    }

    if (hasil.length === 0 || useBackupMethod) {
      parseResults($, hasil);
    }

    if (hasil.length === 0) {
      $("a").each((i, el) => {
        if ($(el).attr("href") && $(el).attr("href")?.includes("/manga/")) {
          const link = $(el).attr("href");
          const title = $(el).text().trim() || $(el).find("h3").text().trim();

          if (title && title.length > 3 && link) {
            const slug = link.replace(/^.*\/manga\//, "").replace(/\/$/, "");
            let thumbnail = $(el).find("img").attr("src") || "";

            hasil.push({
              title,
              slug,
              href: `/detail-komik/${slug}/`,
              thumbnail,
              source: "generic-parser",
            } as any);
          }
        }
      });

      // Dedup
      const slugs = new Set();
      hasil = hasil.filter((item) => {
        if (!slugs.has(item.slug)) {
          slugs.add(item.slug);
          return true;
        }
        return false;
      });
    }

    return hasil;
  } catch (err) {
    console.error("Error search:", err);
    throw err;
  }
}
