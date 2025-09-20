import { Stack } from 'expo-router';
import { WaterDataProvider } from './WaterDataContext';

export default function RootLayout() {
  return (
    <WaterDataProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </WaterDataProvider>
  );
}