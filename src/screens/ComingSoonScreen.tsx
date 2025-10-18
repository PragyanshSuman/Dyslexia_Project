// src/screens/ComingSoonScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { RouteProp } from '@react-navigation/native';

const BG = require('../../assets/images/background_for_initial_home_screen.png');

export default function ComingSoonScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ComingSoon'>>();
  const title = route.params?.title ?? 'Feature';

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>This feature is coming soon!</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
  },
  btnText: { color: 'white', fontWeight: '900' },
});
