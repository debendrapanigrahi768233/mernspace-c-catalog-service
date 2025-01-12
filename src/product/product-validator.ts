import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Name of product is not passed")
        .isString()
        .withMessage("product name should be a string"),
    body("description")
        .exists()
        .withMessage("Desc of product is not passed")
        .isString()
        .withMessage("product desc should be a string"),
    body("priceConfiguration")
        .exists()
        .withMessage("priceConfiguration of product is not passed"),
    body("tenantId").exists().withMessage("tenant id of product is not passed"),
    body("categoryId")
        .exists()
        .withMessage("category id of product is not passed"),
    body("image").custom((value, { req }) => {
        if (!req.files) throw new Error("Product img is required");
        return true;
    }),
    body("attributes").exists().withMessage("Attributes list is required"),
];
