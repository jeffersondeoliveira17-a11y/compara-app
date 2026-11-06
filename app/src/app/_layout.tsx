import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Lato_400Regular, Lato_700Bold, Lato_900Black } from '@expo-google-fonts/lato';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { cores } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [carregou, erro] = useFonts({ BebasNeue_400Regular, Lato_400Regular, Lato_700Bold, Lato_900Black });

  useEffect(() => {
    if (carregou || erro) SplashScreen.hideAsync();
  }, [carregou, erro]);

  if (!carregou && !erro) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.amarelo } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="produto/[id]" />
        <Stack.Screen name="compra/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
