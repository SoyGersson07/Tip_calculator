import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import CalculatorScreen from "./screens/CalculatorScreen";
import DesglosScreen from "./screens/DesglosScreen";
import TipScreen from "./screens/TipScreen";
import HistorialScreen from "./screens/HistorialScreen";
import AjustesScreen from "./screens/AjustesScreen";

import dashboard from "./assets/dashboard.png";
import setting from "./assets/setting.png";
import history from "./assets/history.png";

import { Colors } from "./constants";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Desglos" component={DesglosScreen} />
      <Stack.Screen name="Tip" component={TipScreen} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Inicio: dashboard,
  Historial: history,
  Ajustes: setting,
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopColor: Colors.gray200,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
            paddingTop: 10,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray500,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.3,
          },
          tabBarIcon: ({ color }) => (
            <Image
              source={TAB_ICONS[route.name]}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        })}
      >
        <Tab.Screen name="Inicio" component={HomeStack} />
        <Tab.Screen name="Historial" component={HistorialScreen} />
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
