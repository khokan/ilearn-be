import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { UsersController } from "./users.controller";

const router: Router = Router();

// student/admin can use /me routes
router.get("/me", auth(UserRole.STUDENT, UserRole.ADMIN), UsersController.me);
router.patch("/me", auth(UserRole.STUDENT, UserRole.ADMIN), UsersController.updateMe);

// Admin-only user management and subscription info
router.get("/", auth(UserRole.ADMIN), UsersController.listUsers);
router.get("/:id", auth(UserRole.ADMIN), UsersController.getUserById);
router.get("/:id/subscriptions", auth(UserRole.ADMIN), UsersController.getUserSubscriptions);

export const userRouter: Router = router;
