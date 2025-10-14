export interface GetNewsParams {
    sourceId?: string
    from?: string
    to?: string
    search?: string
    sortOrder?: "asc" | "desc"
    page?: string
    limit?: string
}