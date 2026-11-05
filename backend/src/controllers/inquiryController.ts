
import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const inquiryStatuses = [
  'NEW',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

async function logInquiryActivity(
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
    console.error('Inquiry audit log error:', error);
  }
}

function formatInquiry(inquiry: any) {
  return {
    ...inquiry,
    propertyTitle: inquiry.property?.title || '',
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
  };
}

// CREATE INQUIRY
export const createInquiry = async (req: Request, res: Response) => {
  try {
    const {
      propertyId,
      name,
      email,
      phone,
      message,
      preferredContactMethod = 'WHATSAPP',
    } = req.body;

    if (
      !propertyId ||
      !name ||
      !email ||
      !phone ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: 'All inquiry fields are required.',
      });
    }

    if (
      typeof propertyId !== 'string' ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof message !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid inquiry details.',
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

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
        preferredContactMethod:
          typeof preferredContactMethod === 'string'
            ? preferredContactMethod
            : 'WHATSAPP',
        status: 'NEW',
      },
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    });

    await logInquiryActivity(
      null,
      name.trim(),
      'INQUIRY_SUBMITTED',
      `New inquiry for "${property.title}"`
    );

    return res.status(201).json({
      success: true,
      message:
        'Your inquiry has been received! Our administrator desk will reach out via ' +
        inquiry.preferredContactMethod,
      data: formatInquiry(inquiry),
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry.',
    });
  }
};

// GET INQUIRIES
export const getInquiries = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const inquiries = await prisma.inquiry.findMany({
      where:
        user.role === 'CLIENT'
          ? {
              OR: [
                {
                  email: {
                    equals: user.email,
                    mode: 'insensitive',
                  },
                },
                {
                  userId: user.id,
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
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: inquiries.map(formatInquiry),
    });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.',
    });
  }
};

// UPDATE INQUIRY STATUS
export const updateInquiryStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrator can update inquiries.',
      });
    }

    const { id } = req.params;
    const { status, responseNotes } = req.body;

    if (
      status !== undefined &&
      !inquiryStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry status.',
      });
    }

    if (
      responseNotes !== undefined &&
      responseNotes !== null &&
      typeof responseNotes !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Response notes must be text.',
      });
    }

    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(responseNotes !== undefined
          ? { responseNotes }
          : {}),
      },
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    });

    await logInquiryActivity(
      req.user.id,
      req.user.name,
      'INQUIRY_STATUS_UPDATE',
      `Inquiry ${id} updated${status ? ` to ${status}` : ''}.`
    );

    return res.json({
      success: true,
      message: 'Inquiry updated successfully.',
      data: formatInquiry(inquiry),
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry.',
    });
  }
};
