import { Request, Response } from 'express';
import { BatchStatus, ApprovalDecision, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { enqueueCertificateGeneration } from '../queues';
import { eventBus } from '../events/eventBus';
import { logger } from '../utils/logger';

export class ApprovalController {
  /**
   * List batches pending approval for the current logged in user's role
   */
  public static async getPendingApprovals(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const where: any = {};

    if (user.role === Role.DISTRICT_OFFICER) {
      where.status = { in: [BatchStatus.SUBMITTED, BatchStatus.DISTRICT_REVIEW] };
      if (user.districtId) {
        where.districtId = user.districtId;
      }
    } else if (user.role === Role.QUALITY_TEAM) {
      where.status = BatchStatus.QUALITY_REVIEW;
    } else if (user.role === Role.STATE_OFFICE) {
      where.status = BatchStatus.STATE_REVIEW;
    } else if (user.role === Role.TRAINING_CENTRE) {
      if (user.trainingCentreId) {
        where.trainingCentreId = user.trainingCentreId;
      }
      where.status = {
        in: [
          BatchStatus.SUBMITTED,
          BatchStatus.DISTRICT_REVIEW,
          BatchStatus.QUALITY_REVIEW,
          BatchStatus.STATE_REVIEW,
        ],
      };
    } else {
      res.json({ success: true, pendingBatches: [] });
      return;
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        trainingCentre: { select: { name: true } },
        district: { select: { name: true } },
        approvals: {
          include: { officer: { select: { id: true, name: true, role: true } } },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // For district officer, highlight whether current officer has already approved in this cycle
    const enriched = batches.map((b) => {
      const currentCycleApprovals = b.approvals.filter((a) => a.approvalCycle === b.approvalCycle);
      const hasApproved = currentCycleApprovals.some((a) => a.officerId === user.id);
      const districtApprovalsCount = currentCycleApprovals.filter(
        (a) => a.role === Role.DISTRICT_OFFICER && a.decision === ApprovalDecision.APPROVED
      ).length;

      return {
        ...b,
        hasApproved,
        districtApprovalsCount,
        requiredDistrictApprovals: 2,
        waitingSince: b.submittedAt || b.createdAt,
      };
    });

    res.json({
      success: true,
      pendingBatches: enriched,
    });
  }

  /**
   * Approve a batch
   */
  public static async approveBatch(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user!;

    // Concurrency-safe transaction
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({
        where: { id },
        include: {
          approvals: {
            where: { approvalCycle: undefined },
            include: { officer: true },
          },
          trainingCentre: true,
          district: true,
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const currentCycle = batch.approvalCycle;
      const currentCycleApprovals = batch.approvals.filter((a) => a.approvalCycle === currentCycle);

      // Check if user already approved in this cycle
      const alreadyApproved = currentCycleApprovals.some((a) => a.officerId === user.id);
      if (alreadyApproved) {
        throw new Error('You have already recorded your approval for this batch in the current approval cycle.');
      }

      let newStatus: BatchStatus = batch.status;

      // Handle based on user role and current workflow state
      if (user.role === Role.DISTRICT_OFFICER) {
        if (batch.status !== BatchStatus.SUBMITTED && batch.status !== BatchStatus.DISTRICT_REVIEW) {
          throw new Error(`District Officer cannot approve a batch in '${batch.status}' status.`);
        }

        // Check assigned district
        if (user.districtId && batch.districtId !== user.districtId) {
          throw new Error('You are only authorized to review batches from your assigned district.');
        }

        const existingDistrictApprovals = currentCycleApprovals.filter(
          (a) => a.role === Role.DISTRICT_OFFICER && a.decision === ApprovalDecision.APPROVED
        );

        if (existingDistrictApprovals.length === 0) {
          // First district approval
          newStatus = BatchStatus.DISTRICT_REVIEW;
        } else if (existingDistrictApprovals.length === 1) {
          // Second district approval achieved!
          if (batch.candidateCount >= 50) {
            newStatus = BatchStatus.QUALITY_REVIEW;
          } else {
            // Quality review is skipped for batches < 50 candidates
            newStatus = BatchStatus.STATE_REVIEW;
          }
        } else {
          throw new Error('Two district officer approvals have already been recorded.');
        }

      } else if (user.role === Role.QUALITY_TEAM) {
        if (batch.status !== BatchStatus.QUALITY_REVIEW) {
          throw new Error(`Quality Team can only review batches in QUALITY_REVIEW status. Current: ${batch.status}`);
        }
        newStatus = BatchStatus.STATE_REVIEW;

      } else if (user.role === Role.STATE_OFFICE) {
        if (batch.status !== BatchStatus.STATE_REVIEW) {
          throw new Error(`State Office can only approve batches after all prior reviews are complete. Current: ${batch.status}`);
        }
        newStatus = BatchStatus.APPROVED;

      } else {
        throw new Error('Your role is not authorized to approve batches.');
      }

      // Record approval
      const approval = await tx.approval.create({
        data: {
          batchId: batch.id,
          officerId: user.id,
          role: user.role,
          decision: ApprovalDecision.APPROVED,
          comments: comments || 'Approved',
          approvalCycle: currentCycle,
        },
      });

      // Update batch status
      const updatedBatch = await tx.batch.update({
        where: { id: batch.id },
        data: { status: newStatus },
        include: {
          trainingCentre: true,
          district: true,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: `${user.role}_APPROVED`,
          entityType: 'BATCH',
          entityId: batch.id,
          metadata: {
            officerName: user.name,
            role: user.role,
            comments: comments || 'Approved',
            previousStatus: batch.status,
            newStatus,
            approvalCycle: currentCycle,
          },
        },
      });

      return { updatedBatch, approval, previousStatus: batch.status, newStatus };
    });

    // If final State Office approval, trigger background certificate generation!
    if (result.newStatus === BatchStatus.APPROVED) {
      await enqueueCertificateGeneration({
        batchId: result.updatedBatch.id,
        courseCode: result.updatedBatch.courseCode,
      });

      await prisma.notification.create({
        data: {
          title: 'Batch Fully Approved & Generating Certificates',
          message: `Batch ${result.updatedBatch.batchNumber} has received final state approval. Background generation started.`,
          link: `/batches/${result.updatedBatch.id}`,
        },
      });
    }

    eventBus.broadcast('APPROVAL_COMPLETED', {
      batchId: result.updatedBatch.id,
      batchNumber: result.updatedBatch.batchNumber,
      officerName: user.name,
      role: user.role,
      status: result.newStatus,
    });

    res.json({
      success: true,
      message: `Approval recorded successfully. Batch status updated to ${result.newStatus}.`,
      batch: result.updatedBatch,
      approval: result.approval,
    });
  }

  /**
   * Reject a batch (requires reason)
   */
  public static async rejectBatch(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user!;

    if (!comments || comments.trim().length < 5) {
      res.status(400).json({ success: false, error: 'A rejection reason of at least 5 characters is mandatory.' });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          batchId: batch.id,
          officerId: user.id,
          role: user.role,
          decision: ApprovalDecision.REJECTED,
          comments,
          approvalCycle: batch.approvalCycle,
        },
      });

      await tx.batch.update({
        where: { id },
        data: { status: BatchStatus.REJECTED },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'BATCH_REJECTED',
          entityType: 'BATCH',
          entityId: batch.id,
          metadata: {
            officerName: user.name,
            reason: comments,
            approvalCycle: batch.approvalCycle,
          },
        },
      });

      await tx.notification.create({
        data: {
          title: `Batch ${batch.batchNumber} Rejected`,
          message: `Batch rejected by ${user.name} (${user.role}). Reason: ${comments}`,
          link: `/batches/${batch.id}`,
        },
      });
    });

    eventBus.broadcast('BATCH_REJECTED', {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      officerName: user.name,
      reason: comments,
    });

    res.json({
      success: true,
      message: 'Batch has been rejected.',
    });
  }

  /**
   * Return a batch for correction (requires reason)
   */
  public static async returnBatch(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { comments } = req.body;
    const user = req.user!;

    if (!comments || comments.trim().length < 5) {
      res.status(400).json({ success: false, error: 'A reason for returning the batch (at least 5 characters) is mandatory.' });
      return;
    }

    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          batchId: batch.id,
          officerId: user.id,
          role: user.role,
          decision: ApprovalDecision.RETURNED,
          comments,
          approvalCycle: batch.approvalCycle,
        },
      });

      await tx.batch.update({
        where: { id },
        data: { status: BatchStatus.RETURNED },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'BATCH_RETURNED_FOR_CORRECTION',
          entityType: 'BATCH',
          entityId: batch.id,
          metadata: {
            officerName: user.name,
            reason: comments,
            approvalCycle: batch.approvalCycle,
          },
        },
      });

      await tx.notification.create({
        data: {
          title: `Batch ${batch.batchNumber} Returned for Correction`,
          message: `Action required: ${user.name} returned this batch. Reason: ${comments}`,
          link: `/batches/${batch.id}`,
        },
      });
    });

    eventBus.broadcast('BATCH_RETURNED', {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      officerName: user.name,
      reason: comments,
    });

    res.json({
      success: true,
      message: 'Batch returned to training centre for correction.',
    });
  }
}
