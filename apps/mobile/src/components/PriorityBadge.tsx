import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Priority } from "../types";

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getColors = () => {
    switch (priority) {
      case "CRITICAL":
        return { bg: "#ffe4e6", text: "#e11d48" };
      case "HIGH":
        return { bg: "#fef3c7", text: "#d97706" };
      case "MEDIUM":
        return { bg: "#e0e7ff", text: "#4f46e5" };
      default:
        return { bg: "#f1f5f9", text: "#64748b" };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{priority}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
  },
});
