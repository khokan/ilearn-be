import { Request, Response } from "express";
import { TutorProfileService } from "./profile.service";

export const TutorProfileController = {
  create: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const profile = await TutorProfileService.create(req.user.id, req.body);

      return res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error("Create TutorProfile Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message ?? "Failed to create tutor profile",
      });
    }
  },

  getMine: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const profile = await TutorProfileService.getMine(req.user.id);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error("Get TutorProfile Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message ?? "Failed to fetch tutor profile",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      console.log("Updating profile for user:", req.user, "with data:", req.body);

      const profile = await TutorProfileService.update(req.user.id, req.body);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error("Update TutorProfile Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message ?? "Failed to update tutor profile",
      });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      console.log("Deleting profile for user:", req.user);
      await TutorProfileService.remove(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Tutor profile deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete TutorProfile Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message ?? "Failed to delete tutor profile",
      });
    }
  },
};
