import { Router } from "express";
import express from "express";
import { SubscriptionController } from "./subscription.controller";
import { Role } from "../../../generated/prisma/enums";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

router.post("/", auth(UserRole.STUDENT), SubscriptionController.create);
router.post("/:id/initiate-payment", auth(UserRole.STUDENT), SubscriptionController.initiatePayment);

router.get("/", auth(UserRole.STUDENT), SubscriptionController.listMineOrAll);
router.get("/active",  auth(UserRole.STUDENT), SubscriptionController.getMyActive);
router.patch("/:id/cancel", auth(UserRole.STUDENT), SubscriptionController.cancel);

export const subsriptionRotes: Router = router;