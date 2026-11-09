
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { createHash, randomBytes } from 'node:crypto';
import { Resend } from 'resend';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
const hashVerificationToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const createVerificationToken = () =>
  randomBytes(32).toString('hex');

async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!apiKey || !emailFrom || !frontendUrl) {
    throw new Error('Email configuration is incomplete.');
  }

  const resend = new Resend(apiKey);

  const verificationUrl =
    `${frontendUrl.replace(/\/+$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

  const safeName = name.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: 'Verify your KunlexCity account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#1e293b;">
        <h2 style="color:#b7791f;">Welcome to KunlexCity!</h2>
        <p>Hello ${safeName},</p>
        <p>Thank you for registering with KunlexCity PrimeNest Realty.</p>
        <p>Please verify your email address by clicking the button below.</p>
        <p style="margin:30px 0;">
          <a href="${verificationUrl}"
             style="background:#d69e2e;color:#111827;padding:14px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
            Verify My Email
          </a>
        </p>
        <p>This verification link expires in 24 hours.</p>
        <p>If you did not create this account, you can ignore this email.</p>
        <p>Regards,<br/>KunlexCity PrimeNest Realty</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend email error: ${error.message}`);
  }
}
function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    avatar: user.avatar || undefined,
    bio: user.bio || undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

async function logAuthActivity(
  userId: string,
  userName: string,
  action: string,
  details: string,
  req: Request
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        action,
        details,
        ipAddress: req.ip || null,
      },
    });
  } catch (error) {
    // Do not fail a successful login or registration because of audit logging.
    console.error('Authentication audit log error:', error);
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }

    if (typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid registration details.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'CLIENT',
        phone: typeof phone === 'string' ? phone.trim() : null,
        avatar: DEFAULT_AVATAR,
      },
    });

    await logAuthActivity(
      newUser.id,
      newUser.name,
      'USER_REGISTERED',
      `New client account registered: ${newUser.email}`,
      req
    );

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: safeUser(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create your account. Please try again.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    await logAuthActivity(
      user.id,
      user.name,
      'USER_LOGIN',
      `${user.role} logged in.`,
      req
    );

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to log in. Please try again.',
    });
  }
};

export const getMe = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    return res.status(200).json({
      success: true,
      user: safeUser(req.user),
    });
  } catch (error) {
    console.error('Get current user error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve account information.',
    });
  }
};

export const switchDemoRole = async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Demo role switching is disabled in production.',
      });
    }

    const requestedRole = req.body?.role;

    if (requestedRole !== 'ADMIN' && requestedRole !== 'CLIENT') {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid demo role.',
      });
    }

    const user = await prisma.user.findFirst({
      where: { role: requestedRole },
      orderBy: { createdAt: 'asc' },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No ${requestedRole} demo account exists in the database.`,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Demo ${requestedRole.toLowerCase()} access activated.`,
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Demo role switch error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to switch demo role.',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      await logAuthActivity(
        user.id,
        user.name,
        'PASSWORD_RESET_REQUESTED',
        'A password reset was requested.',
        req
      );
    }

    // Email delivery is not configured yet.
    // Do not claim that a reset email has actually been sent.
    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email, password reset instructions can be sent when email delivery is configured.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to process the password reset request.',
    });
  }
};
