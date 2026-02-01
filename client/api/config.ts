// export const API_URL = 'http://localhost:8000';

import { Platform } from "react-native";


const getApiUrl = () => {
  if (Platform.OS === "web") {
    // Web browser can access localhost
    return "http://localhost:8000";
  }

  // For physical devices (Android/iOS)
  // return "http://192.168.3.13:3000"; 

  // return "http://192.168.1.20:8000";

  return 'http://100.129.173.98:8000';


};

const API_URL = getApiUrl();

export default API_URL;

