import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Goal } from "../types";

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const pct = goal.progress_percentage || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.category}>{goal.category}</Text>
        <Text style={styles.status}>{goal.status}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {goal.title}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${Math.min(100, pct)}%` }]} />
        </View>
        <Text style={styles.progressText}>{pct}%</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {goal.completed_tasks || 0} / {goal.total_tasks || 0} tasks completed
        </Text>
        <Text style={styles.viewRoadmap}>View Roadmap →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4f46e5",
    textTransform: "uppercase",
  },
  status: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  footerText: {
    fontSize: 11,
    color: "#64748b",
  },
  viewRoadmap: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4f46e5",
  },
});
