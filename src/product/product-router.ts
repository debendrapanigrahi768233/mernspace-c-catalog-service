import express from "express";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import logger from "../config/logger";
import productValidator from "./product-validator";

const router = express.Router();

const productController = new ProductController(logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    productValidator,
    asyncWrapper(productController.create),
);

export default router;
