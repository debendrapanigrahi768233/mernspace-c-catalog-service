// import { NextFunction, Request, Response } from "express";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ProductService } from "./product-service";
import { Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";

export class ProductController {
    private logger: Logger;
    private productService: ProductService;
    private storage: FileStorage;
    constructor(
        logger: Logger,
        productService: ProductService,
        storage: FileStorage,
    ) {
        this.logger = logger;
        this.productService = productService;
        this.storage = storage;
        this.create = this.create.bind(this); //if you make the create method as arrow function then you wont need to bit the create manually
        this.update = this.update.bind(this);
    }
    //Our error handler can only catch the errors coming from synchronous calls
    //For catching error out of async codes need to put in try catch and call the next fun with error
    //or use the asyncWrapper that we use inside the router to handle such errors
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        //upload image
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });

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
            image: imageName, //Todo: image upload to s3, we use multipart formdata whenever we need to upload a file
        };

        //create product
        const newProduct = await this.productService.createProduct(
            product as unknown as Product,
        );

        //save product to data base
        //send the product as response

        res.json({ id: newProduct._id });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { productId } = req.params;

        //Check if tenant has access to the product
        const currentProduct = await this.productService.getProduct(productId);
        if (!currentProduct) {
            return next(createHttpError(404, "Product not found"));
        }

        const tenant = (req as AuthRequest).auth?.tenant;
        if (currentProduct.tenantId !== String(tenant)) {
            return next(createHttpError(403, "No permission to update it"));
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;
        if (req.files?.image) {
            // oldImage = await this.productService.getProductImage(productId);
            oldImage = currentProduct.image;
            const image = req.files?.image as UploadedFile;
            imageName = uuidv4();
            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });
            await this.storage.delete(oldImage);
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string),
            attributes: JSON.parse(attributes as string),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : (oldImage as string), //Todo: image upload to s3, we use multipart formdata whenever we need to upload a file
        };
        await this.productService.updateProduct(productId, product);
        res.json({ id: productId });
    }
}
