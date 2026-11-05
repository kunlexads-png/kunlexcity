
import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const appointmentStatuses = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const;

const appointmentTypes = [
  'IN_PERSON',
  'VIRTUAL_TOUR',
] as const;

function formatAppointment(appointment: any) {
  return {
    ...appointment,
    propertyTitle: appointment.property?.title || '',
    inspectionDate: appointment.inspectionDate.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

async function logAppointmentActivity(
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
    console.error('Appointment audit log error:', error);
  }
}

// SCHEDULE APPOINTMENT
export const scheduleAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      propertyId,
      clientName,
      clientEmail,
      clientPhone,
      inspectionDate,
      inspectionTime,
      inspectionType = 'IN_PERSON',
      notes,
    } = req.body;

    if (
      !propertyId ||
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !inspectionDate ||
      !inspectionTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required appointment fields.',
      });
    }

    if (
      typeof propertyId !== 'string' ||
      typeof clientName !== 'string' ||
      typeof clientEmail !== 'string' ||
      typeof clientPhone !== 'string' ||
      typeof inspectionDate !== 'string' ||
      typeof inspectionTime !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid appointment details.',
      });
    }

    if (!appointmentTypes.includes(inspectionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment type.',
      });
    }

    const parsedDate = new Date(inspectionDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid inspection date.',
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

    const appointment = await prisma.appointment.create({
      data: {
        propertyId,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone.trim(),
        inspectionDate: parsedDate,
        inspectionTime: inspectionTime.trim(),
        inspectionType,
        notes: typeof notes === 'string' ? notes : null,
        status: 'PENDING',
        // Do not trust a userId supplied by an unauthenticated browser.
        // The current scheduling route is public.
        userId: null,
      },
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    });

    await logAppointmentActivity(
      null,
      clientName.trim(),
      'APPOINTMENT_SCHEDULED',
      `Scheduled ${inspectionType} for "${property.title}" on ${inspectionDate}`
    );

    return res.status(201).json({
      success: true,
      message: `Inspection request received for ${inspectionDate} at ${inspectionTime}! Our administrative concierge will confirm security gate clearance.`,
      data: formatAppointment(appointment),
    });
  } catch (error) {
    console.error('Error booking inspection:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to book inspection.',
    });
  }
};

// GET APPOINTMENTS
export const getAppointments = async (
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

    const appointments = await prisma.appointment.findMany({
      where:
        user.role === 'CLIENT'
          ? {
              clientEmail: {
                equals: user.email,
                mode: 'insensitive',
              },
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
        inspectionDate: 'desc',
      },
    });

    return res.json({
      success: true,
      data: appointments.map(formatAppointment),
    });
  } catch (error) {
    console.error('Error retrieving appointments:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments.',
    });
  }
};

// UPDATE APPOINTMENT STATUS
export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrator can update appointments.',
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (
      status !== undefined &&
      !appointmentStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment status.',
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Appointment notes must be text.',
      });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
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

    await logAppointmentActivity(
      req.user.id,
      req.user.name,
      'APPOINTMENT_UPDATE',
      `Inspection ${id} status set to ${status || appointment.status}`
    );

    return res.json({
      success: true,
      message: `Appointment status updated to ${appointment.status}`,
      data: formatAppointment(appointment),
    });
  } catch (error) {
    console.error('Error updating appointment:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment.',
    });
  }
};
