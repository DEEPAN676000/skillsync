import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import mongoose from 'mongoose';
import localStore from './localStore.js';

export interface SendNotificationOptions {
  recipientId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'live_class' | 'course' | 'assignment' | 'subscription' | 'system';
  link?: string;
  sendEmailAlert?: boolean;
}

export const createNotification = async (
  options: SendNotificationOptions
): Promise<void> => {
  try {
    const recipientIdStr = options.recipientId.toString();
    if (mongoose.connection.readyState === 1) {
      await Notification.create({
        recipient: options.recipientId,
        title: options.title,
        message: options.message,
        type: options.type,
        link: options.link || '',
      });

      if (options.sendEmailAlert) {
        const user = await User.findById(options.recipientId);
        if (user && user.email) {
          await sendEmail({
            to: user.email,
            subject: `SkillSync: ${options.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #6d28d9; margin-top: 0;">SkillSync Notification</h2>
                <h3>${options.title}</h3>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">${options.message}</p>
                ${
                  options.link
                    ? `<div style="margin-top: 24px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${options.link}" style="background-color: #7c3aed; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View in SkillSync</a></div>`
                    : ''
                }
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 15px;" />
                <p style="font-size: 12px; color: #94a3b8;">SkillSync - Discover Skills. Share Talent. Grow Together.</p>
              </div>
            `,
          });
        }
      }
    } else {
      localStore.notifications.unshift({
        _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipient: recipientIdStr,
        title: options.title,
        message: options.message,
        type: options.type,
        link: options.link || '',
        isRead: false,
        createdAt: new Date(),
      });
    }
  } catch (error: any) {
    console.error('[Notification] Error creating notification:', error.message);
  }
};
