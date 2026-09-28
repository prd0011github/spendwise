import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");

  return `"${stringValue.replace(/"/g, '""')}"`;
};

export const exportTransactionsToCsv = async (transactions) => {
  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions available to export");
  }

  const header = ["Date", "Expense", "Category", "Amount"];

  const rows = transactions.map((transaction) => [
    transaction.date,
    transaction.name,
    transaction.category || "Other",
    transaction.amount,
  ]);

  const totalAmount = transactions.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0,
  );

  rows.push(["", "", "TOTAL", totalAmount]);

  const csvContent = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const fileName = `SpendWise_Transactions_${Date.now()}.csv`;

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export SpendWise Transactions",
    UTI: "public.comma-separated-values-text",
  });

  return fileUri;
};
