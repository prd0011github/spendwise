import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getCurrency,
} from "../utils/currency";

const getCurrencyStorageKey = (userId) => `@spendwise_currency_${userId}`;

const getCurrencySetupKey = (userId) =>
  `@spendwise_currency_setup_completed_${userId}`;

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  const [isCurrencyLoaded, setIsCurrencyLoaded] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!currentUserId) {
      setCurrencyState(DEFAULT_CURRENCY);
      setIsCurrencyLoaded(true);
      return;
    }

    const loadCurrency = async () => {
      try {
        setIsCurrencyLoaded(false);

        const storedCurrency = await AsyncStorage.getItem(
          getCurrencyStorageKey(currentUserId),
        );

        if (storedCurrency) {
          setCurrencyState(storedCurrency);
        } else {
          setCurrencyState(DEFAULT_CURRENCY);
        }
      } catch (error) {
        console.log("Failed to load currency:", error.message);
      } finally {
        setIsCurrencyLoaded(true);
      }
    };

    loadCurrency();
  }, [currentUserId]);

  const loadUserCurrency = async (userId) => {
    setCurrentUserId(userId);
  };

  const setCurrency = async (currencyCode) => {
    if (!currentUserId) {
      return;
    }

    const selectedCurrency = getCurrency(currencyCode);

    setCurrencyState(selectedCurrency.code);

    await AsyncStorage.setItem(
      getCurrencyStorageKey(currentUserId),
      selectedCurrency.code,
    );
  };

  const isCurrencySetupCompleted = async (userId) => {
    if (!userId) {
      return false;
    }

    const completed = await AsyncStorage.getItem(getCurrencySetupKey(userId));

    return completed === "true";
  };

  const completeCurrencySetup = async (userId) => {
    if (!userId) {
      return;
    }

    await AsyncStorage.setItem(getCurrencySetupKey(userId), "true");
  };

  const resetCurrencySetup = async (userId) => {
    if (!userId) {
      return;
    }

    await AsyncStorage.removeItem(getCurrencySetupKey(userId));
  };

  const currencyInfo = getCurrency(currency);

  const formatAmount = (amount) => {
    return formatCurrency(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        setCurrency,
        loadUserCurrency,
        isCurrencySetupCompleted,
        completeCurrencySetup,
        resetCurrencySetup,
        formatAmount,
        isCurrencyLoaded,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }

  return context;
};
