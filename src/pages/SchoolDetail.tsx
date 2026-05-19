import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { School, AssessmentSummary } from "../lib/types";

export default function SchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    Promise.all([
      apiFetch<School[]>("/schools").then((schools) =>
        schools.find((s) => s.id === schoolId) ?? null,
      ),
      apiFetch<AssessmentSummary[]>(`/schools/${schoolId}/assessments`),
    ]).then(([s, a]) => {
      setSchool(s);
      setAssessments(a);
      setLoading(false);
    });
  }, [schoolId]);

  async function startAssessment() {
    const result = await apiFetch<{ id: string }>(
      `/schools/${schoolId}/assessments`,
      {
        method: "POST",
        body: JSON.stringify({
          title: `Assessment — ${new Date().toLocaleDateString("en-GB")}`,
        }),
      },
    );
    navigate(`/assessments/${result.id}`);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!school) return <p className="text-red-500">School not found</p>;

  return (
    <div>
      <Link to="/" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to schools
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
          <div className="flex gap-3 mt-1 text-sm text-gray-500">
            {school.phase && <span className="capitalize">{school.phase}</span>}
            {school.urn && <span>URN: {school.urn}</span>}
            {school.localAuthority && <span>{school.localAuthority}</span>}
          </div>
        </div>
        <button
          onClick={startAssessment}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Start New Assessment
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-3">Assessments</h3>

      {assessments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-500">No assessments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start an assessment to evaluate against DfE standards
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <Link
              key={a.id}
              to={
                a.status === "completed"
                  ? `/assessments/${a.id}/report`
                  : `/assessments/${a.id}`
              }
              className="block bg-white rounded-lg border p-4 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">
                    {a.title ?? "Untitled Assessment"}
                  </span>
                  <span className="text-sm text-gray-500 ml-3">
                    {new Date(a.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    a.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>
              {a.assessorEmail && (
                <p className="text-xs text-gray-400 mt-1">
                  Assessor: {a.assessorEmail}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
