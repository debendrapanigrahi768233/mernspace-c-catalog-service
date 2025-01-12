// import { NextFunction, Request, Response } from "express";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class ProductController {
    private logger: Logger;
    constructor(logger: Logger) {
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
    }
}
