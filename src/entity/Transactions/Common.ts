class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}

enum StatusOpts {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    DECLINED = "declined",
    DELAYED = "delayed"
}

enum AcceptedStatusOpts {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    DECLINED = "declined"
}

export {
    ColumnNumericTransformer,
    StatusOpts,
    AcceptedStatusOpts
}