import { Router } from "express";

import { TutorManageController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = Router();

router.use(auth(UserRole.TUTOR));

router.put("/profile", TutorManageController.updateProfile);
router.get("/availability", auth(UserRole.TUTOR), TutorManageController.getAvailability);
router.put("/availability", auth(UserRole.TUTOR), TutorManageController.setAvailability);
router.put("/categories", auth(UserRole.TUTOR), TutorManageController.setCategories);
router.get("/reviews/:bookingId",  auth(UserRole.TUTOR),TutorManageController.listReviewbyBookingId);

export const tutorRoutes = router;
