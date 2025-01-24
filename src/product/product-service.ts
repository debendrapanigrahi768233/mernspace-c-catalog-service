import { AggregatePaginateResult } from "mongoose";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";
import { paginationLabels } from "../config/pagination";

export class ProductService {
    async createProduct(product: Product) {
        return (await productModel.create(product)) as Product;
    }
    async getProductImage(productId: string): Promise<string | null> {
        const product = await productModel.findById(productId).lean<Product>();
        return product?.image ?? null;
    }
    async updateProduct(productId: string, product: Product) {
        return (await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        )) as Product;
    }

    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findOne({ _id: productId });
    }
    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ): Promise<AggregatePaginateResult<Product>> {
        const searchQueryRegex = new RegExp(q, "i");
        const matchQuery = {
            ...filters,
            name: searchQueryRegex,
        };
        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$category",
            },
        ]);

        return await productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });

        // const result = await aggregate.exec();
        // return result as Product[];
    }
}
