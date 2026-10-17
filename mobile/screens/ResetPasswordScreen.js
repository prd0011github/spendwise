import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { resetPassword } from "../services/authService";

export default function ResetPasswordScreen({ onBack, token, onBackToLogin }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Validation", "Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validation", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
      return;
    }

    if (!token) {
      Alert.alert(
        "Invalid Link",
        "This password reset link is missing its token. Request a new link.",
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, newPassword);

      setResetCompleted(true);
    } catch (error) {
      Alert.alert(
        "Password Reset Failed",
        error.message ||
          "This link may be invalid or expired. Request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {resetCompleted ? "Password Updated" : "Reset Password"}
        </Text>

        {resetCompleted ? (
          <>
            <Text style={styles.subtitle}>
              Your SpendWise password has been reset successfully. You can now
              sign in with your new password.
            </Text>

            <Pressable style={styles.primaryButton} onPress={onBackToLogin}>
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Choose a new password for your SpendWise account.
            </Text>

            <Text style={styles.label}>New Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />

            <Text style={styles.label}>Confirm Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.backLink}
              onPress={onBack}
              disabled={loading}
            >
              <Text style={styles.backLinkText}>Back to Login</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 28,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#0F172A",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#0F172A",
  },

  primaryButton: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },

  backLink: {
    marginTop: 20,
    alignItems: "center",
  },

  backLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
