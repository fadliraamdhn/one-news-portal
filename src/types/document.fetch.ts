export interface GetDocumentParams {
    category?: string;
    companyCode?: string;
    date?: string
    sortOrder?: "asc" | "desc"
    page?: string
    limit?: string
}