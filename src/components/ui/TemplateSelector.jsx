import React from "react";

const TemplateSelector = ({ value, onChange }) => {
  const templates = [
    { id: "minimal", name: "Minimalis", desc: "Bersih & profesional" },
    { id: "corporate", name: "Korporat", desc: "Formal & terstruktur" },
    { id: "creative", name: "Kreatif", desc: "Modern & eye-catching" },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Template CV
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              value === template.id
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <div className="font-bold text-gray-800 dark:text-white">
              {template.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {template.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;