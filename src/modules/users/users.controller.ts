import { Request, Response } from "express";
import { UsersService } from "./users.service";

export const UsersController = {
  me: async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

      const user = await UsersService.getMe(req.user.id);
      return res.json({ success: true, data: user });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e?.message ?? "Failed" });
    }
  },

  updateMe: async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

      const updated = await UsersService.updateMe(req.user.id, req.body);
      return res.json({ success: true, message: "Profile updated", data: updated });
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e?.message ?? "Failed" });
    }
  },
};
