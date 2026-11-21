import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        district: true,
        trainingCentre: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      districtId: user.districtId,
      trainingCentreId: user.trainingCentreId,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district ? { id: user.district.id, name: user.district.name } : null,
        trainingCentre: user.trainingCentre ? { id: user.trainingCentre.id, name: user.trainingCentre.name } : null,
      },
    });
  }

  public static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        district: true,
        trainingCentre: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district ? { id: user.district.id, name: user.district.name } : null,
        trainingCentre: user.trainingCentre ? { id: user.trainingCentre.id, name: user.trainingCentre.name } : null,
      },
    });
  }

  public static async getDemoUsers(req: Request, res: Response): Promise<void> {
    const demoAccounts = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: { select: { name: true } },
        trainingCentre: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      demoUsers: demoAccounts.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        description:
          u.role === 'TRAINING_CENTRE'
            ? 'Submits candidate batches and manages student rosters'
            : u.role === 'DISTRICT_OFFICER'
            ? 'Reviews batches and provides District Approval (requires 2)'
            : u.role === 'QUALITY_TEAM'
            ? 'Scrutinizes candidate quality for batches with 50+ candidates'
            : 'Performs final authorization, issuance & revocation',
        district: u.district?.name,
        trainingCentre: u.trainingCentre?.name,
      })),
    });
  }

  public static async demoSwitch(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        district: true,
        trainingCentre: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Demo user not found' });
      return;
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      districtId: user.districtId,
      trainingCentreId: user.trainingCentreId,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district ? { id: user.district.id, name: user.district.name } : null,
        trainingCentre: user.trainingCentre ? { id: user.trainingCentre.id, name: user.trainingCentre.name } : null,
      },
    });
  }
}
