import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { StandardCategory, AssessmentDetail } from "../lib/types";

const MATURITY_LABELS: Record<number, string> = {
  1: "Initial",
  2: "Developing",
  3: "Defined",
  4: "Managed",
  5: "Optimising",
};

const MATURITY_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  4: "bg-blue-100 text-blue-800 border-blue-300",
  5: "bg-green-100 text-green-800 border-green-300",
};

export default function AssessmentWizard() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<StandardCategory[]>([]);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, { maturityLevel: number | null; notes: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;
    Promise.all([
      apiFetch<StandardCategory[]>("/standards"),
      apiFetch<AssessmentDetail>(`/assessments/${assessmentId}`),
    ]).then(([cats, a]) => {
      setCategories(cats);
      setAssessment(a);
      const existing: Record<string, { maturityLevel: number | null; notes: string }> = {};
      for (const r of a.responses) {
        existing[r.criterionId] = {
          maturityLevel: r.maturityLevel,
          notes: r.notes ?? "",
        };
      }
      setResponses(existing);
      setLoading(false);
    });
  }, [assessmentId]);

  async function saveResponse(criterionId: string, level: number | null, notes: string) {
    setSaving(true);
    try {
      await apiFetch(`/assessments/${assessmentId}/responses`, {
        method: "PUT",
        body: JSON.stringify({ criterionId, maturityLevel: level, notes }),
      });
      setResponses((prev) => ({
        ...prev,
        [criterionId]: { maturityLevel: level, notes },
      }));
    } finally {
      setSaving(false);
    }
  }

  async function completeAssessment() {
    await apiFetch(`/assessments/${assessmentId}/complete`, { method: "POST" });
    navigate(`/assessments/${assessmentId}/report`);
  }

  if (loading) return <p className="text-gray-500">Loading assessment...</p>;
  if (!assessment) return <p className="text-red-500">Assessment not found</p>;

  const currentCat = categories[currentCatIndex];
  if (!currentCat) return null;

  const totalCriteria = categories.reduce((sum, c) => sum + c.criteria.length, 0);
  const scoredCount = Object.values(responses).filter((r) => r.maturityLevel != null).length;
  const progress = Math.round((scoredCount / totalCriteria) * 100);

  return (
    <div>
      <Link
        to={`/schools/${assessment.schoolId}`}
        className="text-blue-600 text-sm hover:underline mb-4 inline-block"
      >
        ← Back to school
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {assessment.title ?? "Assessment"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{assessment.schoolName}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {scoredCount} / {totalCriteria} criteria scored ({progress}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {categories.map((cat, idx) => {
          const catCriteria = cat.criteria.map((cr) => responses[cr.id]);
          const catScored = catCriteria.filter((r) => r?.maturityLevel != null).length;
          const isComplete = catScored === cat.criteria.length;
          return (
            <button
              key={cat.id}
              onClick={() => setCurrentCatIndex(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                idx === currentCatIndex
                  ? "bg-blue-600 text-white border-blue-600"
                  : isComplete
                    ? "bg-green-50 text-green-700 border-green-300"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
              }`}
            >
              {cat.name}
              {isComplete && idx !== currentCatIndex && " ✓"}
            </button>
          );
        })}
      </div>

      {/* Current category */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-semibold text-gray-900">{currentCat.name}</h3>
          {currentCat.isCore && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
              Core Standard
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">{currentCat.description}</p>

        <div className="space-y-8">
          {currentCat.criteria.map((criterion) => {
            const response = responses[criterion.id];
            return (
              <div key={criterion.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <h4 className="font-medium text-gray-900 mb-1">{criterion.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>

                {criterion.guidance && (
                  <details className="mb-3">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                      View maturity level guidance
                    </summary>
                    <p className="text-xs text-gray-500 mt-1 pl-3 border-l-2 border-blue-200 whitespace-pre-wrap">
                      {criterion.guidance}
                    </p>
                  </details>
                )}

                {/* Maturity level selector */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        saveResponse(
                          criterion.id,
                          response?.maturityLevel === level ? null : level,
                          response?.notes ?? "",
                        )
                      }
                      disabled={saving}
                      className={`px-3 py-1.5 rounded border text-sm font-medium transition-all ${
                        response?.maturityLevel === level
                          ? MATURITY_COLORS[level]
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {level} — {MATURITY_LABELS[level]}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <textarea
                  placeholder="Evidence / notes (optional)"
                  value={response?.notes ?? ""}
                  onChange={(e) => {
                    const notes = e.target.value;
                    setResponses((prev) => ({
                      ...prev,
                      [criterion.id]: {
                        maturityLevel: prev[criterion.id]?.maturityLevel ?? null,
                        notes,
                      },
                    }));
                  }}
                  onBlur={(e) =>
                    saveResponse(
                      criterion.id,
                      response?.maturityLevel ?? null,
                      e.target.value,
                    )
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentCatIndex((i) => Math.max(0, i - 1))}
          disabled={currentCatIndex === 0}
          className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          ← Previous
        </button>

        {currentCatIndex < categories.length - 1 ? (
          <button
            onClick={() => setCurrentCatIndex((i) => i + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={completeAssessment}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
          >
            Complete Assessment & View Report
          </button>
        )}
      </div>
    </div>
  );
}
