import { Pressable, Modal, StyleSheet, Text, View } from "react-native";

import React, { useState } from "react";
import CurrencySelector from "../components/CurrencySelector";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function ModalComponent({
  showMenu,
  setShowMenu,
  setShowBudgetForm,
  handleLogout,
  onExport,
  onPrintReport,
  onAnalytics,
  onSettings,
  showCurrencyFromSetting,
  setCurrencyFromSetting,
  showThemeFromSetting,
  setShowThemeFromSetting,
}) {
  const { colors, themeMode, updateTheme } = useTheme();
  const { setCurrency } = useCurrency();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  return (
    <>
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <Pressable
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              style={[
                styles.menuTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              SpendWise
            </Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onAnalytics();
              }}
            >
              <Text style={styles.menuIcon}>📊</Text>

              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Analytics
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onExport();
              }}
            >
              <Text style={styles.menuIcon}>📤</Text>
              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Export
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onPrintReport();
              }}
            >
              <Text style={styles.menuIcon}>🖨️</Text>
              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Print Report
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowBudgetForm(true);
              }}
            >
              <Text style={styles.menuIcon}>💰</Text>
              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Budget Settings
              </Text>
            </Pressable>
            {/* setting button */}
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onSettings();
              }}
            >
              <Text style={styles.menuIcon}>⚙️</Text>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Settings
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowCurrencyModal(true);
              }}
            >
              <Text style={styles.menuIcon}>💱</Text>

              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Currency
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowThemeModal(true);
              }}
            >
              <Text style={styles.menuIcon}>🌙</Text>

              <Text
                style={[styles.menuItemText, { color: colors.textPrimary }]}
              >
                Theme
              </Text>
            </Pressable>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuItemText, { color: colors.danger }]}>
                Logout
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={showThemeModal || showThemeFromSetting}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable
            style={[
              styles.themeContainer,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              style={[
                styles.themeTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Choose Theme
            </Text>

            <Pressable
              style={[
                styles.themeOption,
                themeMode === "light" && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={async () => {
                await updateTheme("light");
                setShowThemeModal(false);
                setShowThemeFromSetting(false);
              }}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                ☀️ Light
              </Text>

              {themeMode === "light" && (
                <Text style={[styles.themeCheck, { color: colors.primary }]}>
                  ✓
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.themeOption,
                themeMode === "dark" && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={async () => {
                await updateTheme("dark");
                setShowThemeModal(false);
                setShowThemeFromSetting(false);
              }}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                🌙 Dark
              </Text>

              {themeMode === "dark" && (
                <Text style={[styles.themeCheck, { color: colors.primary }]}>
                  ✓
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.themeOption,
                themeMode === "system" && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={async () => {
                await updateTheme("system");
                setShowThemeModal(false);
                setShowThemeFromSetting(false);
              }}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                📱 System
              </Text>

              {themeMode === "system" && (
                <Text style={[styles.themeCheck, { color: colors.primary }]}>
                  ✓
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      {/* currency Modal */}
      <Modal
        visible={showCurrencyModal || showCurrencyFromSetting}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable
          style={styles.currencyOverlay}
          onPress={() => setShowCurrencyModal(false)}
        >
          <Pressable
            style={[
              styles.currencyContainer,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.currencyHeader}>
              <Text
                style={[
                  styles.currencyTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Choose Currency
              </Text>

              <Pressable
                onPress={() => setShowCurrencyModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close currency selector"
              >
                <Text
                  style={[
                    styles.currencyClose,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            <CurrencySelector
              compact
              onSelect={async (currencyCode) => {
                await setCurrency(currencyCode);
                setShowCurrencyModal(false);
                setCurrencyFromSetting(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },

  menuContainer: {
    width: 230,
    borderRadius: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  menuIcon: {
    width: 30,
    fontSize: 18,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },

  menuDivider: {
    height: 1,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  // theme modal style
  themeContainer: {
    width: 280,
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  themeTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 10,
  },

  themeOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },

  themeCheck: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Currency Moda Style
  currencyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  currencyContainer: {
    width: "100%",
    maxWidth: 380,
    height: "75%",
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  currencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  currencyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  currencyClose: {
    fontSize: 20,
    padding: 4,
  },
});
