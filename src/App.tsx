import { Routes, Route } from "react-router-dom";
import { getUser } from "./lib/api";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SchoolDetail from "./pages/SchoolDetail";
import AssessmentWizard from "./pages/AssessmentWizard";
import ReportView from "./pages/ReportView";

export default function App() {
  const user = getUser();

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schools/:schoolId" element={<SchoolDetail />} />
        <Route path="/assessments/:assessmentId" element={<AssessmentWizard />} />
        <Route path="/assessments/:assessmentId/report" element={<ReportView />} />
      </Routes>
    </Layout>
  );
}
