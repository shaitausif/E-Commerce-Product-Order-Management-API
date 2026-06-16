import { body } from "express-validator";

const productCreateValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Product description is required"),
    body("price")
      .notEmpty()
      .withMessage("Product price is required")
      .isFloat({ min: 0 })
      .withMessage("Product price must be a positive number"),
    body("stock")
      .notEmpty()
      .withMessage("Product stock quantity is required")
      .isInt({ min: 0 })
      .withMessage("Product stock must be a non-negative integer"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Product category is required"),
  ];
};

const productUpdateValidator = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Product name cannot be empty"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Product description cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Product price must be a positive number"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Product stock must be a non-negative integer"),
    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Product category cannot be empty")
  ];
};

export { productCreateValidator, productUpdateValidator };
