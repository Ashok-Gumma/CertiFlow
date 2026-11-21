export type Role = 'TRAINING_CENTRE' | 'DISTRICT_OFFICER' | 'QUALITY_TEAM' | 'STATE_OFFICE';

export type BatchStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DISTRICT_REVIEW'
  | 'QUALITY_REVIEW'
  | 'STATE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED';

export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'RETURNED';
export type CertificateStatus = 'VALID' | 'REVOKED';
export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  districtId?: string | null;
  trainingCentreId?: string | null;
  district?: District | null;
  trainingCentre?: TrainingCentre | null;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  description: string;
  district?: string;
  trainingCentre?: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
}

export interface TrainingCentre {
  id: string;
  name: string;
  code: string;
  districtId: string;
  district?: District;
}

export interface Candidate {
  id: string;
  batchId: string;
  name: string;
  phone: string;
  email: string;
  courseName: string;
  createdAt: string;
  batch?: Batch;
  certificate?: Certificate | null;
}

export interface Approval {
  id: string;
  batchId: string;
  officerId: string;
  role: Role;
  decision: ApprovalDecision;
  comments?: string | null;
  approvalCycle: number;
  createdAt: string;
  officer?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Delivery {
  id: string;
  certificateId: string;
  phone: string;
  status: DeliveryStatus;
  attempts: number;
  lastError?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  certificate?: Certificate;
}

export interface Certificate {
  id: string;
  candidateId: string;
  batchId: string;
  certificateNumber: string;
  issueDate: string;
  filePath: string;
  status: CertificateStatus;
  qrCode?: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  createdAt: string;
  candidate: Candidate;
  batch: Batch;
  delivery?: Delivery | null;
}

export interface Batch {
  id: string;
  batchNumber: string;
  batchName: string;
  courseName: string;
  courseCode: string;
  trainingCentreId: string;
  districtId: string;
  candidateCount: number;
  status: BatchStatus;
  approvalCycle: number;
  trainingStartDate?: string | null;
  trainingEndDate?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  trainingCentre: TrainingCentre;
  district: District;
  candidates?: Candidate[];
  approvals?: Approval[];
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  role?: Role | null;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalBatches: number;
  pendingApprovals: number;
  certificatesIssued: number;
  deliverySuccessRate: number;
}
