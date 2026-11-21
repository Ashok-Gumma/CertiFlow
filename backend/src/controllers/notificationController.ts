import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role },
          { role: null, userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  }

  public static async markAsRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read' });
  }

  public static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role },
          { role: null, userId: null },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  }
}
