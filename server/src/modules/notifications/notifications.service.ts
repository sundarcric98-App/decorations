import { query, queryOne } from '../../config/database.js';

export class NotificationsService {
  static async getNotifications(limit = 30) {
    const unreadRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "Notification" WHERE "isRead" = false`
    );
    const unreadCount = unreadRes?.count || 0;

    const notifications = await query<any>(
      `SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT $1`,
      [limit]
    );

    return {
      unreadCount,
      notifications,
    };
  }

  static async markAsRead(id: string) {
    const updated = await queryOne<any>(
      `UPDATE "Notification" SET "isRead" = true WHERE "id" = $1 RETURNING *`,
      [id]
    );
    return updated;
  }

  static async markAllAsRead() {
    const updated = await query<any>(
      `UPDATE "Notification" SET "isRead" = true WHERE "isRead" = false RETURNING *`
    );
    return { count: updated.length };
  }
}
