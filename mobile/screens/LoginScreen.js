import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { login } from "../services/authService";

export default function LoginScreen({ onLogin, onRegister, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Please enter your email");
      return;
    }

    if (!password) {
      Alert.alert("Validation", "Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email.trim().toLowerCase(), password);

      onLogin(data);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpendWise</Text>

      <Text style={styles.subtitle}>Manage your expenses smarter</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            selectionColor="#2563EB"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={() => setShowPassword((visible) => !visible)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#475569"
            />
          </Pressable>
        </View>

        <Pressable style={styles.forgotPasswordLink} onPress={onForgotPassword}>
          <Text style={styles.forgotPasswordLinkText}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </Pressable>
        <Pressable style={styles.registerLink} onPress={onRegister}>
          <Text style={styles.registerLinkText}>
            Don't have an account? Create one
          </Text>
        </Pressable>
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

  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },

  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  passwordInput: {
    flex: 1,
    color: "#0F172A",
    padding: 14,
    fontSize: 16,
  },

  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  loginButton: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },

  registerLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 18,
  },

  forgotPasswordLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
