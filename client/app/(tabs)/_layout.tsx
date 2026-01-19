import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: '#fff',
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#9D96E1',
                tabBarInactiveTintColor: '#A0A0C0',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: "Today",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    tabBarLabel: "Calendar",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="feedback"
                options={{
                    tabBarLabel: "Feedback",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="zap" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="setup"
                options={{
                    tabBarLabel: "Setup",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="tool" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
