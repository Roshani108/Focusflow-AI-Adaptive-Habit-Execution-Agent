import { Platform, Alert } from "react-native";

export class MobileNotificationService {
  static async requestPermissions(): Promise<boolean> {
    // In full native build, uses Notifications.requestPermissionsAsync()
    return true;
  }

  static async scheduleLocalNotification(title: string, body: string, triggerSeconds: number = 5) {
    if (Platform.OS === "web") {
      console.log(`[Local Notification] ${title}: ${body}`);
      return;
    }
    // Mobile notification dispatch simulation
    console.log(`[Native Notification Scheduled] in ${triggerSeconds}s: "${title}" - ${body}`);
  }

  static showInAppBanner(title: string, message: string) {
    Alert.alert(title, message);
  }
}
