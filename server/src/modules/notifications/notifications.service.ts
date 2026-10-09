import { prisma } from '../../config/database.js';

export class NotificationsService {
  static async getNotifications(limit = 30) {
    const [unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      unreadCount,
      notifications,
    };
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead() {
    return prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}
