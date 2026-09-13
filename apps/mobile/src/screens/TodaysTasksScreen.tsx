import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, Text } from "react-native";
import { mobileApi } from "../api/client";
import { Task } from "../types";
import { Header } from "../components/Header";
import { TaskCard } from "../components/TaskCard";

export const TodaysTasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const res = await mobileApi.get("/dashboard");
      setTasks(res.data.data?.today_tasks || []);
    } catch (e: any) {
      console.warn("Failed to load today's tasks:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggle = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await mobileApi.patch(`/tasks/${task.id}/status`, { status: "TODO" });
      } else {
        await mobileApi.patch(`/tasks/${task.id}/complete`, null, {
          params: { actual_minutes: task.estimated_minutes },
        });
      }
      await loadTasks();
    } catch (e: any) {
      Alert.alert("Error", "Could not toggle task.");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Today's Tasks"
        subtitle={`${tasks.filter((t) => t.status === "COMPLETED").length} of ${tasks.length} completed`}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tasks scheduled for today.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleComplete={handleToggle}
              onPress={() => navigation.navigate("TaskDetails", { task: item })}
            />
          )}
        />
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
  list: {
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
});
