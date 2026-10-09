import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../config/database.js';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await db.queryOne(
      `SELECT id, email, "passwordHash", name, phone, role, "isActive"
       FROM "User"
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );

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
    await db.query(
      `INSERT INTO "AuditLog" ("userId", action, entity, "entityId", details)
       VALUES ($1, 'LOGIN', 'USER', $2, $3)`,
      [user.id, user.id, JSON.stringify({ email: user.email, role: user.role })]
    ).catch(() => {});

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
    const user = await db.queryOne(
      `SELECT id, email FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim()]
    );

    if (!user) {
      return { message: 'If this email is registered, password reset instructions have been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      `UPDATE "User"
       SET "resetToken" = $1, "resetTokenExpires" = $2
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    console.log(`🔑 Password Reset Token for ${user.email}: ${resetToken}`);

    return {
      message: 'Password reset link generated. Please check your email or contact system administrator.',
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  static async resetPassword(token: string, newPass: string) {
    const user = await db.queryOne(
      `SELECT id FROM "User"
       WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()
       LIMIT 1`,
      [token]
    );

    if (!user) {
      throw new Error('Reset token is invalid or has expired.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await db.query(
      `UPDATE "User"
       SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpires" = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return { message: 'Password has been successfully updated. You can now log in.' };
  }

  static async getProfile(userId: string) {
    const user = await db.queryOne(
      `SELECT id, email, name, phone, role, "isActive", "createdAt"
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
