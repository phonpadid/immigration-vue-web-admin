export function getBadgeColor(name: string): string {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (name.includes("read")) return isDarkMode ? "bg-blue-700" : "bg-blue-200";
  if (name.includes("write"))
    return isDarkMode ? "bg-green-700" : "bg-green-200";
  if (name.includes("remove")) return isDarkMode ? "bg-red-700" : "bg-red-200";


  return isDarkMode ? "bg-gray-800" : "bg-gray-200";
}
