import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    private categoryService: CategoryService;
    private logger: Logger;
    constructor(categoryService: CategoryService, logger: Logger) {
        this.categoryService = categoryService;
        this.logger = logger;
        this.create = this.create.bind(this);
    }
    //Our error handler can only catch the errors coming from synchronous calls
    //For catching error out of async codes need to put in try catch and call the next fun with error
    //or use the asyncWrapper that we use inside the router to handle such errors
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });
        this.logger.info("category created", { id: category._id });
        res.json({ id: category._id });
    }
}
