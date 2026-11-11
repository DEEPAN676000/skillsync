import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import localStore from '../utils/localStore.js';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const notifications = await Notification.find({ recipient: req.user!._id })
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = await Notification.countDocuments({
        recipient: req.user!._id,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
        data: notifications,
      });
    } else {
      const notifications = localStore.notifications.filter(
        (n) => n.recipient === userId || n.recipient?._id === userId
      );

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      res.status(200).json({
        success: true,
        unreadCount,
        data: notifications.slice(0, 30),
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user!._id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.status(200).json({ success: true, data: notification });
    } else {
      const notification = localStore.notifications.find(
        (n) => n._id === req.params.id && (n.recipient === userId || n.recipient?._id === userId)
      );

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      notification.isRead = true;
      res.status(200).json({ success: true, data: notification });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ recipient: req.user!._id, isRead: false }, { isRead: true });
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } else {
      localStore.notifications.forEach((n) => {
        if (n.recipient === userId || n.recipient?._id === userId) {
          n.isRead = true;
        }
      });
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user!._id });
      res.status(200).json({ success: true, message: 'Notification deleted' });
    } else {
      localStore.notifications = localStore.notifications.filter(
        (n) => !(n._id === req.params.id && (n.recipient === userId || n.recipient?._id === userId))
      );
      res.status(200).json({ success: true, message: 'Notification deleted' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
