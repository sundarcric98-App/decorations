import { prisma } from '../../config/database.js';

export class EnquiriesService {
  private static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.enquiry.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `ENQ-${year}-${sequence}`;
  }

  static async createEnquiry(data: any) {
    const {
      name,
      phone,
      email,
      preferredContactMethod,
      eventType,
      eventTitle,
      eventDate,
      endDate,
      venueName,
      venueAddress,
      venueCity,
      guestCount,
      isOutdoor,
      selectedServiceIds,
      selectedPackageId,
      customRequirements,
      inspirationImages,
      budgetRange,
      consultationTime,
      additionalNotes,
    } = data;

    // Find or create customer by phone
    let customer = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email ? email.trim().toLowerCase() : null,
        },
      });
    } else if (email && !customer.email) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { email: email.trim().toLowerCase() },
      });
    }

    const reference = await this.generateReference();

    const enquiry = await prisma.enquiry.create({
      data: {
        reference,
        customerId: customer.id,
        eventType,
        eventTitle: eventTitle || `${eventType} for ${name}`,
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        venueName,
        venueAddress,
        venueCity,
        guestCount: guestCount ? Number(guestCount) : null,
        isOutdoor: Boolean(isOutdoor),
        selectedServiceIds: selectedServiceIds ? JSON.stringify(selectedServiceIds) : null,
        selectedPackageId,
        customRequirements,
        inspirationImages: inspirationImages ? JSON.stringify(inspirationImages) : null,
        budgetRange,
        preferredContactMethod: preferredContactMethod || 'Phone',
        consultationTime,
        additionalNotes,
        status: 'NEW',
      },
      include: {
        customer: true,
      },
    });

    // Create system notification
    await prisma.notification.create({
      data: {
        title: 'New Event Enquiry Received',
        message: `${name} requested a quote for ${eventType} (${reference})`,
        type: 'ENQUIRY',
        link: `/admin/enquiries`,
      },
    }).catch(() => {});

    return {
      ...enquiry,
      selectedServiceIds: enquiry.selectedServiceIds ? JSON.parse(enquiry.selectedServiceIds) : [],
      inspirationImages: enquiry.inspirationImages ? JSON.parse(enquiry.inspirationImages) : [],
    };
  }

  static async getAllEnquiries(params?: {
    status?: string;
    eventType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, eventType, search, startDate, endDate, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (eventType && eventType !== 'ALL') where.eventType = eventType;
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate);
      if (endDate) where.eventDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { eventTitle: { contains: search } },
        { venueName: { contains: search } },
        { venueCity: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const formatted = enquiries.map((e) => ({
      ...e,
      selectedServiceIds: e.selectedServiceIds ? JSON.parse(e.selectedServiceIds) : [],
      inspirationImages: e.inspirationImages ? JSON.parse(e.inspirationImages) : [],
    }));

    return {
      enquiries: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getEnquiryById(id: string) {
    const enquiry = await prisma.enquiry.findFirst({
      where: {
        OR: [{ id }, { reference: id }],
      },
      include: {
        customer: true,
        notes: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: { payments: true },
        },
        quotations: true,
      },
    });

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    return {
      ...enquiry,
      selectedServiceIds: enquiry.selectedServiceIds ? JSON.parse(enquiry.selectedServiceIds) : [],
      inspirationImages: enquiry.inspirationImages ? JSON.parse(enquiry.inspirationImages) : [],
    };
  }

  static async updateEnquiry(id: string, data: any) {
    const { selectedServiceIds, eventDate, endDate, ...rest } = data;
    const updateData: any = { ...rest };
    if (selectedServiceIds !== undefined) updateData.selectedServiceIds = JSON.stringify(selectedServiceIds);
    if (eventDate) updateData.eventDate = new Date(eventDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    return prisma.enquiry.update({
      where: { id },
      data: updateData,
      include: { customer: true },
    });
  }

  static async addNote(enquiryId: string, userId: string | undefined, note: string, followUpDate?: string | Date | null) {
    const newNote = await prisma.enquiryNote.create({
      data: {
        enquiryId,
        userId: userId || null,
        note,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (followUpDate) {
      await prisma.notification.create({
        data: {
          title: 'Follow-up Scheduled',
          message: `Follow-up set for note on enquiry (${enquiryId})`,
          type: 'FOLLOWUP',
          link: `/admin/enquiries/${enquiryId}`,
        },
      }).catch(() => {});
    }

    return newNote;
  }

  static async convertToBooking(enquiryId: string, data: any, userId?: string) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { customer: true },
    });

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    // Generate Booking reference BKG-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.booking.count();
    const reference = `BKG-${year}-${String(count + 1).padStart(4, '0')}`;

    // Execute in transaction
    return prisma.$transaction(async (tx) => {
      // 1. Create booking
      const booking = await tx.booking.create({
        data: {
          reference,
          customerId: enquiry.customerId,
          enquiryId: enquiry.id,
          eventName: data.eventName || enquiry.eventTitle || `${enquiry.eventType} Celebration`,
          eventType: enquiry.eventType,
          startDate: new Date(data.startDate || enquiry.eventDate),
          endDate: data.endDate ? new Date(data.endDate) : enquiry.endDate,
          venueName: data.venueName || enquiry.venueName,
          venueAddress: data.venueAddress || enquiry.venueAddress,
          venueCity: data.venueCity || enquiry.venueCity,
          guestCount: data.guestCount || enquiry.guestCount,
          status: 'CONFIRMED',
          totalAmount: data.totalAmount || 0,
          discountAmount: data.discountAmount || 0,
          taxAmount: data.taxAmount || 0,
          finalAmount: data.finalAmount || data.totalAmount || 0,
          internalNotes: data.internalNotes || enquiry.additionalNotes,
        },
      });

      // 2. Add booking services if provided
      if (data.selectedServices && Array.isArray(data.selectedServices) && data.selectedServices.length > 0) {
        for (const item of data.selectedServices) {
          await tx.bookingService.create({
            data: {
              bookingId: booking.id,
              serviceId: item.serviceId || null,
              serviceName: item.serviceName,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              notes: item.notes || null,
            },
          });
        }
      }

      // 3. Mark enquiry as CONVERTED
      await tx.enquiry.update({
        where: { id: enquiryId },
        data: { status: 'CONVERTED' },
      });

      // 4. Add conversion note
      await tx.enquiryNote.create({
        data: {
          enquiryId,
          userId: userId || null,
          note: `Converted enquiry into confirmed Booking ${reference}`,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CONVERT',
          entity: 'ENQUIRY',
          entityId: enquiryId,
          details: JSON.stringify({ bookingId: booking.id, reference }),
        },
      });

      return booking;
    });
  }
}
