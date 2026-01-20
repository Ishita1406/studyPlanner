// export const API_URL = 'http://localhost:8000';

import { Platform } from "react-native";

// For Android Emulator, use:
// export const API_URL = 'http://10.0.2.2:8000';

// For Physical Device, use your computer's LAN IP:
// export const API_URL = 'http://10.51.13.187:8000';

const getApiUrl = () => {
  if (Platform.OS === "web") {
    // Web browser can access localhost
    return "http://localhost:8000";
  }

  // For physical devices (Android/iOS)
  // return "http://192.168.3.13:3000"; 

  return 'http://10.51.13.187:8000';
  // return "http://10.51.13.153:3000";


};

const API_URL = getApiUrl();

export default API_URL;

