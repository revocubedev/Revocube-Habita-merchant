import { useState } from "react";
// import TypesPanel from "@/components/types/TypesPanel";
import type { TypeCategory } from "@/api/api_controllers/types";
import TypesPanel from "@/components/portal/TypesPanel";

const TABS: { category: TypeCategory; label: string }[] = [
  { category: "MAINTAINER_TYPE", label: "Maintainer" },
  { category: "EXPENSE_ISSUE_TYPE", label: "Expense" },
  { category: "PROPERTY_TYPE", label: "Property" },
  { category: "INVOICE_TYPE", label: "Invoice" },
];

const Types = () => {
  const [active, setActive] = useState<TypeCategory>("MAINTAINER_TYPE");
  const activeTab = TABS.find((t) => t.category === active) ?? TABS[0];

  return (
    <div className="space-y-4">
      <h1
        className="text-2xl font-display font-semibold text-foreground"
        style={{ fontFamily: "Poppins", fontWeight: 600, color: "#393939" }}
      >
        Types
      </h1>

      <div
        className="flex gap-6 border-b"
        style={{ borderColor: "#e3e3e3" }}
        role="tablist"
      >
        {TABS.map((tab) => {
          const selected = tab.category === active;
          return (
            <button
              key={tab.category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.category)}
              className="pb-3 text-sm font-medium transition-colors -mb-px"
              style={{
                fontFamily: "Poppins",
                color: selected ? "#f30100" : "#6b7280",
                borderBottom: selected
                  ? "2px solid #f30100"
                  : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* key remounts the panel per tab, so search and page reset when switching */}
      <TypesPanel
        key={activeTab.category}
        category={activeTab.category}
        label={activeTab.label}
      />
    </div>
  );
};

export default Types;
