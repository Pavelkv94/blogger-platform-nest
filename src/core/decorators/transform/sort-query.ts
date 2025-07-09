import { Transform } from "class-transformer";
import { SortDirection } from "src/core/dto/base.query-params.input-dto";

export function TransformSortQuery() {
    return Transform(({ value }) => {
        if (!value) return [];
        // Handle array of strings format like ["avgScores desc", "sumScore desc"]
        if (Array.isArray(value)) {
            return value.map((item: string) => {
                const parts = item.trim().split(' ');
                const field = parts[0];
                const direction = parts[1]?.toLowerCase() === 'desc' ? SortDirection.Desc : SortDirection.Asc;
                return { field, direction };
            });
        }

        // Handle single string format
        if (typeof value === 'string') {
            const parts = value.trim().split(' ');
            const field = parts[0];
            const direction = parts[1]?.toLowerCase() === 'desc' ? SortDirection.Desc : SortDirection.Asc;
            return [{ field, direction }];
        }

        return [];
    });
}