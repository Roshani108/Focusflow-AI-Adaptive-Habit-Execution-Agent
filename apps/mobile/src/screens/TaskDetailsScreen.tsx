import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { mobileApi } from "../api/client";
import { Task } from "../types";
import { Header } from "../components/Header";
import { PriorityBadge } from "../components/PriorityBadge";

export const TaskDetailsScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { task: initialTask } = route.params;
  const [task, setTask] = useState<Task>(initialTask);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      if (task.status === "COMPLETED") {
        const res = await mobileApi.patch(`/tasks/${task.id}/status`, { status: "TODO" });
        setTask(res.data.data);
      } else {
        const res = await mobileApi.patch(`/tasks/${task.id}/complete`, null, {
          params: { actual_minutes: task.estimated_minutes },
        });
        setTask(res.data.data);
      }
    } catch (e: any) {
      Alert.alert("Error", "Failed to update task status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isCompleted = task.status === "COMPLETED";

  return (
    <View style={styles.container}>
      <Header title="Task Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <PriorityBadge priority={task.priority} />
            <Text style={styles.statusText}>{task.status}</Text>
          </View>

          <Text style={styles.title}>{task.title}</Text>

          {task.description ? (
            <Text style={styles.desc}>{task.description}</Text>
          ) : null}

          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Estimated Duration:</Text>
              <Text style={styles.metaVal}>{task.estimated_minutes} minutes</Text>
            </View>
            {task.actual_minutes > 0 ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Actual Time Spent:</Text>
                <Text style={styles.metaVal}>{task.actual_minutes} minutes</Text>
              </View>
            ) : null}
            {task.tags ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Tags:</Text>
                <Text style={styles.metaVal}>{task.tags}</Text>
              </View>
            ) : null}
          </View>

          {task.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>AI Guidance & Tips</Text>
              <Text style={styles.notesText}>{task.notes}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.toggleBtn, isCompleted ? styles.incompleteBtn : styles.completeBtn]}
            onPress={handleToggleComplete}
            disabled={isUpdating}
          >
            <Text style={styles.toggleBtnText}>
              {isCompleted ? "Mark Incomplete" : "Mark Complete ✓"}
            </Text>
          </TouchableOpacity>
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
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 16,
  },
  metaBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  notesBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 16,
  },
  toggleBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: "#10b981",
  },
  incompleteBtn: {
    backgroundColor: "#64748b",
  },
  toggleBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
