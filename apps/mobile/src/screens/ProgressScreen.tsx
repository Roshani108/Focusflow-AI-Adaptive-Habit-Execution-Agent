import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { mobileApi } from "../api/client";
import { Header } from "../components/Header";

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [weekly, setWeekly] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await mobileApi.get("/dashboard");
        setWeekly(res.data.data?.weekly_progress || []);
      } catch (e: any) {
        console.warn("Failed to load progress:", e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Progress Tracking" subtitle="Daily execution and velocity breakdown" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionHeader}>Weekly Daily Activity</Text>

          {weekly.map((item, idx) => {
            const pct = item.total_tasks > 0 ? Math.round((item.completed_tasks / item.total_tasks) * 100) : 0;
            return (
              <View key={idx} style={styles.dayCard}>
                <View style={styles.dayTop}>
                  <Text style={styles.dayName}>{item.day} ({item.date})</Text>
                  <Text style={styles.dayScore}>{pct}% Complete</Text>
                </View>

                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>

                <View style={styles.dayBottom}>
                  <Text style={styles.subText}>{item.completed_tasks} / {item.total_tasks} tasks</Text>
                  <Text style={styles.subText}>{item.focus_minutes} focus mins</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  dayScore: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4f46e5",
  },
  barTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 3,
  },
  dayBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subText: {
    fontSize: 11,
    color: "#64748b",
  },
});
