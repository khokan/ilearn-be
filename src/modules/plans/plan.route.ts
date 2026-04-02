import { Router } from "express";
// import { validate } from "../../middlewares/validate.middleware";
import { PlanController } from "./plan.controller";
import { createPlanSchema } from "./plan.validation";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.get("/", PlanController.getPlans);
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createPlanSchema),
  PlanController.createPlan
);

export const planRoutes: Router = router;