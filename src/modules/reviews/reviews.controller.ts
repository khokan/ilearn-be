import { Request, Response } from "express";
import { ReviewsService } from "./reviews.service";

export const ReviewsController = {
  create: async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

      const created = await ReviewsService.create(req.user.id, req.body);
      return res.status(201).json({ success: true, message: "Review created", data: created });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e?.message ?? "Review failed" });
    }
  },
};
