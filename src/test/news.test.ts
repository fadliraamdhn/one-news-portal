import { describe, it, expect, mock } from "bun:test";
import { fetchAndCategorizeNews, getAllNews } from "~/services/news.service";
import type { CategorizedArticles } from "~/services/news.service";
import { rssResource } from "~/utils/rssResource";
import { prisma } from "~/prisma/client";

const mockParser = {
  parseURL: async () => ({
    items: [
      {
        title: "IHSG naik 2%",
        link: "https://example.com/ihsg",
        isoDate: new Date().toISOString(),
        contentSnippet: "Pasar modal naik hari ini",
      },
    ],
  }),
};

rssResource.splice(0, rssResource.length, {
  name: "Mock Finance Feed",
  rssUrl: "https://mock.finance.feed",
  url: "https://mock.finance",
  category: "finance",
});


(prisma as any).source = {
  upsert: mock(() =>
    Promise.resolve({ id: 1, name: "Mock Finance Feed", category: "finance" })
  ),
};

(prisma as any).article = {
  upsert: mock(() => Promise.resolve()),
  findMany: mock(() =>
    Promise.resolve([
      {
        id: 1,
        title: "IHSG naik 2%",
        snippet: "Pasar modal naik hari ini",
        pubDate: new Date(),
        source: { id: 1, name: "Mock Finance Feed", category: "finance" },
      },
    ])
  ),
  count: mock(() => Promise.resolve(1)),
};

// 🔹 TEST
describe("fetchAndCategorizeNews()", () => {
  it("harus mengkategorikan artikel RSS ke kategori yang sesuai", async () => {
    const categorized: CategorizedArticles = await fetchAndCategorizeNews(
      mockParser as any
    );

    expect(categorized?.finance?.length ?? 0).toBe(1);
    expect(categorized?.finance?.[0]?.title ?? "").toContain("IHSG");
    expect(categorized?.general?.length ?? 0).toBe(0);
  });
});

describe("getAllNews()", () => {
  it("harus mengembalikan hasil pagination dari Prisma", async () => {
    const result = await getAllNews({ page: "1", limit: "10" });

    expect(result.total).toBe(1);
    expect(result.data?.[0]?.title ?? "").toBe("IHSG naik 2%");
  });
});
