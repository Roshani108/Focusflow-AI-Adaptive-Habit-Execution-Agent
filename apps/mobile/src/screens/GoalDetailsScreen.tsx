import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { mobileApi } from "../api/client";
import { Goal, Task } from "../types";
import { Header } from "../components/Header";
import { TaskCard } from "../components/TaskCard";

export const GoalDetailsScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const [goal, setGoal] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);

  const loadGoal = async () => {
    try {
      const res = await mobileApi.get(`/goals/${goalId}`);
      setGoal(res.data.data);
    } catch (e: any) {
      console.warn("Failed to load goal details:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await mobileApi.patch(`/tasks/${task.id}/status`, { status: "TODO" });
      } else {
        await mobileApi.patch(`/tasks/${task.id}/complete`, null, {
          params: { actual_minutes: task.estimated_minutes },
        });
      }
      await loadGoal();
    } catch (e: any) {
      Alert.alert("Error", "Could not toggle task.");
    }
  };

  const handleReplan = async () => {
    setIsReplanning(true);
    try {
      const res = await mobileApi.post(`/goals/${goalId}/replan`);
      Alert.alert("⚠ Schedule Updated by AI", res.data.data.summary);
      await loadGoal();
    } catch (e: any) {
      Alert.alert("Error", "Replanning failed.");
    } finally {
      setIsReplanning(false);
    }
  };

  if (isLoading || !goal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={goal.title}
        subtitle={`${goal.category} • ${goal.progress_percentage || 0}% Complete`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.replanAction} onPress={handleReplan} disabled={isReplanning}>
            <Text style={styles.replanActionText}>{isReplanning ? "..." : "Replan"}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {goal.description ? (
          <Text style={styles.desc}>{goal.description}</Text>
        ) : null}

        {/* Milestones & Tasks list */}
        {goal.milestones?.map((milestone: any, idx: number) => (
          <View key={milestone.id} style={styles.milestoneSection}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneIndex}>{idx + 1}</Text>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            </View>

            <View style={styles.milestoneTasks}>
              {milestone.tasks?.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleTask}
                  onPress={() => navigation.navigate("TaskDetails", { task })}
                />
              ))}
            </View>
          </View>
        ))}
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
    paddingBottom: 32,
  },
  desc: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 18,
  },
  replanAction: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  replanActionText: {
    color: "#b45309",
    fontSize: 11,
    fontWeight: "700",
  },
  milestoneSection: {
    marginBottom: 20,
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  milestoneIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 20,
    marginRight: 8,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  milestoneTasks: {
    paddingLeft: 10,
  },
});
