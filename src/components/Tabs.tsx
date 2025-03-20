import React from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onChange, tabs }) => {
  return (
    <div className="flex mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex-1 py-2 text-center ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
