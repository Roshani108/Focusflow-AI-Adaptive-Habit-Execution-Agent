import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

// Screens
import { SplashScreen } from "../screens/SplashScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { GoalsScreen } from "../screens/GoalsScreen";
import { GoalDetailsScreen } from "../screens/GoalDetailsScreen";
import { AIPlanScreen } from "../screens/AIPlanScreen";
import { TodaysTasksScreen } from "../screens/TodaysTasksScreen";
import { TaskDetailsScreen } from "../screens/TaskDetailsScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ProfileSettingsScreen } from "../screens/ProfileSettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
        tabBarIcon: ({ color }) => {
          let icon = "⚡";
          if (route.name === "Dashboard") icon = "📊";
          else if (route.name === "Goals") icon = "🎯";
          else if (route.name === "Progress") icon = "📈";
          else if (route.name === "Analytics") icon = "🔬";
          else if (route.name === "Profile") icon = "👤";
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileSettingsScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} />
        <Stack.Screen name="AIPlan" component={AIPlanScreen} />
        <Stack.Screen name="TodaysTasks" component={TodaysTasksScreen} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
