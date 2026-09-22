export const formatTransactionDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
