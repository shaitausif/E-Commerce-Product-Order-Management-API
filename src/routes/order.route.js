import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cancelOrder, getAllUserOrders, placeOrder } from "../controllers/order.controller.js";
import { orderPlaceValidator } from "../validators/order.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

// Protecting all order routes with authentication
router.use(verifyJWT);

router.route("/")
  .post(orderPlaceValidator(), validate, placeOrder)
  .get(validate, getAllUserOrders)

  

router.route('/cancel-order/:id')
.patch(validate, cancelOrder)

export default router;
