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

  listUsers: async () => {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
  },

  getUserById: async (userId: string) => {
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
        updatedAt: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            startDate: true,
            endDate: true,
            paymentProvider: true,
            externalRef: true,
            createdAt: true,
            plan: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                currency: true,
                interval: true,
              },
            },
            payment: {
              select: {
                id: true,
                amount: true,
                transactionId: true,
                status: true,
                invoiceUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new Error("User not found");
    return user;
  },

  getUserSubscriptions: async (userId: string) => {
    return prisma.subscription.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        paymentProvider: true,
        externalRef: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            interval: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
          },
        },
      },
    });
  },
};
