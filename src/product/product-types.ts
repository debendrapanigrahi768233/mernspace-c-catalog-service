import mongoose from "mongoose";

// export interface Product {
//     _id?: mongoose.Types.ObjectId;
//     name: string;
//     description: string;
//     priceConfiguration: string;
//     attributes: string;
//     tenantId: string;
//     categoryId: string;
//     image: string;
// }

export interface Product {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    priceConfiguration: Map<string, unknown>;
    attributes: Array<{ name: string; value: unknown }>;
    tenantId: string;
    categoryId: mongoose.Types.ObjectId;
    image: string;
    isPublish?: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}
