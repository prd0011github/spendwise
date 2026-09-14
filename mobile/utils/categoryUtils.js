const categoryIcons = {
  Food: "🍔",
  Shopping: "🛒",
  Transport: "🚕",
  Bills: "🏠",
  Entertainment: "🎬",
  Other: "📦",
};

export const categories = [
  { name: "Food", icon: "🍔" },
  { name: "Shopping", icon: "🛒" },
  { name: "Transport", icon: "🚕" },
  { name: "Bills", icon: "🏠" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Other", icon: "📦" },
];

export const getCategoryIcon = (categoryName) =>
  categoryIcons[categoryName] || categoryIcons.Other;

export default categoryIcons;
