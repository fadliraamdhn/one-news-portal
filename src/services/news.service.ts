import Parser from "rss-parser";
import { prisma } from "~/prisma/client";
import { rssResource } from "~/utils/rssResource";
import type { GetNewsParams } from "~/types/news.fetch";

const parser = new Parser();

const financeKeywords = [
    "saham", "ipo", "dividen", "emiten", "ihsg", "pasar modal", "bursa", "sekuritas", "pendanaan", "IHSG", "idx", "BEI",
    "investasi", "obligasi", "reksa dana", "reksadana", "keuangan", "perbankan", "ekonomi", "aksi korporasi",
    "inflasi", "rupiah", "bea cukai", "pajak", "corporate action", "korporasi", "perusahaan", "bursa efek", 
];

const keywordPattern = new RegExp(`\\b(${financeKeywords.join("|")})\\b`, "i");

export interface NormalizedArticle {
    source: string;
    category: string;
    title: string;
    link: string;
    pubDate: string;
    snippet: string;
    imageUrl: string | null;
    content: string | null;
}

export interface CategorizedArticles {
    finance: NormalizedArticle[];
    general: NormalizedArticle[];
}

export async function fetchAndCategorizeNews(): Promise<CategorizedArticles> {
    const categorized: CategorizedArticles = { finance: [], general: [] };

    for (const source of rssResource) {
        try {
            const feed = await parser.parseURL(source.rssUrl);

            const filteredItems = source.category === "finance"
                ? feed.items
                : feed.items.filter((item) =>
                    keywordPattern.test(
                        `${item.title ?? ""} ${item.contentSnippet ?? ""} ${item.summary ?? ""}`
                    )
                );

            const normalized: NormalizedArticle[] = filteredItems
                .filter((item): item is Required<typeof item> => !!item.link)
                .map((item) => ({
                    source: source.name,
                    category: source.category,
                    title: item.title ?? "",
                    link: item.link,
                    pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
                    snippet: item.contentSnippet || item.summary || "",
                    imageUrl:
                        (item.enclosure && item.enclosure.url) ||
                        extractImageFromContent(item["content:encoded"] || item.content) ||
                        null,
                    content: item["content:encoded"] || item.content || null,
                }));

            if (source.category === "finance") {
                categorized.finance.push(...normalized);
            } else {
                categorized.general.push(...normalized);
            }

            await saveArticlesToDatabase(normalized, source);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Gagal parsing ${source.name}: ${err.message}`);
        }
    }

    return categorized;
}

async function saveArticlesToDatabase(
    articles: NormalizedArticle[],
    source: { name: string; url: string; rssUrl: string; category: string }
): Promise<void> {
    const sourceRecord = await prisma.source.upsert({
        where: { rssUrl: source.rssUrl },
        update: { name: source.name, url: source.url, category: source.category },
        create: { name: source.name, url: source.url, rssUrl: source.rssUrl, category: source.category },
    });

    for (const article of articles) {
        await prisma.article.upsert({
            where: { link: article.link },
            update: {},
            create: {
                title: article.title,
                link: article.link,
                content: article.content ?? undefined,
                snippet: article.snippet,
                imageUrl: article.imageUrl ?? undefined,
                pubDate: new Date(article.pubDate),
                sourceId: sourceRecord.id,
                keyword: [],
            },
        });
    }
}

function extractImageFromContent(content?: string): string | null {
    if (!content) return null;
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match && match[1] ? match[1] : null;
}

export async function getAllNews({
    sourceId,
    date,
    search,
    sortOrder = "desc",
    page = "1",
    limit = "25",
}: GetNewsParams) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 25
    const skip = (pageNum - 1) * limitNum

    const where: {
        sourceId?: number
        pubDate?: { gte?: Date; lt?: Date }
        OR?: { title?: { contains: string; mode: "insensitive" }; snippet?: { contains: string; mode: "insensitive" }; content?: { contains: string; mode: "insensitive" } }[]
    } = {}

    if (sourceId && !isNaN(Number(sourceId))) {
        where.sourceId = Number(sourceId)
    }

    if (date) {
        const start = new Date(`${date}T00:00:00+07:00`)
        const end = new Date(`${date}T23:59:59+07:00`)

        where.pubDate = { gte: start, lt: end }
    }

    if (search && search.trim().length > 0) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { snippet: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
        ]
    }

    const [data, total] = await Promise.all([
        prisma.article.findMany({
            where,
            orderBy: { pubDate: "desc" },
            skip,
            take: limitNum,
            include: {
                source: { select: { id: true, name: true, category: true } },
            },
        }),
        prisma.article.count({ where }),
    ])

    return {
        total,
        page: pageNum,
        limit: limitNum,
        data,
    }
}