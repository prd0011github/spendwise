export const currencies = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    locale: "en-IN",
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    locale: "en-CA",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
  },
];

export const DEFAULT_CURRENCY = "INR";

export const getCurrency = (currencyCode) => {
  return (
    currencies.find((currency) => currency.code === currencyCode) ||
    currencies[0]
  );
};

export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = getCurrency(currencyCode);

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
  }).format(Number(amount) || 0);
};
