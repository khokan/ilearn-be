import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(UserRole.STUDENT), SubscriptionController.create);
router.post("/:id/initiate-payment", auth(UserRole.STUDENT), SubscriptionController.initiatePayment);

router.get("/", auth(UserRole.STUDENT, UserRole.ADMIN), SubscriptionController.listMineOrAll);
router.get("/active", auth(UserRole.STUDENT), SubscriptionController.getMyActive);
router.patch("/:id/cancel", auth(UserRole.STUDENT, UserRole.ADMIN), SubscriptionController.cancel);

export const subsriptionRotes: Router = router;