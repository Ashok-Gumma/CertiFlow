import { describe, it, expect } from 'vitest';
import { Role, BatchStatus, ApprovalDecision } from '@prisma/client';

describe('Workflow & Approval State Machine Logic', () => {
  interface MockBatch {
    id: string;
    candidateCount: number;
    status: BatchStatus;
    approvalCycle: number;
    approvals: Array<{
      officerId: string;
      role: Role;
      decision: ApprovalDecision;
      approvalCycle: number;
    }>;
  }

  function simulateApproval(batch: MockBatch, officer: { id: string; role: Role }): {
    nextStatus: BatchStatus;
    error?: string;
  } {
    const cycleApprovals = batch.approvals.filter((a) => a.approvalCycle === batch.approvalCycle);

    // Rule: Same officer cannot approve twice in the same cycle
    if (cycleApprovals.some((a) => a.officerId === officer.id)) {
      return { nextStatus: batch.status, error: 'Officer already approved in this cycle' };
    }

    if (officer.role === Role.DISTRICT_OFFICER) {
      if (batch.status !== BatchStatus.SUBMITTED && batch.status !== BatchStatus.DISTRICT_REVIEW) {
        return { nextStatus: batch.status, error: 'Invalid batch state for District Officer' };
      }

      const districtApprovals = cycleApprovals.filter(
        (a) => a.role === Role.DISTRICT_OFFICER && a.decision === ApprovalDecision.APPROVED
      );

      if (districtApprovals.length === 0) {
        return { nextStatus: BatchStatus.DISTRICT_REVIEW };
      } else if (districtApprovals.length === 1) {
        // Second distinct district approval achieved!
        // Quality review is required if candidateCount >= 50
        if (batch.candidateCount >= 50) {
          return { nextStatus: BatchStatus.QUALITY_REVIEW };
        } else {
          return { nextStatus: BatchStatus.STATE_REVIEW };
        }
      }
    } else if (officer.role === Role.QUALITY_TEAM) {
      if (batch.status !== BatchStatus.QUALITY_REVIEW) {
        return { nextStatus: batch.status, error: 'Quality review not currently pending' };
      }
      return { nextStatus: BatchStatus.STATE_REVIEW };
    } else if (officer.role === Role.STATE_OFFICE) {
      if (batch.status !== BatchStatus.STATE_REVIEW) {
        return { nextStatus: batch.status, error: 'State review not currently pending' };
      }
      return { nextStatus: BatchStatus.APPROVED };
    }

    return { nextStatus: batch.status, error: 'Unauthorized role' };
  }

  it('should require two distinct district officers to approve', () => {
    const batch: MockBatch = {
      id: 'batch-1',
      candidateCount: 60,
      status: BatchStatus.SUBMITTED,
      approvalCycle: 1,
      approvals: [],
    };

    const dev = { id: 'dev-1', role: Role.DISTRICT_OFFICER };
    const meera = { id: 'meera-2', role: Role.DISTRICT_OFFICER };

    // 1st District Approval (Dev)
    const step1 = simulateApproval(batch, dev);
    expect(step1.nextStatus).toBe(BatchStatus.DISTRICT_REVIEW);
    expect(step1.error).toBeUndefined();

    // Record Dev approval
    batch.status = step1.nextStatus;
    batch.approvals.push({
      officerId: dev.id,
      role: dev.role,
      decision: ApprovalDecision.APPROVED,
      approvalCycle: 1,
    });

    // Dev tries to approve again -> REJECTED
    const stepDuplicate = simulateApproval(batch, dev);
    expect(stepDuplicate.error).toContain('already approved');

    // 2nd District Approval (Meera) -> advances to QUALITY_REVIEW because count 60 >= 50
    const step2 = simulateApproval(batch, meera);
    expect(step2.nextStatus).toBe(BatchStatus.QUALITY_REVIEW);
    expect(step2.error).toBeUndefined();
  });

  it('should skip quality review for batches with fewer than 50 candidates', () => {
    const smallBatch: MockBatch = {
      id: 'batch-small',
      candidateCount: 25, // < 50
      status: BatchStatus.DISTRICT_REVIEW,
      approvalCycle: 1,
      approvals: [
        {
          officerId: 'dev-1',
          role: Role.DISTRICT_OFFICER,
          decision: ApprovalDecision.APPROVED,
          approvalCycle: 1,
        },
      ],
    };

    const meera = { id: 'meera-2', role: Role.DISTRICT_OFFICER };

    // Meera gives 2nd district approval on 25 candidates
    const step = simulateApproval(smallBatch, meera);
    // Skips QUALITY_REVIEW and goes straight to STATE_REVIEW!
    expect(step.nextStatus).toBe(BatchStatus.STATE_REVIEW);
  });

  it('should prevent State Office from approving before district and quality reviews complete', () => {
    const incompleteBatch: MockBatch = {
      id: 'batch-premature',
      candidateCount: 60,
      status: BatchStatus.SUBMITTED,
      approvalCycle: 1,
      approvals: [],
    };

    const farah = { id: 'farah-state', role: Role.STATE_OFFICE };

    const step = simulateApproval(incompleteBatch, farah);
    expect(step.error).toContain('not currently pending');
    expect(step.nextStatus).toBe(BatchStatus.SUBMITTED);
  });
});
