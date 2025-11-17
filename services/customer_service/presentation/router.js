import { Router } from "express";
import * as controller from './controller.js'

const router = Router();

router.get("/", controller.getAllCustomers);
router.get("/:id", controller.getCustomerById);
router.post("/", controller.createCustomer);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);

export default router;
