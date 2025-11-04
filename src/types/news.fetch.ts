export interface GetNewsParams {
    sourceId?: string
    date?: string
    search?: string
    sortOrder?: "asc" | "desc"
    page?: string
    limit?: string
}