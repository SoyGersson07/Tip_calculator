import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, Image } from "react-native";

import HomeScreen       from "./screens/HomeScreen";
import CalculatorScreen from "./screens/CalculatorScreen";
import DesglosScreen    from "./screens/DesglosScreen";
import HistorialScreen  from "./screens/HistorialScreen";
import AjustesScreen    from "./screens/AjustesScreen";

import { AppProvider, useApp } from "./AppContext";

import dashboard from "./assets/dashboard.png";
import setting   from "./assets/setting.png";
import history   from "./assets/history.png";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"       component={HomeScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Desglos"    component={DesglosScreen} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const { C } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.tabBarBg,
          borderTopColor:  C.tabBarBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor:   "#E2725B",
        tabBarInactiveTintColor: C.gray500,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
        tabBarIcon: ({ color }) => {
          const icons = {
            Inicio:    <Image source={dashboard} style={{ width: 24, height: 24, tintColor: color }} />,
            Historial: <Image source={history}   style={{ width: 24, height: 24, tintColor: color }} />,
            Ajustes:   <Image source={setting}   style={{ width: 24, height: 24, tintColor: color }} />,
          };
          return <Text style={{ fontSize: 22, color }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Inicio"    component={HomeStack} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      <Tab.Screen name="Ajustes"   component={AjustesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </AppProvider>
  );
}