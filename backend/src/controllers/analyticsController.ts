
import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      totalProperties,
      activeListings,
      soldProperties,
      underOfferProperties,
      totalClients,
      totalInquiries,
      scheduledInspections,
      properties,
      transactions,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.property.count(),

      prisma.property.count({
        where: {
          status: 'AVAILABLE',
          approvalStatus: 'APPROVED',
        },
      }),

      prisma.property.count({
        where: { status: 'SOLD' },
      }),

      prisma.property.count({
        where: { status: 'UNDER_OFFER' },
      }),

      prisma.user.count({
        where: { role: 'CLIENT' },
      }),

      prisma.inquiry.count(),

      prisma.appointment.count(),

      prisma.property.findMany({
        select: { category: true },
      }),

      prisma.transaction.findMany({
        select: {
          amount: true,
          paymentStatus: true,
          transactionDate: true,
        },
      }),

      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 8,
      }),
    ]);

    const paidTransactions = transactions.filter(
      (transaction) => transaction.paymentStatus === 'PAID'
    );

    const pendingTransactions = transactions.filter(
      (transaction) => transaction.paymentStatus === 'PENDING'
    );

    const totalPaidVolume = paidTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

    const totalPendingVolume = pendingTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

    // Property category breakdown
    const categoryCounts: Record<string, number> = {};

    properties.forEach((property) => {
      categoryCounts[property.category] =
        (categoryCounts[property.category] || 0) + 1;
    });

    const categoriesData = Object.entries(categoryCounts).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // Actual paid revenue for the latest four calendar months
    const now = new Date();
    const monthlyData = [];

    for (let offset = 3; offset >= 0; offset--) {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - offset,
        1
      );

      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      const revenue = paidTransactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.transactionDate);

          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === month
          );
        })
        .reduce(
          (total, transaction) => total + Number(transaction.amount),
          0
        );

      monthlyData.push({
        month: monthDate.toLocaleString('en', { month: 'short' }),
        revenue,
      });
    }

    return res.json({
      success: true,
      data: {
        kpis: {
          totalProperties,
          activeListings,
          soldProperties,
          underOfferProperties,
          totalClients,
          totalInquiries,
          scheduledInspections,
          paidBuyersCount: paidTransactions.length,
          pendingBuyersCount: pendingTransactions.length,
          totalPaidVolume,
          totalPendingVolume,
        },
        categoriesData,
        monthlyData,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error('Error in dashboard analytics:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
    });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (clients.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const clientIds = clients.map((client) => client.id);
    const clientEmails = clients.map((client) => client.email);

    const [
      favourites,
      inquiries,
      appointments,
      transactions,
    ] = await Promise.all([
      prisma.favourite.findMany({
        where: {
          userId: { in: clientIds },
        },
        select: {
          userId: true,
        },
      }),

      prisma.inquiry.findMany({
        where: {
          OR: [
            { userId: { in: clientIds } },
            {
              email: {
                in: clientEmails,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          userId: true,
          email: true,
        },
      }),

      prisma.appointment.findMany({
        where: {
          OR: [
            { userId: { in: clientIds } },
            {
              clientEmail: {
                in: clientEmails,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          userId: true,
          clientEmail: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          buyerOrTenantEmail: {
            in: clientEmails,
            mode: 'insensitive',
          },
        },
        select: {
          buyerOrTenantEmail: true,
          paymentStatus: true,
        },
      }),
    ]);

    const clientsData = clients.map((client) => {
      const clientEmail = client.email.toLowerCase();

      const clientFavourites = favourites.filter(
        (favourite) => favourite.userId === client.id
      );

      const clientInquiries = inquiries.filter(
        (inquiry) =>
          inquiry.userId === client.id ||
          inquiry.email.toLowerCase() === clientEmail
      );

      const clientAppointments = appointments.filter(
        (appointment) =>
          appointment.userId === client.id ||
          appointment.clientEmail.toLowerCase() === clientEmail
      );

      const clientTransactions = transactions.filter(
        (transaction) =>
          transaction.buyerOrTenantEmail.toLowerCase() === clientEmail
      );

      return {
        ...client,
        favsCount: clientFavourites.length,
        inquiriesCount: clientInquiries.length,
        appointmentsCount: clientAppointments.length,
        purchasesCount: clientTransactions.length,
        hasPaid: clientTransactions.some(
          (transaction) => transaction.paymentStatus === 'PAID'
        ),
        hasPending: clientTransactions.some(
          (transaction) => transaction.paymentStatus === 'PENDING'
        ),
      };
    });

    return res.json({
      success: true,
      data: clientsData,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
    });
  }
};
