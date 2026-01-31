import { prisma } from "../../lib/prisma";

type CreateReviewDto = {
  bookingId: string;
  rating: number;
  comment?: string;
};

export const ReviewsService = {
  create: async (studentId: string, dto: CreateReviewDto) => {
    if (!dto?.bookingId) throw new Error("bookingId is required");
    if (!dto?.rating || dto.rating < 1 || dto.rating > 5) throw new Error("rating must be 1-5");

    const booking = await prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: { id: true, studentId: true, tutorProfileId: true, status: true },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.studentId !== studentId) throw new Error("Forbidden");
    if (booking.status !== "COMPLETED") throw new Error("Only COMPLETED bookings can be reviewed");

    // prevent double review
    const exists = await prisma.review.findFirst({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    if (exists) throw new Error("Review already submitted");

    return prisma.review.create({
      data: {
        bookingId: booking.id,
        tutorProfileId: booking.tutorProfileId,
        studentId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
      select: { id: true },
    });
  },
};
