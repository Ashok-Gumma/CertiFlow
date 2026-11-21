import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      districtId: user.districtId,
      trainingCentreId: user.trainingCentreId,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, config.jwtSecret) as AuthUser;
}
