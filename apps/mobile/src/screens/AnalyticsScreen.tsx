import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { mobileApi } from "../api/client";
import { Header } from "../components/Header";

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await mobileApi.get("/analytics");
        setAnalytics(res.data.data);
      } catch (e: any) {
        console.warn("Failed to load analytics:", e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading || !analytics) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Analytics" subtitle="Verified database metrics and trends" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* KPI Grid */}
        <View style={styles.grid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{analytics.total_completed_tasks}</Text>
            <Text style={styles.kpiLabel}>TASKS COMPLETED</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{analytics.total_focus_hours}h</Text>
            <Text style={styles.kpiLabel}>TOTAL FOCUS TIME</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{analytics.productivity_streak_days} days</Text>
            <Text style={styles.kpiLabel}>STREAK</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{analytics.weekly_completion_rate}%</Text>
            <Text style={styles.kpiLabel}>WEEKLY RATE</Text>
          </View>
        </View>

        {/* Priority Workload Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks by Priority</Text>
          {Object.entries(analytics.workload?.priority_distribution || {}).map(([p, count]: any) => (
            <View key={p} style={styles.priorityRow}>
              <Text style={styles.pName}>{p}</Text>
              <Text style={styles.pCount}>{count} tasks</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  pName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  pCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
});
