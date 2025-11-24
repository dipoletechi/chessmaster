import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import 'react-native-reanimated';

import { SplashVideo } from '@/components/SplashVideo';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  // Check if video file exists
  let splashVideoSource;
  try {
    splashVideoSource = require('@/assets/videos/splash.mp4');
  } catch (e) {
    // Video file doesn't exist
    splashVideoSource = null;
  }

  // Hide native splash screen immediately and show video if available
  React.useEffect(() => {
    // Hide native splash immediately
    SplashScreen.hideAsync().catch(() => {});
    
    // If no video, hide splash after short delay
    if (!splashVideoSource && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show splash video if available (this will cover native splash immediately)
  if (showSplash && splashVideoSource) {
    return (
      <SplashVideo 
        videoSource={splashVideoSource}
        onFinish={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  // If no video, show app immediately
  if (showSplash && !splashVideoSource) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen 
          name="game-ai" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#fff',
            headerTitleStyle: { color: '#fff' },
            contentStyle: { paddingTop: 20 },
          }} 
        />
        <Stack.Screen 
          name="game-two-player" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#fff',
            headerTitleStyle: { color: '#fff' },
            contentStyle: { paddingTop: 20 },
          }} 
        />
        <Stack.Screen name="history" options={{ title: 'Game History', headerShown: true }} />
        <Stack.Screen name="stats" options={{ title: 'Statistics', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
