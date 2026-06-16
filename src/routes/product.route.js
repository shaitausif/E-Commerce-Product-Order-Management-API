import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllProducts, getProductById, addProducts, updateProduct, toggleProductVisibility } from "../controllers/product.controller.js";
import { productCreateValidator, productUpdateValidator } from "../validators/product.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route('/')
  .get(verifyJWT, getAllProducts)
  .post(verifyJWT, productCreateValidator(), validate, addProducts);

router.route('/toggle-visibility/:id')
  .patch(verifyJWT, toggleProductVisibility);

router.route('/:id')
  .get(verifyJWT, getProductById)
  .patch(verifyJWT, productUpdateValidator(), validate, updateProduct);

export default router;