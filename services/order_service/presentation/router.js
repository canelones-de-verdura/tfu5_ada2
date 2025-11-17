import { Router } from "express";
import * as OrderController from "./controller.js";

const router = Router();

router.get("/", OrderController.getAllOrders);
router.get("/:id", OrderController.getOrderById);
router.post("/", OrderController.createOrder);
router.put("/:id", OrderController.updateOrderStatus);
router.delete("/:id", OrderController.deleteOrder);

export default router;
