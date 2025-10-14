import { Request, Response, NextFunction } from "express";
import { fetchAndCategorizeNews, getAllNews } from "~/services/news.service";
import { GetNewsParams } from "~/types/news.fetch";
import { AppError } from "~/utils/appError";

export async function fetchNewsController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await fetchAndCategorizeNews();
        res.status(200).json({ status: "success", code: 200, message: "sukses mengambil data", data: result})
    } catch (error) {
        next(new AppError("Gagal mengambil berita", 500));
    }
}

export async function handleGetNews(
    req: Request<{}, {}, {}, GetNewsParams>,
    res: Response,
    next: NextFunction
) {
    try {
        const {
        sourceId,
        from,
        to,
        search,
        sortOrder = "desc",
        page = "1",
        limit = "25",
        } = req.query

        const result = await getAllNews({
        sourceId,
        from,
        to,
        search,
        sortOrder,
        page,
        limit,
        })

        res.status(200).json({
        status: "success",
        code: 200,
        message: "Data berhasil ditemukan!",
        data: result.data,
        meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
        },
        })
    } catch (error) {
        console.error(error)
        next(new AppError("Gagal memuat data", 500))
    }
}