
import { Response } from 'express';
import { randomInt } from 'crypto';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const transactionTypes = ['SALE', 'RENTAL', 'LEASE'] as const;

const paymentStatuses = ['PAID', 'PENDING', 'PARTIAL'] as const;

function getPropertyStatus(
  transactionType: string,
  paymentStatus: string
): 'SOLD' | 'RENTED' | 'UNDER_OFFER' {
  if (paymentStatus !== 'PAID') {
    return 'UNDER_OFFER';
  }

  if (transactionType === 'SALE') {
    return 'SOLD';
  }

  return 'RENTED';
}

function formatTransaction(transaction: any) {
  return {
    ...transaction,
    propertyTitle: transaction.property?.title || '',
    amount: Number(transaction.amount),
    agentCommissionRate: Number(transaction.agentCommissionRate),
    agentCommissionAmount: Number(transaction.agentCommissionAmount),
    transactionDate: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
  };
}

async function logTransactionActivity(
  userId: string | null,
  userName: string | null,
  action: string,
  details: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('Transaction audit log error:', error);
  }
}

// GET TRANSACTIONS
export const getTransactions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Sign in to view transaction records.',
      });
    }

    const transactions = await prisma.transaction.findMany({
      where:
        user.role === 'CLIENT'
          ? {
              OR: [
                {
                  buyerOrTenantEmail: {
                    equals: user.email,
                    mode: 'insensitive',
                  },
                },
                {
                  buyerOrTenantName: {
                    equals: user.name,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : undefined,
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return res.json({
      success: true,
      data: transactions.map(formatTransaction),
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction records.',
    });
  }
};

// RECORD TRANSACTION
export const recordTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Please register or sign in to purchase properties.',
      });
    }

    const {
      propertyId,
      transactionType = 'SALE',
      amount,
      buyerOrTenantName,
      buyerOrTenantEmail,
      buyerOrTenantPhone,
      paymentStatus = 'PENDING',
      notes,
    } = req.body;

    if (!propertyId || amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Property ID and amount are required.',
      });
    }

    if (typeof propertyId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID.',
      });
    }

    if (!transactionTypes.includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type.',
      });
    }

    if (!paymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.',
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction amount must be a positive number.',
      });
    }

    // Clients must use their own registered account details.
    // Administrators may enter buyer or tenant details.
    const finalBuyerName =
      user.role === 'CLIENT'
        ? user.name
        : (buyerOrTenantName || user.name);

    const finalBuyerEmail =
      user.role === 'CLIENT'
        ? user.email
        : (buyerOrTenantEmail || user.email);

    const finalBuyerPhone =
      user.role === 'CLIENT'
        ? user.phone
        : (buyerOrTenantPhone || null);

    if (
      typeof finalBuyerName !== 'string' ||
      typeof finalBuyerEmail !== 'string' ||
      !finalBuyerName.trim() ||
      !finalBuyerEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid buyer or tenant name and email are required.',
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Transaction notes must be text.',
      });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    if (property.status !== 'AVAILABLE' &&
        property.status !== 'UNDER_OFFER') {
      return res.status(400).json({
        success: false,
        message: 'This property is not currently available for a transaction.',
      });
    }

    const prefix = paymentStatus === 'PAID' ? 'PAID' : 'PEND';

    // Generate a unique reference and retry if a collision occurs.
    let referenceNumber = '';

    for (let attempt = 0; attempt < 5; attempt++) {
      referenceNumber =
        `PNR-${new Date().getFullYear()}-${prefix}-${randomInt(100000, 1000000)}`;

      const existing = await prisma.transaction.findUnique({
        where: { referenceNumber },
      });

      if (!existing) break;

      referenceNumber = '';
    }

    if (!referenceNumber) {
      throw new Error('Unable to generate a unique transaction reference.');
    }

    const propertyStatus = getPropertyStatus(
      transactionType,
      paymentStatus
    );

    const defaultNotes =
      paymentStatus === 'PAID'
        ? 'Payment confirmed by bank/escrow.'
        : 'Purchase order placed. Pending bank wire / payment.';

    // Save the transaction and update the property together.
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          propertyId,
          transactionType,
          amount: numericAmount,
          currency: 'NGN',
          buyerOrTenantName: finalBuyerName.trim(),
          buyerOrTenantEmail: finalBuyerEmail.trim().toLowerCase(),
          buyerOrTenantPhone:
            typeof finalBuyerPhone === 'string'
              ? finalBuyerPhone.trim()
              : null,
          paymentStatus,
          referenceNumber,
          notes: notes || defaultNotes,
          agentId: user.role === 'ADMIN' ? null : null,
        },
        include: {
          property: {
            select: {
              title: true,
            },
          },
        },
      });

      await tx.property.update({
        where: { id: propertyId },
        data: { status: propertyStatus },
      });

      return newTransaction;
    });

    await logTransactionActivity(
      user.id,
      user.name,
      'TRANSACTION_LOGGED',
      `Purchase order ${transaction.referenceNumber} (${paymentStatus}): ${property.title} by ${finalBuyerName}`
    );

    return res.status(201).json({
      success: true,
      message:
        paymentStatus === 'PAID'
          ? 'Payment confirmed and purchase deed initiated!'
          : 'Purchase order placed successfully! Status: PENDING payment confirmation.',
      data: formatTransaction(transaction),
    });
  } catch (error) {
    console.error('Error recording transaction:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to record transaction.',
    });
  }
};

// UPDATE TRANSACTION PAYMENT STATUS
export const updateTransactionStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrator can update payment status.',
      });
    }

    const { id } = req.params;
    const { paymentStatus, notes } = req.body;

    if (
      paymentStatus !== undefined &&
      !paymentStatuses.includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.',
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Transaction notes must be text.',
      });
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction record not found.',
      });
    }

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...(paymentStatus !== undefined ? { paymentStatus } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
        include: {
          property: {
            select: {
              title: true,
            },
          },
        },
      });

      if (paymentStatus !== undefined) {
        await tx.property.update({
          where: { id: existingTransaction.propertyId },
          data: {
            status: getPropertyStatus(
              existingTransaction.transactionType,
              paymentStatus
            ),
          },
        });
      }

      return updated;
    });

    await logTransactionActivity(
      req.user.id,
      req.user.name,
      'PAYMENT_STATUS_UPDATE',
      `Updated transaction ${updatedTransaction.referenceNumber} to ${updatedTransaction.paymentStatus}`
    );

    return res.json({
      success: true,
      message: `Payment status updated to ${updatedTransaction.paymentStatus}`,
      data: formatTransaction(updatedTransaction),
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update transaction status.',
    });
  }
};
