import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { mobileApi } from "../api/client";
import { Task, Goal } from "../types";
import { TaskCard } from "../components/TaskCard";
import { GoalCard } from "../components/GoalCard";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);

  const loadData = async () => {
    try {
      const res = await mobileApi.get("/dashboard");
      const summary = res.data.data;
      setTodayTasks(summary.today_tasks || []);
      setActiveGoals(summary.active_goals || []);
      setOverdueCount(summary.overdue_tasks?.length || 0);
      setStreakDays(summary.current_streak_days || 0);
    } catch (e: any) {
      console.warn("Failed to load dashboard on mobile:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await mobileApi.patch(`/tasks/${task.id}/status`, { status: "TODO" });
      } else {
        await mobileApi.patch(`/tasks/${task.id}/complete`, null, {
          params: { actual_minutes: task.estimated_minutes },
        });
      }
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", "Could not update task.");
    }
  };

  const handleReplan = async () => {
    if (activeGoals.length === 0) return;
    setIsReplanning(true);
    try {
      const res = await mobileApi.post(`/goals/${activeGoals[0].id}/replan`);
      Alert.alert("⚠ Schedule Updated by AI", res.data.data.summary);
      await loadData();
    } catch (e: any) {
      Alert.alert("Error", "Smart Replanning request failed.");
    } finally {
      setIsReplanning(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="FocusFlow AI"
        subtitle={`Welcome, ${user?.full_name || "Alex"}`}
        rightAction={
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Streak & KPI row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNumber}>🔥 {streakDays}</Text>
            <Text style={styles.kpiLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNumber}>{todayTasks.length}</Text>
            <Text style={styles.kpiLabel}>TODAY'S TASKS</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNumber}>{activeGoals.length}</Text>
            <Text style={styles.kpiLabel}>GOALS ACTIVE</Text>
          </View>
        </View>

        {/* Overdue alert banner if overdue tasks exist */}
        {overdueCount > 0 && (
          <View style={styles.overdueBanner}>
            <View style={styles.overdueTextContainer}>
              <Text style={styles.overdueTitle}>⚠ {overdueCount} Overdue Tasks</Text>
              <Text style={styles.overdueSub}>
                Replan to redistribute workload without breaking your daily capacity.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.replanBtn}
              onPress={handleReplan}
              disabled={isReplanning}
            >
              <Text style={styles.replanBtnText}>
                {isReplanning ? "..." : "Replan"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <TouchableOpacity onPress={() => navigation.navigate("TodaysTasks")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>All caught up for today! 🎉</Text>
          </View>
        ) : (
          todayTasks.slice(0, 3).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleTask}
              onPress={() => navigation.navigate("TaskDetails", { task })}
            />
          ))
        )}

        {/* Active Goals Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Active Roadmaps</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
            <Text style={styles.seeAll}>All Goals →</Text>
          </TouchableOpacity>
        </View>

        {activeGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onPress={() => navigation.navigate("GoalDetails", { goalId: goal.id })}
          />
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
  notifBtn: {
    padding: 6,
  },
  notifIcon: {
    fontSize: 18,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
  },
  overdueBanner: {
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  overdueTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  overdueTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
  },
  overdueSub: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 2,
  },
  replanBtn: {
    backgroundColor: "#d97706",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  replanBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
});
