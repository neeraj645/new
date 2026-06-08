export const getPagination = (
    totalRecords,
    currentPage,
    limit
) => ({
    totalRecords,
    currentPage,
    totalPages: Math.ceil(totalRecords / limit),
    limit,
});