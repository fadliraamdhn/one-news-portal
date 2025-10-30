import { Request, Response, NextFunction } from "express";
import { getAllDocument, getCompanySuggestions } from "~/services/document.service";
import { AppError } from "~/utils/appError"

export async function handleDocumentGetAll(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            category,
            companyCode,
            date,
            sortOrder,
            page,
            limit,
        } = req.query;

        if (page && isNaN(Number(page))) {
            throw new AppError("Tidak ada nomor halaman", 400);
        }

        if (limit && isNaN(Number(limit))) {
            throw new AppError("Tidak ada limit angka", 400);
        }

        const result = await getAllDocument({
            category: category as string,
            companyCode: companyCode as string,
            date: date as string,
            sortOrder: sortOrder as "asc" | "desc",
            page: page as string,
            limit: limit as string,
        });

        return res.status(200).json({
            success: true,
            message: "Document berhasil didapatkan",
            ...result,
        });
    } catch (error: any) {
        console.error("Error mengambil data:", error);

        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError(error?.message || "Internal Server Error", 500));
    }
}

export async function handleGetCompanySuggestions(req: Request, res: Response, next: NextFunction) {
    try {
        const search = req.query.search as string;

        const suggestions = await getCompanySuggestions(search);

        return res.status(200).json({
        success: true,
        message: "Company suggestions fetched successfully",
        data: suggestions,
        });
    } catch (error) {
        console.error("Error fetching company suggestions:", error);
        next(new AppError("Failed to fetch company suggestions", 500));
    }
}