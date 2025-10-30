import { prisma } from "~/prisma/client";
import { GetDocumentParams } from "~/types/document.fetch";

export async function getAllDocument({
    category = "Laporan Keuangan",
    companyCode,
    date,
    sortOrder = "asc",
    page = "1",
    limit = "25",
}: GetDocumentParams) {
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 25, 1);
    const skip = (pageNum - 1) * limitNum;
    const orderDirection = sortOrder === "asc" ? "asc" : "desc";

    const where: Record<string, any> = {};

    if (category) where.category = category;
    if (companyCode) where.companyCode = companyCode;

    if (date) {
        const start = new Date(`${date}-01-01T00:00:00+07:00`);
        const end = new Date(`${date}-12-31T23:59:59+07:00`);
        where.date = { gte: start, lte: end };
    }

    const [documents, total] = await Promise.all([
        prisma.document.findMany({
        where,
        orderBy: { companyCode: orderDirection },
        skip,
        take: limitNum,
        include: {
            company: {
            select: { code: true, name: true },
            },
        },
        }),
        prisma.document.count({ where }),
    ]);

    return {
        pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        },
        filters: { category, companyCode, date, sortOrder: orderDirection },
        data: documents,
    };
}

export async function getCompanySuggestions(search?: string) {
    if (!search || search.trim() === "") return [];

    const companies = await prisma.company.findMany({
    where: {
        OR: [
        {
            code: {
            contains: search,
            mode: 'insensitive',
            },
        },
        ],
    },
    select: { code: true },
    take: 5,
    orderBy: { code: "asc" },
    });
    
    return companies;
}