import { Navigate } from "react-router";

import { PageHeader } from "@/components/page-header";
import { ROLES } from "@/constants/roles";
import { DashboardPage } from "@/pages/dashboard-page";
import { getRole } from "@/store/token";

export function HomePage() {
  const role = getRole();

  if (role === ROLES.SYSADMIN) {
    return <DashboardPage />;
  }
  // A recruiter's work is the candidate list, so "/" takes them straight there.
  if (role === ROLES.RECRUITER || role === ROLES.LEAD) {
    return <Navigate to="/candidates" replace />;
  }
  // BU Head, MD and HR work from the approval queue.
  if (role === ROLES.BU_HEAD || role === ROLES.MD || role === ROLES.HR) {
    return <Navigate to="/proposals" replace />;
  }

  return (
    <PageHeader title="Welcome to TalentOps" description="Please select an option from the menu." />
  );
} 

