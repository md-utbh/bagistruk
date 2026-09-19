"use client";

import { useDashboard } from "@/app/dashboard/DashboardShell";
import HomeTab from "./HomeTab";
import ExpensesTab from "./ExpensesTab";
import ContactsTab from "./ContactsTab";
import DebtsTab from "./DebtsTab";
import ProfileTab from "./ProfileTab";

/**
 * Renders the active tab content based on DashboardContext.
 */
export default function DashboardTabs() {
  const { activeTab } = useDashboard();

  switch (activeTab) {
    case "home":
      return <HomeTab />;
    case "expenses":
      return <ExpensesTab />;
    case "contacts":
      return <ContactsTab />;
    case "debts":
      return <DebtsTab />;
    case "profile":
      return <ProfileTab />;
    default:
      return <HomeTab />;
  }
}
