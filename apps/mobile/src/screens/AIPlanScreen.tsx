import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { mobileApi } from "../api/client";
import { Header } from "../components/Header";

export const AIPlanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [goal, setGoal] = useState("Prepare for Full Stack Interview in 6 Weeks");
  const [days, setDays] = useState("30");
  const [dailyHours, setDailyHours] = useState("2.0");
  const [category, setCategory] = useState("Career");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [planResult, setPlanResult] = useState<any | null>(null);
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      Alert.alert("Required", "Please specify a goal description.");
      return;
    }
    setIsGenerating(true);
    try {
      // 1. Create base goal
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Number(days));

      const goalRes = await mobileApi.post("/goals", {
        title: goal,
        category,
        deadline: deadline.toISOString(),
        target_hours: Number(days) * Number(dailyHours) * 0.8,
        preferred_days: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
      });
      const gId = goalRes.data.data.id;
      setCreatedGoalId(gId);

      // 2. Generate plan
      const planRes = await mobileApi.post(`/goals/${gId}/generate-plan`, {
        goal,
        deadline_days: Number(days),
        daily_available_hours: Number(dailyHours),
        current_skill: "Intermediate",
      });
      setPlanResult(planRes.data.data);
    } catch (e: any) {
      Alert.alert("Generation Failed", "Could not generate AI roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!createdGoalId || !planResult) return;
    setIsApproving(true);
    try {
      await mobileApi.post(`/goals/${createdGoalId}/approve-plan`, {
        goal_id: createdGoalId,
        plan_id: planResult.plan_id,
        modified_plan: planResult.structured_plan,
      });
      Alert.alert("Success!", "Roadmap approved and added to your schedule.");
      navigation.navigate("GoalDetails", { goalId: createdGoalId });
    } catch (e: any) {
      Alert.alert("Approval Error", "Failed to finalize roadmap.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="AI Goal Wizard" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {!planResult ? (
          <View style={styles.form}>
            <Text style={styles.instruction}>
              Enter your ambition and available capacity. FocusFlow AI will synthesize sequential milestones and calibrated tasks.
            </Text>

            <Text style={styles.label}>WHAT IS YOUR GOAL?</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. Master React and FastAPI in 4 weeks"
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>DEADLINE (DAYS)</Text>
                <TextInput
                  style={styles.input}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>HOURS / DAY</Text>
                <TextInput
                  style={styles.input}
                  value={dailyHours}
                  onChangeText={setDailyHours}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.generateBtnText}>Synthesize Roadmap ⚡</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.preview}>
            <View style={styles.banner}>
              <Text style={styles.bannerBadge}>
                Feasibility: {planResult.structured_plan?.feasibility_score}%
              </Text>
              <Text style={styles.bannerTitle}>{planResult.structured_plan?.goal_title}</Text>
              <Text style={styles.bannerMeta}>
                {planResult.structured_plan?.duration_weeks} Weeks • ~{planResult.structured_plan?.total_estimated_hours} Hours
              </Text>
            </View>

            <Text style={styles.previewHeader}>Milestones Preview</Text>

            {planResult.structured_plan?.milestones?.map((m: any, idx: number) => (
              <View key={idx} style={styles.milestoneCard}>
                <Text style={styles.mTitle}>
                  {idx + 1}. {m.title}
                </Text>
                <Text style={styles.mTasks}>{m.tasks?.length} actionable tasks</Text>
              </View>
            ))}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setPlanResult(null)}
              >
                <Text style={styles.secondaryBtnText}>Edit Params</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveBtn}
                onPress={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.approveBtnText}>Approve Plan ✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    padding: 20,
  },
  instruction: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 20,
  },
  form: {},
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  generateBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  generateBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  preview: {},
  banner: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  bannerBadge: {
    color: "#e0e7ff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  bannerMeta: {
    color: "#c7d2fe",
    fontSize: 11,
    marginTop: 4,
  },
  previewHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  milestoneCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  mTasks: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#475569",
    fontWeight: "700",
  },
  approveBtn: {
    flex: 2,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  approveBtnText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
