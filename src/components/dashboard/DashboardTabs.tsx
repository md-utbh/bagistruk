"use client";

import { useDashboard } from "@/app/dashboard/DashboardShell";
import HomeTab from "./HomeTab";
import TransactionsTab from "./TransactionsTab";
import ContactsTab from "./ContactsTab";
import ProfileTab from "./ProfileTab";

/**
 * Renders the active tab content based on DashboardContext.
 */
export default function DashboardTabs() {
  const { activeTab } = useDashboard();

  switch (activeTab) {
    case "home":
      return <HomeTab />;
    case "transactions":
      return <TransactionsTab />;
    case "contacts":
      return <ContactsTab />;
    case "profile":
      return <ProfileTab />;
    default:
      return <HomeTab />;
  }
}
