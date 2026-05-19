import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { AssessmentReport } from "../lib/types";

const MATURITY_LABELS: Record<number, string> = {
  1: "Initial",
  2: "Developing",
  3: "Defined",
  4: "Managed",
  5: "Optimising",
};

function MaturityBadge({ level }: { level: number | null }) {
  if (level == null) return <span className="text-gray-400 text-sm">Not scored</span>;
  const colors: Record<number, string> = {
    1: "bg-red-100 text-red-800",
    2: "bg-orange-100 text-orange-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-blue-100 text-blue-800",
    5: "bg-green-100 text-green-800",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[level] ?? ""}`}>
      {level} — {MATURITY_LABELS[level]}
    </span>
  );
}

function MaturityBar({ level }: { level: number | null }) {
  const pct = level != null ? (level / 5) * 100 : 0;
  const barColor =
    level === null
      ? "bg-gray-200"
      : level <= 1
        ? "bg-red-400"
        : level <= 2
          ? "bg-orange-400"
          : level <= 3
            ? "bg-yellow-400"
            : level <= 4
              ? "bg-blue-400"
              : "bg-green-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div
        className={`h-3 rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ReportView() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;
    apiFetch<AssessmentReport>(`/assessments/${assessmentId}/report`)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [assessmentId]);

  if (loading) return <p className="text-gray-500">Loading report...</p>;
  if (!report) return <p className="text-red-500">Report not found</p>;

  const coreCategories = report.categories.filter((c) => c.isCore);
  const additionalCategories = report.categories.filter((c) => !c.isCore);

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to schools
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Maturity Assessment Report
            </h2>
            <h3 className="text-lg text-gray-700 mt-1">{report.school.name}</h3>
            <div className="flex gap-3 mt-2 text-sm text-gray-500">
              {report.school.phase && (
                <span className="capitalize">{report.school.phase}</span>
              )}
              {report.school.urn && <span>URN: {report.school.urn}</span>}
              {report.assessment.assessorEmail && (
                <span>Assessor: {report.assessment.assessorEmail}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {report.assessment.title} •{" "}
              {report.assessment.completedAt
                ? new Date(report.assessment.completedAt).toLocaleDateString("en-GB")
                : new Date(report.assessment.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="text-sm text-blue-600 hover:underline print:hidden"
          >
            🖨 Print Report
          </button>
        </div>
      </div>

      {/* Overall score */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          Overall Maturity
        </h4>
        <div className="flex items-end gap-4">
          <span className="text-5xl font-bold text-gray-900">
            {report.overallMaturity?.toFixed(1) ?? "—"}
          </span>
          <span className="text-lg text-gray-500 mb-1">/ 5.0</span>
        </div>
        <MaturityBar level={report.overallMaturity} />
        <p className="text-sm text-gray-500 mt-3">
          {report.scoredCriteria} of {report.totalCriteria} criteria scored
        </p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Category Scores
        </h4>
        <div className="space-y-4">
          {report.categories.map((cat) => (
            <div key={cat.categoryId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {cat.categoryName}
                  </span>
                  {cat.isCore && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      Core
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {cat.averageMaturity?.toFixed(1) ?? "—"}
                </span>
              </div>
              <MaturityBar level={cat.averageMaturity} />
            </div>
          ))}
        </div>
      </div>

      {/* Core Standards Detail */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Core Standards (target: meet by 2030)
        </h4>
        {coreCategories.map((cat) => (
          <div key={cat.categoryId} className="bg-white rounded-lg border p-5 mb-4">
            <h5 className="font-semibold text-gray-900 mb-3">{cat.categoryName}</h5>
            <div className="space-y-3">
              {cat.criteria.map((cr) => (
                <div key={cr.criterionId} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{cr.criterionTitle}</p>
                    {cr.notes && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">{cr.notes}</p>
                    )}
                  </div>
                  <MaturityBadge level={cr.maturityLevel} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Standards Detail */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Standards
        </h4>
        {additionalCategories.map((cat) => (
          <div key={cat.categoryId} className="bg-white rounded-lg border p-5 mb-4">
            <h5 className="font-semibold text-gray-900 mb-3">{cat.categoryName}</h5>
            <div className="space-y-3">
              {cat.criteria.map((cr) => (
                <div key={cr.criterionId} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{cr.criterionTitle}</p>
                    {cr.notes && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">{cr.notes}</p>
                    )}
                  </div>
                  <MaturityBadge level={cr.maturityLevel} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Key Recommendations
        </h4>
        <div className="space-y-3">
          {report.categories
            .filter((cat) => cat.averageMaturity != null && cat.averageMaturity < 3)
            .sort((a, b) => (a.averageMaturity ?? 0) - (b.averageMaturity ?? 0))
            .map((cat) => (
              <div
                key={cat.categoryId}
                className="flex items-start gap-3 p-3 bg-red-50 rounded-md"
              >
                <span className="text-red-500 text-lg">⚠</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {cat.categoryName} — Avg: {cat.averageMaturity?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Below target maturity. Priority area for improvement.
                    {cat.isCore &&
                      " This is a core standard that must be met by 2030."}
                  </p>
                </div>
              </div>
            ))}
          {report.categories.filter(
            (cat) => cat.averageMaturity != null && cat.averageMaturity < 3,
          ).length === 0 && (
            <p className="text-sm text-green-700">
              ✓ All categories are at or above "Defined" level. Continue to
              monitor and improve.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
