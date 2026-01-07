import { Metadata } from "next";
import { Dashboard } from "@/features/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Languro",
  description: "User Dashboard",
};

const DashboardPage = () => {
  return <Dashboard />;
};

export default DashboardPage;
