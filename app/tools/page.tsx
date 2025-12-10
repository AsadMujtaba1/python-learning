import Link from "next/link";

export default function ToolsPage() {
  // List of tools (expandable in future)
  const tools = [
    {
      name: "Energy Calculator",
      description: "Estimate your daily energy costs and savings.",
      href: "/tools/energy-waste-calculator",
    },
    // Add more tools here later
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
      <div className="grid gap-6">
        {tools.map((tool) => (
          <Link key={tool.name} href={tool.href} className="block p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:shadow-lg transition">
            <div className="flex flex-col gap-2">
              <span className="text-xl font-semibold text-blue-700 dark:text-blue-300">{tool.name}</span>
              <span className="text-gray-600 dark:text-gray-400">{tool.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
