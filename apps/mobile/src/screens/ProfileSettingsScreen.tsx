import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";

export const ProfileSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Header title="Profile & Settings" />

      <View style={styles.content}>
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.full_name || "Alex Chen"}</Text>
          <Text style={styles.email}>{user?.email || "demo@focusflow.dev"}</Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Productivity Constraints</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily Workload Limit</Text>
            <Text style={styles.rowVal}>{user?.daily_capacity_hours || 2.5} hrs/day</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Timezone</Text>
            <Text style={styles.rowVal}>{user?.timezone || "UTC"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>AI Engine</Text>
            <Text style={styles.rowVal}>Autonomous Heuristic</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
  },
  avatarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  email: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowLabel: {
    fontSize: 13,
    color: "#475569",
  },
  rowVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  logoutBtn: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "800",
  },
});
