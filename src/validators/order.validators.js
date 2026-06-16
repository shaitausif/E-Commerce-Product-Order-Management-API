import { body } from "express-validator";

const orderPlaceValidator = () => {
  return [
    body("items")
      .isArray({ min: 1 })
      .withMessage("Items must be a non-empty array"),
    body("items.*.product")
      .notEmpty()
      .withMessage("Product ID is required for each item")
      .isMongoId()
      .withMessage("Invalid Product ID format"),
    body("items.*.quantity")
      .notEmpty()
      .withMessage("Quantity is required for each item")
      .isInt({ min: 1 })
      .withMessage("Quantity must be an integer of at least 1"),
    body("shippingAddress")
      .trim()
      .notEmpty()
      .withMessage("Shipping address is required"),
    body("paymentMethod")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Payment method cannot be empty"),
  ];
};



export { orderPlaceValidator };
