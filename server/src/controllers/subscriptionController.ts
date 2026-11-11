import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import TeacherProfile from '../models/TeacherProfile.js';
import { AuthRequest } from '../middleware/auth.js';
import localStore from '../utils/localStore.js';

export const getSubscriptionPlans = (req: Request, res: Response): void => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic Starter',
      price: 0,
      billingCycle: 'Free Forever',
      description: 'Ideal for new instructors starting out.',
      features: [
        'Free teacher profile',
        'Up to 3 published courses',
        'Up to 5 skill showcase videos',
        'Standard search discovery',
        '15% platform commission',
        'Basic learner messaging',
      ],
      limits: {
        maxCourses: 3,
        maxVideos: 5,
        commissionRate: 15,
        priorityDiscovery: false,
        analyticsEnabled: false,
      },
    },
    {
      id: 'premium',
      name: 'Instructor Premium',
      price: 999,
      billingCycle: 'per month',
      description: 'Accelerate your teaching career and reach thousands of students.',
      features: [
        'Verified instructor badge eligibility',
        'Up to 15 published courses',
        'Up to 30 skill showcase videos',
        'Priority category search placement',
        '10% platform commission',
        'Live group classes up to 50 students',
        'Student assignment grading tools',
      ],
      popular: true,
      limits: {
        maxCourses: 15,
        maxVideos: 30,
        commissionRate: 10,
        priorityDiscovery: true,
        analyticsEnabled: true,
      },
    },
    {
      id: 'pro',
      name: 'Master Pro',
      price: 2499,
      billingCycle: 'per month',
      description: 'Top-tier visibility, advanced analytics, and lowest commission.',
      features: [
        'Top homepage & search spotlight',
        'Up to 50 published courses',
        'Up to 100 skill showcase videos',
        'Lowest 5% platform commission',
        'Advanced revenue & retention analytics',
        'Custom 1-on-1 booking slots',
        'Priority 24/7 dedicated support',
      ],
      limits: {
        maxCourses: 50,
        maxVideos: 100,
        commissionRate: 5,
        priorityDiscovery: true,
        analyticsEnabled: true,
      },
    },
  ];

  res.status(200).json({ success: true, data: plans });
};

export const getMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = (req.user!._id || req.user!.id).toString();

    if (mongoose.connection.readyState === 1) {
      let sub = await Subscription.findOne({
        teacher: req.user!._id,
        status: 'active',
      }).populate('payment');

      if (!sub) {
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        sub = await Subscription.create({
          teacher: req.user!._id,
          plan: 'basic',
          startDate: new Date(),
          endDate,
          status: 'active',
          price: 0,
          features: {
            maxCourses: 3,
            maxVideos: 5,
            commissionRate: 15,
            priorityDiscovery: false,
            analyticsEnabled: false,
          },
        });
      }

      res.status(200).json({ success: true, data: sub });
    } else {
      let sub = localStore.subscriptions.find(
        (s) => s.teacher === teacherId || s.teacher?._id === teacherId || s.teacher?.id === teacherId
      );

      if (!sub) {
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        sub = {
          _id: `sub_${teacherId}`,
          teacher: req.user,
          plan: 'basic',
          startDate: new Date(),
          endDate,
          status: 'active',
          price: 0,
          features: {
            maxCourses: 3,
            maxVideos: 5,
            commissionRate: 15,
            priorityDiscovery: false,
            analyticsEnabled: false,
          },
        };
        localStore.subscriptions.push(sub);
      }

      res.status(200).json({ success: true, data: sub });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
