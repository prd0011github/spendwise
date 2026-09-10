const categoryIcons = {
  Food: "🍔",
  Shopping: "🛒",
  Transport: "🚕",
  Bills: "🏠",
  Entertainment: "🎬",
  Other: "📦",
};

export const getCategoryIcon = (categoryName) =>
  categoryIcons[categoryName] || categoryIcons.Other;

export default categoryIcons;
