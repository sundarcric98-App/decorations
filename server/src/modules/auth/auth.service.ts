import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/database.js';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const secret = process.env.JWT_SECRET || 'sathuragiri_super_secret_jwt_key_2026_luxury_events_decor';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn }
    );

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role }),
      },
    }).catch(() => {});

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success simulation for security
      return { message: 'If this email is registered, password reset instructions have been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: resetExpires,
      },
    });

    // In production, an email would be sent. For local development, log to console:
    console.log(`🔑 Password Reset Token for ${user.email}: ${resetToken}`);

    return {
      message: 'Password reset link generated. Please check your email or contact system administrator.',
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  static async resetPassword(token: string, newPass: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Reset token is invalid or has expired.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password has been successfully updated. You can now log in.' };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
