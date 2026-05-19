export interface StandardCriterion {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  guidance: string | null;
  sortOrder: number;
}

export interface StandardCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isCore: boolean;
  sortOrder: number;
  criteria: StandardCriterion[];
}

export interface School {
  id: string;
  name: string;
  urn: string | null;
  phase: string | null;
  localAuthority: string | null;
  createdAt: string;
}

export interface AssessmentSummary {
  id: string;
  schoolId: string;
  title: string | null;
  status: string;
  assessorEmail: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AssessmentResponseItem {
  id: string;
  criterionId: string;
  maturityLevel: number | null;
  notes: string | null;
  updatedAt: string;
}

export interface AssessmentDetail extends AssessmentSummary {
  schoolName: string;
  responses: AssessmentResponseItem[];
}

export interface ReportCriterion {
  criterionId: string;
  criterionTitle: string;
  maturityLevel: number | null;
  notes: string | null;
}

export interface ReportCategory {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isCore: boolean;
  criteria: ReportCriterion[];
  averageMaturity: number | null;
}

export interface AssessmentReport {
  school: { name: string; urn: string | null; phase: string | null };
  assessment: {
    id: string;
    title: string | null;
    status: string;
    assessorEmail: string | null;
    completedAt: string | null;
    createdAt: string;
  };
  overallMaturity: number | null;
  totalCriteria: number;
  scoredCriteria: number;
  categories: ReportCategory[];
}
