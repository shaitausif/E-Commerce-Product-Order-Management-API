import { body } from "express-validator";

const cartAddValidator = () => {
  return [
    body("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID format"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ];
};

const cartUpdateValidator = () => {
  return [
    body("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID format"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ];
};

const cartRemoveValidator = () => {
  return [
    body("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isMongoId()
      .withMessage("Invalid Product ID format"),
  ];
};

export { cartAddValidator, cartUpdateValidator, cartRemoveValidator };
