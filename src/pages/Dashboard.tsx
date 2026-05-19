import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { School } from "../lib/types";

export default function Dashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [urn, setUrn] = useState("");
  const [phase, setPhase] = useState("");
  const [localAuthority, setLocalAuthority] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch<School[]>("/schools")
      .then(setSchools)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const school = await apiFetch<School>("/schools", {
      method: "POST",
      body: JSON.stringify({
        name,
        urn: urn || undefined,
        phase: phase || undefined,
        localAuthority: localAuthority || undefined,
      }),
    });
    navigate(`/schools/${school.id}`);
  }

  if (loading) {
    return <p className="text-gray-500">Loading schools...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Schools</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Add School
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g. Oakwood Primary School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URN (optional)
              </label>
              <input
                type="text"
                value={urn}
                onChange={(e) => setUrn(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g. 123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="all-through">All-through</option>
                <option value="further-education">Further Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local Authority
              </label>
              <input
                type="text"
                value={localAuthority}
                onChange={(e) => setLocalAuthority(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g. Cambridgeshire"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Create School
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {schools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-2">No schools yet</p>
          <p className="text-sm text-gray-400">
            Add a school to begin a maturity assessment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <Link
              key={school.id}
              to={`/schools/${school.id}`}
              className="bg-white rounded-lg border p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900">{school.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {school.phase && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {school.phase}
                  </span>
                )}
                {school.urn && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    URN: {school.urn}
                  </span>
                )}
                {school.localAuthority && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {school.localAuthority}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
