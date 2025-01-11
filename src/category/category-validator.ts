import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Name of category is not passed")
        .isString()
        .withMessage("category name should be a string"),
    body("priceConfiguration").exists().withMessage("Price conf should exist"),
    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type should exists")
        .custom((value: "base" | "aditional") => {
            const validKeys = ["base", "aditional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `The value ${value} is invalid for pricetype field, allowed values are [${validKeys.join(
                        ",",
                    )}]`,
                );
            }
        }),
    body("attributes").exists().withMessage("Attributes list is required"),
];
