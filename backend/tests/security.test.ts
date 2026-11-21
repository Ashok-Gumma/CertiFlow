import { describe, it, expect, vi } from 'vitest';
import { signToken, verifyToken } from '../src/utils/jwt';
import { authenticate, requireRoles } from '../src/middleware/auth';
import { approvalSchema, revokeCertificateSchema, loginSchema, createBatchSchema } from '../src/validators';

describe('Security, Auth & RBAC Middleware Tests', () => {
  it('should sign and accurately verify JWT tokens', () => {
    const mockUser = {
      id: 'user-uuid-1234',
      name: 'Farah',
      email: 'farah@certiflow.gov.in',
      role: 'STATE_OFFICE' as const,
    };

    const token = signToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.name).toBe(mockUser.name);
    expect(decoded.role).toBe(mockUser.role);
  });

  it('should reject requests without Authorization header with 401', () => {
    const req: any = { headers: {} };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('missing or invalid') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate valid bearer token and attach req.user', () => {
    const mockUser = {
      id: 'user-dev-1',
      name: 'Dev',
      email: 'dev@certiflow.gov.in',
      role: 'DISTRICT_OFFICER' as const,
    };
    const token = signToken(mockUser);

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.name).toBe('Dev');
    expect(req.user.role).toBe('DISTRICT_OFFICER');
  });

  it('should enforce role-based authorization (RBAC) and reject unauthorized roles with 403', () => {
    // Training Centre user attempting State Office action
    const req: any = {
      user: {
        id: 'tc-1',
        name: 'Anika',
        role: 'TRAINING_CENTRE',
      },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const stateGuard = requireRoles('STATE_OFFICE');
    stateGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('Access denied') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should permit authorized roles to pass through RBAC guard', () => {
    const req: any = {
      user: {
        id: 'state-1',
        name: 'Farah',
        role: 'STATE_OFFICE',
      },
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const stateGuard = requireRoles('STATE_OFFICE');
    stateGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should enforce mandatory comments for REJECTED and RETURNED approval decisions in schema', () => {
    // Valid: APPROVED without comments
    const approved = approvalSchema.safeParse({ decision: 'APPROVED' });
    expect(approved.success).toBe(true);

    // Invalid: REJECTED with empty comments
    const rejectedEmpty = approvalSchema.safeParse({ decision: 'REJECTED', comments: '' });
    expect(rejectedEmpty.success).toBe(false);

    // Invalid: RETURNED with too short comments (<5 chars)
    const returnedShort = approvalSchema.safeParse({ decision: 'RETURNED', comments: 'bad' });
    expect(returnedShort.success).toBe(false);

    // Valid: RETURNED with descriptive reason
    const returnedValid = approvalSchema.safeParse({
      decision: 'RETURNED',
      comments: 'Attendance sheets must be verified before proceeding.',
    });
    expect(returnedValid.success).toBe(true);
  });

  it('should enforce minimum 5-character reason on certificate revocation schema', () => {
    const short = revokeCertificateSchema.safeParse({ reason: 'no' });
    expect(short.success).toBe(false);

    const valid = revokeCertificateSchema.safeParse({
      reason: 'Malpractice found during district physical audit.',
    });
    expect(valid.success).toBe(true);
  });
});
