import { prisma } from "../../lib/prisma";


export const TutorProfileService = {
  create: async (userId: string, data: any) => {
    return prisma.tutorProfile.create({
      data: { ...data, userId },
    });
  },

  getMine: async (userId: string) => {
    return prisma.tutorProfile.findUnique({
      where: { userId },
    });
  },

  update: async (userId: string, data: any) => {
    return prisma.tutorProfile.update({
      where: { userId },
      data,
    });
  },

  remove: async (userId: string) => {
    return prisma.tutorProfile.delete({
      where: { userId },
    });
  },
};
