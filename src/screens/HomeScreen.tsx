// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_W } = Dimensions.get('window');

const BG = require('../../assets/images/background_for_initial_home_screen.png');
const BTN1 = require('../../assets/images/button1.png'); // “A a” tracing look
const BTN2 = require('../../assets/images/button2.png'); // “B b” tracing preview
const BTN3 = require('../../assets/images/button3.png'); // matching stars preview

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.title}>Alphabet Playground</Text>

        <View style={styles.buttonsRow}>
          <HomeButton
            image={BTN1}
            label="Trace A"
            onPress={() => navigation.navigate('LetterMenu')}
          />
          <HomeButton
            image={BTN2}
            label="Trace B (Soon)"
            onPress={() => navigation.navigate('ComingSoon', { title: 'Trace B' })}
          />
          <HomeButton
            image={BTN3}
            label="Match (Soon)"
            onPress={() => navigation.navigate('ComingSoon', { title: 'Letter Match' })}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

function HomeButton({
  image,
  label,
  onPress,
}: {
  image: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.btnWrap}>
      <Image source={image} style={styles.btnImage} resizeMode="cover" />
      <Text style={styles.btnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const CARD_W = Math.min(180, SCREEN_W * 0.28);
const CARD_H = CARD_W; // square cards

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.0)', // keep scene vivid; tweak if needed
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    color: '#1F2937',
    fontSize: 28,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  btnWrap: {
    width: CARD_W,
    height: CARD_H + 34,
    alignItems: 'center',
  },
  btnImage: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#0EA5E9',
  },
  btnLabel: {
    marginTop: 8,
    color: '#0F172A',
    fontWeight: '800',
  },
});
