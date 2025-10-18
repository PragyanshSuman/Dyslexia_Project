// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TracingScreen from '../screens/TracingScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import LetterMenuScreen from '../screens/LetterMenuScreen';

export type RootStackParamList = {
  Home: undefined;
  LetterMenu: undefined;           // Menu of A–Z buttons
  Tracing: { letter: string };     // Selected letter, e.g., 'A'
  ComingSoon: { title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LetterMenu" component={LetterMenuScreen} />
      <Stack.Screen name="Tracing" component={TracingScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
}
