import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCart, addToCart, removeFromCart, updateProductInCart, clearCart } from "../controllers/cart.controller.js";
import { cartAddValidator, cartUpdateValidator, cartRemoveValidator } from "../validators/cart.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

// Protect all cart routes with authentication
router.use(verifyJWT);

router.route("/")
  .get(getCart);

router.route("/add")
  .post(cartAddValidator(), validate, addToCart);

router.route("/remove")
  .delete(cartRemoveValidator(), validate, removeFromCart);

router.route("/update")
  .put(cartUpdateValidator(), validate, updateProductInCart);

router.route("/clear")
  .delete(clearCart);

export default router;
