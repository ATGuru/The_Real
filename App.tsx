import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import HomeScreen from './src/screens/HomeScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import MatrixRainScreen from './src/screens/MatrixRainScreen';
import InceptionScreen from './src/screens/InceptionScreen';
import AgentCreatorScreen from './src/screens/AgentCreatorScreen';
import MemoryViewerScreen from './src/screens/MemoryViewerScreen';
import ModelBrowserScreen from './src/screens/ModelBrowserScreen';
import ModelDetailScreen from './src/screens/ModelDetailScreen';
import MemorySettingsScreen from './src/screens/MemorySettingsScreen';
import DownloadsManagerScreen from './src/screens/DownloadsManagerScreen';
import ActiveAssistantScreen from './src/screens/ActiveAssistantScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import { Colors } from './src/theme/colors';
import { applyExitSettings, getAppSettings } from './src/memory';

export type RootStackParamList = {
  Home: undefined;
  Chatbot: undefined;
  MatrixRain: undefined;
  Inception: undefined;
  AgentCreator: undefined;
  MemoryViewer: undefined;
  ModelBrowser: undefined;
  ModelDetail: { model: { id: string; name: string; sizeGB: number; supportedAbis: string[] }; device: { totalRamGB: number; freeStorageGB: number; supportedAbis: string[] } };
  MemorySettings: undefined;
  DownloadsManager: undefined;
  ActiveAssistant: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.divider,
    notification: Colors.secondary,
  },
};

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="MatrixRain" component={MatrixRainScreen} />
      <Stack.Screen name="Inception" component={InceptionScreen} />
      <Stack.Screen name="AgentCreator" component={AgentCreatorScreen} />
      <Stack.Screen name="MemoryViewer" component={MemoryViewerScreen} />
      <Stack.Screen name="ModelBrowser" component={ModelBrowserScreen} />
      <Stack.Screen name="ModelDetail" component={ModelDetailScreen} />
      <Stack.Screen name="MemorySettings" component={MemorySettingsScreen} />
      <Stack.Screen name="DownloadsManager" component={DownloadsManagerScreen} />
      <Stack.Screen name="ActiveAssistant" component={ActiveAssistantScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
    </Stack.Navigator>
  );
}

function DrawerContent(props: any) {
  const { navigation, state } = props;
  const go = (route: keyof RootStackParamList) => () => navigation.navigate('App', { screen: route });

  const getCurrentRoute = (): string => {
    try {
      let r = state.routes[state.index];
      // Dive into nested navigator states to find active route name
      // eslint-disable-next-line no-constant-condition
      while (r?.state && (r.state as any).routes) {
        const s: any = r.state;
        r = s.routes[s.index];
      }
      return r?.name || 'Home';
    } catch {
      return 'Home';
    }
  };

  const current = getCurrentRoute();

  const Item = ({ label, route }: { label: string; route: keyof RootStackParamList }) => {
    const active = current === route;
    return (
      <DrawerItem
        label={label}
        onPress={go(route)}
        style={{
          borderLeftWidth: 3,
          borderLeftColor: active ? Colors.primary : '#7a7a7a',
          backgroundColor: Colors.background,
        }}
        labelStyle={{ color: '#FFFFFF' }}
      />
    );
  };

  return (
    <DrawerContentScrollView style={{ backgroundColor: Colors.background }}>
      <Item label="Home" route="Home" />
      <Item label="Chatbot" route="Chatbot" />
      <Item label="Matrix Rain" route="MatrixRain" />
      <Item label="Inception" route="Inception" />
      <Item label="Agent Creator" route="AgentCreator" />
      <Item label="Active Assistant" route="ActiveAssistant" />
      <Item label="Memory Viewer" route="MemoryViewer" />
      <Item label="Memory Settings" route="MemorySettings" />
      <Item label="Model Browser" route="ModelBrowser" />
      <Item label="Downloads Manager" route="DownloadsManager" />
    </DrawerContentScrollView>
  );
}

export default function App() {
  useEffect(() => {
    // Apply exit policies (e.g., clear conversations) and prep settings on start
    (async () => {
      try {
        await applyExitSettings();
        // Placeholder: theme setting could be applied here if full theming supported
        await getAppSettings();
      } catch {}
    })();
  }, []);
  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        initialRouteName="App"
        screenOptions={{
          headerShown: false,
          drawerStyle: { backgroundColor: Colors.background },
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name="App" component={MainStack} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
