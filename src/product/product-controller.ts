// import { NextFunction, Request, Response } from "express";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { Product } from "./product-types";

export class ProductController {
    private logger: Logger;
    private productService: ProductService;
    constructor(logger: Logger, productService: ProductService) {
        this.logger = logger;
        this.productService = productService;

        this.create = this.create.bind(this); //if you make the create method as arrow function then you wont need to bit the create manually
    }
    //Our error handler can only catch the errors coming from synchronous calls
    //For catching error out of async codes need to put in try catch and call the next fun with error
    //or use the asyncWrapper that we use inside the router to handle such errors
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
        } = req.body;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            image: "image.jpg", //Todo: image upload to s3, we use multipart formdata whenever we need to upload a file
        };

        //create product
        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        );
        //upload image
        //save product to data base
        //send the product as response

        res.json({ id: newProduct._id });
    }
}
