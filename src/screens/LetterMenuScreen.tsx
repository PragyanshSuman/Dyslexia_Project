// src/screens/LetterMenuScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Image,
  Text,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BG = require('../../assets/images/letters/Tracing_Menu_Background.png');

const { width: SCREEN_W } = Dimensions.get('window');

// Tweak for tablets vs phones
const isTablet = SCREEN_W > 700;
const COLS = isTablet ? 6 : 4;
const GAP = isTablet ? 16 : 12;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function letterAsset(letter: string) {
  const map: Record<string, any> = {
    A: require('../../assets/images/letters/A.png'),
    B: require('../../assets/images/letters/B.png'),
    C: require('../../assets/images/letters/C.png'),
    D: require('../../assets/images/letters/D.png'),
    E: require('../../assets/images/letters/E.png'),
    F: require('../../assets/images/letters/F.png'),
    G: require('../../assets/images/letters/G.png'),
    H: require('../../assets/images/letters/H.png'),
    I: require('../../assets/images/letters/I.png'),
    J: require('../../assets/images/letters/J.png'),
    K: require('../../assets/images/letters/K.png'),
    L: require('../../assets/images/letters/L.png'),
    M: require('../../assets/images/letters/M.png'),
    N: require('../../assets/images/letters/N.png'),
    O: require('../../assets/images/letters/O.png'),
    P: require('../../assets/images/letters/P.png'),
    Q: require('../../assets/images/letters/Q.png'),
    R: require('../../assets/images/letters/R.png'),
    S: require('../../assets/images/letters/S.png'),
    T: require('../../assets/images/letters/T.png'),
    U: require('../../assets/images/letters/U.png'),
    V: require('../../assets/images/letters/V.png'),
    W: require('../../assets/images/letters/W.png'),
    X: require('../../assets/images/letters/X.png'),
    Y: require('../../assets/images/letters/Y.png'),
    Z: require('../../assets/images/letters/Z.png'),
  };
  return map[letter];
}

export default function LetterMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Card width derived from screen, columns and gaps
  const CARD_W = useMemo(
    () => Math.floor((SCREEN_W - GAP * (COLS + 1)) / COLS),
    []
  );
  const CARD_H = CARD_W; // square

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Letter</Text>
      </View>

      <FlatList
        contentContainerStyle={[
          styles.grid,
          { paddingHorizontal: GAP, gap: GAP, paddingBottom: 28 },
        ]}
        data={LETTERS}
        keyExtractor={(item) => item}
        numColumns={COLS}
        renderItem={({ item }) => (
          <LiftedCard
            width={CARD_W}
            height={CARD_H}
            onPress={() => navigation.navigate('Tracing', { letter: item })}
            source={letterAsset(item)}
          />
        )}
      />
    </ImageBackground>
  );
}

// A reusable lifted card with transparent background, dual shadows and press scale
function LiftedCard({
  width,
  height,
  source,
  onPress,
}: {
  width: number;
  height: number;
  source: any;
  onPress: () => void;
}) {
  const scale = useState(new Animated.Value(1))[0];

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <TouchableWithoutFeedback onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View
        style={[
          styles.cardWrap,
          {
            width,
            height,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Outer soft shadow */}
        <View style={styles.shadowA} />
        {/* Inner tighter shadow + content */}
        <View style={styles.cardInner}>
          <Image source={source} style={styles.image} resizeMode="contain" />
          {/* Top subtle gloss for depth */}
          <View pointerEvents="none" style={styles.gloss} />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: '900',
    color: '#0F172A',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  grid: {
    justifyContent: 'center',
    marginTop: 10,
  },

  // Container that allows both shadow layers to breathe
  cardWrap: {
    borderRadius: 22,
  },

  // Outer soft shadow (ambient)
  shadowA: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
    borderRadius: 22,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: 0,
  },

  // Inner content with a tighter drop shadow; transparent background
  cardInner: {
    borderRadius: 22,
    overflow: 'visible',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
    flex: 1,
  },

  image: {
    width: '96%',
    height: '96%',
    borderRadius: 20, // safe if PNG canvas is square; remove if your PNG has its own rounded mask
  },

  gloss: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    height: '40%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
