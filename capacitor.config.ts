
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.57ff2c4bb47e45ddbebeea18aae741b8',
  appName: 'CourtMate',
  webDir: 'dist',
  server: {
    url: 'https://57ff2c4b-b47e-45dd-bebe-ea18aae741b8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
