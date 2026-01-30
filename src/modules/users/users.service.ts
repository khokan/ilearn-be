import { prisma } from "../../lib/prisma";

type UpdateMeDto = {
  name?: string;
  phone?: string | null;
  image?: string | null;
};

export const UsersService = {
  getMe: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("User not found");
    return user;
  },

  updateMe: async (userId: string, dto: UpdateMeDto) => {
    // build data safely (avoid overwriting with undefined)
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.image !== undefined) data.image = dto.image;

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true,
      },
    });
  },
};
