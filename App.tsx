// App.tsx — Letter A tracing with Tiger + Bee path animation + Glitter Trail + Screen-corner Close 🐯🐝✨🍯
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Easing,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Image as SvgImage,
  Text as SvgText,
} from 'react-native-svg';

// Local assets
const BG_IMAGE = require('./assets/images/background.png');
const TIGER_WAVING = require('./assets/images/tiger-waving.png');
const TIGER_SURPRISED = require('./assets/images/tiger-surprised.png');
const TIGER_HAPPY = require('./assets/images/tiger-happy.png');
const BEE_IMAGE = require('./assets/images/bee.png');
const HONEY_IMAGE = require('./assets/images/honey.png');

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_W = Math.min(420, SCREEN_W);
const CANVAS_H = Math.round(CANVAS_W * 1.2);

const BOX_W = 360;
const BOX_H = 400;
const BOX_X = (CANVAS_W - BOX_W) / 2;
const BOX_Y = (CANVAS_H - BOX_H) / 2;

// Sample N points along a straight line
function linePoints(x1: number, y1: number, x2: number, y2: number, n = 250) {
  const pts: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    pts.push({ x, y, angle });
  }
  return pts;
}

function nearestIndex(
  pts: { x: number; y: number; angle: number }[],
  p: { x: number; y: number }
) {
  let best = 0;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < pts.length; i++) {
    const dx = pts[i].x - p.x;
    const dy = pts[i].y - p.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { index: best, dist2: bestD };
}

function useALetterGeometry() {
  const top = { x: BOX_X + BOX_W / 2, y: BOX_Y + 35 };
  const leftBottom = { x: BOX_X + 50, y: BOX_Y + BOX_H - 20 };
  const rightBottom = { x: BOX_X + BOX_W - 50, y: BOX_Y + BOX_H - 20 };
  const crossY = BOX_Y + BOX_H * 0.6;
  const crossLeft = { x: BOX_X + 95, y: crossY };
  const crossRight = { x: BOX_X + BOX_W - 95, y: crossY };

  const leftLeg = linePoints(leftBottom.x, leftBottom.y, top.x, top.y);
  const rightLeg = linePoints(top.x, top.y, rightBottom.x, rightBottom.y);
  const crossBar = linePoints(crossLeft.x, crossLeft.y, crossRight.x, crossRight.y);

  const dLeft = `M ${leftBottom.x} ${leftBottom.y} L ${top.x} ${top.y}`;
  const dRight = `M ${top.x} ${top.y} L ${rightBottom.x} ${rightBottom.y}`;
  const dCross = `M ${crossLeft.x} ${crossLeft.y} L ${crossRight.x} ${crossRight.y}`;

  return {
    segments: [
      { name: 'Left', d: dLeft, pts: leftLeg, start: leftBottom, end: top },
      { name: 'Right', d: dRight, pts: rightLeg, start: top, end: rightBottom },
      { name: 'Cross', d: dCross, pts: crossBar, start: crossLeft, end: crossRight },
    ],
  };
}

type SegmentState = 'locked' | 'active' | 'done';

export default function App() {
  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay}>
        <FloatingStars />
        <TraceLetterA />
      </View>
    </ImageBackground>
  );
}

// Floating stars
function FloatingStars() {
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * CANVAS_W,
    y: Math.random() * CANVAS_H,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <AnimatedStar key={star.id} x={star.x} y={star.y} delay={star.id * 200} />
      ))}
    </View>
  );
}

function AnimatedStar({ x, y, delay }: { x: number; y: number; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text style={[styles.star, { left: x, top: y, opacity, transform: [{ scale }] }]}>
      ⭐
    </Animated.Text>
  );
}

function TraceLetterA() {
  const { segments } = useALetterGeometry();
  const [segIndex, setSegIndex] = useState(0);
  const [states, setStates] = useState<SegmentState[]>(['active', 'locked', 'locked']);
  const [allDone, setAllDone] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showBeeAnimation, setShowBeeAnimation] = useState(false);

  const goNext = useCallback(() => {
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);

    setTimeout(() => {
      if (segIndex < segments.length - 1) {
        const next = segIndex + 1;
        setStates((s) => s.map((st, i) => (i < next ? 'done' : i === next ? 'active' : 'locked')));
        setSegIndex(next);
      } else {
        setShowBeeAnimation(true);
      }
    }, 600);
  }, [segIndex, segments.length]);

  const handleRestart = useCallback(() => {
    setSegIndex(0);
    setStates(['active', 'locked', 'locked']);
    setAllDone(false);
    setShowBeeAnimation(false);
  }, []);

  return (
    <>
      {/* Tiger outside canvas */}
      <AnimatedTigerAvatar allDone={allDone} currentSegment={segIndex} />

      {/* Full-width HUD for centered tip */}
      <AnimatedHeaderHUD currentSegment={segments[segIndex]} />

      {/* Close button pinned to screen corner (independent of CANVAS_W) */}
      <TouchableOpacity style={styles.closeBtnScreen} activeOpacity={0.7} onPress={() => {}}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <View style={styles.canvasWrap}>
        <Svg width={CANVAS_W} height={CANVAS_H}>
          <Defs>
            <LinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0F766E" stopOpacity="1" />
              <Stop offset="100%" stopColor="#14B8A6" stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="glowGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
            </RadialGradient>
            {/* Gradient for bee trail */}
            <LinearGradient id="beeTrailGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFD93D" />
              <Stop offset="100%" stopColor="#FACC15" />
            </LinearGradient>
          </Defs>

          {/* Letter A strokes */}
          <G opacity={0.85}>
            <Path d={segments[0].d} stroke="#F9FAFB" strokeWidth={34} strokeLinecap="round" />
            <Path d={segments[1].d} stroke="#F9FAFB" strokeWidth={34} strokeLinecap="round" />
            <Path d={segments[2].d} stroke="#F9FAFB" strokeWidth={30} strokeLinecap="round" />
          </G>
          <G>
            <Path d={segments[0].d} stroke="url(#pathGradient)" strokeWidth={22} strokeLinecap="round" />
            <Path d={segments[1].d} stroke="url(#pathGradient)" strokeWidth={22} strokeLinecap="round" />
            <Path d={segments[2].d} stroke="url(#pathGradient)" strokeWidth={16} strokeLinecap="round" />
          </G>

          {!showBeeAnimation && <AnimatedGuideDots segment={segments[segIndex]} visible={!allDone} />}

          {showBeeAnimation && (
            <BeeTracingAnimationSVG
              segments={segments}
              beeHref={BEE_IMAGE}
              honeyHref={HONEY_IMAGE}
              speedMsPerPoint={6}
              pauseAtEndMs={200}
              onDone={() => {
                setShowBeeAnimation(false);
                setAllDone(true);
              }}
            />
          )}
        </Svg>

        {showSparkles && <SegmentCompleteSparkles segment={segments[segIndex]} />}

        {!allDone && !showBeeAnimation ? (
          <SegmentTracer key={segIndex} segment={segments[segIndex]} onDone={goNext} />
        ) : !showBeeAnimation ? (
          <SuccessBadge onRestart={handleRestart} />
        ) : null}

        <AnimatedLegend states={states} />
        <ProgressBar progress={(segIndex + (allDone ? 1 : 0)) / segments.length} />
      </View>
    </>
  );
}

// Bee path animation inside SVG with glitter trail and persistent coverage
function BeeTracingAnimationSVG({
  segments,
  beeHref,
  honeyHref,
  speedMsPerPoint = 6,   // faster default
  pauseAtEndMs = 200,    // snappier between segments
  onDone,
}: {
  segments: {
    name: string;
    d: string;
    pts: { x: number; y: number; angle: number }[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  }[];
  beeHref: any;
  honeyHref: any;
  speedMsPerPoint?: number;
  pauseAtEndMs?: number;
  onDone?: () => void;
}) {
  const [segIdx, setSegIdx] = useState(0);
  const [ptIdx, setPtIdx] = useState(0);

  // Show honey pot at the active segment end only
  const [visibleHoney, setVisibleHoney] = useState<boolean[]>(
    Array.from({ length: segments.length }, () => false)
  );

  // Persist glitter coverage: farthest point index glittered per segment
  const [glitterCoveredIdx, setGlitterCoveredIdx] = useState<number[]>(
    segments.map(() => -1)
  );

  // On new segment: show its honey and reset live ptIdx
  useEffect(() => {
    if (segIdx < segments.length) {
      setVisibleHoney((arr) => {
        const next = arr.slice();
        next.fill(false);
        next[segIdx] = true;
        return next;
      });
      setPtIdx(0);
      setGlitterCoveredIdx((arr) => {
        const next = arr.slice();
        if (next[segIdx] < 0) next[segIdx] = 0;
        return next;
      });
    }
  }, [segIdx, segments.length]);

  // Animate bee along current segment
  useEffect(() => {
    if (segIdx >= segments.length) {
      onDone && onDone();
      return;
    }
    const pts = segments[segIdx].pts;
    if (!pts || pts.length === 0) {
      setSegIdx((s) => s + 1);
      return;
    }

    let id: any = null;
    id = setInterval(() => {
      setPtIdx((i) => {
        const nextI = Math.min(i + 1, pts.length - 1);

        // Extend glitter coverage
        setGlitterCoveredIdx((arr) => {
          const copy = arr.slice();
          copy[segIdx] = Math.max(copy[segIdx], nextI);
          return copy;
        });

        if (nextI < pts.length - 1) return nextI;

        // Reached end: hide honey and move next
        clearInterval(id);
        setVisibleHoney((arr) => {
          const next = arr.slice();
          next[segIdx] = false;
          return next;
        });
        setTimeout(() => setSegIdx((s) => s + 1), pauseAtEndMs);
        return nextI;
      });
    }, speedMsPerPoint);

    return () => id && clearInterval(id);
  }, [segIdx, segments, speedMsPerPoint, pauseAtEndMs, onDone]);

  const currentSeg = segIdx < segments.length ? segments[segIdx] : null;
  const bee =
    currentSeg && currentSeg.pts.length > 0
      ? currentSeg.pts[Math.min(ptIdx, currentSeg.pts.length - 1)]
      : null;

  // Build subpath through first N points
  const buildPathThrough = (pts: { x: number; y: number }[], toIdx: number) => {
    if (toIdx <= 0) return null;
    const clamped = Math.min(toIdx, pts.length - 1);
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1, clamped + 1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  };

  return (
    <G>
      {/* Persistent glitter on all covered segments */}
      {segments.map((seg, idx) => {
        const coveredTo = glitterCoveredIdx[idx];
        if (coveredTo <= 0) return null;
        const d = buildPathThrough(seg.pts, coveredTo);
        if (!d) return null;
        return (
          <G key={`persist-${idx}`}>
            <Path d={d} stroke="#FFD700" strokeWidth={22} strokeLinecap="round" opacity={0.38} strokeDasharray="6,14" />
            <Path d={d} stroke="url(#beeTrailGrad)" strokeWidth={10} strokeLinecap="round" opacity={0.95} strokeDasharray="12,15" />
          </G>
        );
      })}

      {/* Live glitter for current segment up to the bee */}
      {currentSeg && glitterCoveredIdx[segIdx] >= 0 && ptIdx > glitterCoveredIdx[segIdx] && (() => {
        const d = buildPathThrough(currentSeg.pts, ptIdx);
        if (!d) return null;
        return (
          <G key={`live-${segIdx}`}>
            <Path d={d} stroke="#FFD700" strokeWidth={22} strokeLinecap="round" opacity={0.45} strokeDasharray="6,14" />
            <Path d={d} stroke="url(#beeTrailGrad)" strokeWidth={10} strokeLinecap="round" opacity={0.95} strokeDasharray="12,15" />
            {currentSeg.pts
              .slice(glitterCoveredIdx[segIdx], ptIdx)
              .filter((_, i) => i % 18 === 0)
              .map((p, i) => (
                <SvgText
                  key={`sparkle-${segIdx}-${i}`}
                  x={p.x}
                  y={p.y}
                  fontSize={18}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="#FFD700"
                  opacity={0.9}
                >
                  ✨
                </SvgText>
              ))}
          </G>
        );
      })()}

      {/* Honey pot for active segment */}
      {segments.map((seg, idx) =>
        visibleHoney[idx] ? (
          <SvgImage
            key={`honey-${idx}`}
            href={honeyHref}
            x={seg.end.x - 20}
            y={seg.end.y - 20}
            width={40}
            height={40}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null
      )}

      {/* Bee */}
      {!bee && currentSeg && (
        <G transform={`translate(${currentSeg.start.x}, ${currentSeg.start.y}) rotate(0)`}>
          <SvgImage href={beeHref} width={48} height={48} x={-24} y={-24} />
        </G>
      )}
      {bee && (
        <G transform={`translate(${bee.x}, ${bee.y}) rotate(${bee.angle + 90})`}>
          <SvgImage href={beeHref} width={48} height={48} x={-24} y={-24} />
        </G>
      )}
    </G>
  );
}

// Tiger avatar
function AnimatedTigerAvatar({
  allDone,
  currentSegment,
}: {
  allDone: boolean;
  currentSegment: number;
}) {
  const bounce = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const celebrate = useRef(new Animated.Value(0)).current;

  const getTigerImage = () => {
    if (allDone) return TIGER_SURPRISED;
    if (currentSegment === 0) return TIGER_WAVING;
    return TIGER_HAPPY;
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (allDone) {
      Animated.loop(
        Animated.sequence([
          Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, friction: 3 }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }),
          Animated.delay(200),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(celebrate, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(celebrate, { toValue: -1, duration: 200, useNativeDriver: true }),
          Animated.timing(celebrate, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(300),
        ])
      ).start();
    } else {
      scale.setValue(1);
      celebrate.setValue(0);
    }
  }, [allDone]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const celebrateRotate = celebrate.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });

  return (
    <Animated.View
      style={[
        styles.tigerContainer,
        { transform: [{ translateY }, { scale }, { rotate: allDone ? celebrateRotate : '0deg' }] },
      ]}
    >
      <Image source={getTigerImage()} style={styles.tigerImage} resizeMode="contain" />
      {allDone && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Amazing! 🎉</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Progress bar
function ProgressBar({ progress }: { progress: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(width, { toValue: progress, useNativeDriver: false, friction: 8 }).start();
  }, [progress]);

  const widthInterpolate = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, { width: widthInterpolate }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

// Guide dots
function AnimatedGuideDots({ segment, visible }: { segment: any; visible: boolean }) {
  const [animations] = useState(() => Array.from({ length: 8 }, () => new Animated.Value(0)));

  useEffect(() => {
    if (visible) {
      const anims = animations.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
          ])
        )
      );
      Animated.parallel(anims).start();
    }
  }, [visible, animations]);

  if (!visible) return null;

  const count = 8;
  const step = Math.floor(segment.pts.length / (count + 1));
  const points = Array.from({ length: count }, (_, i) => segment.pts[(i + 1) * step]);

  return (
    <>
      {points.map((p: any, i: number) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r={6} fill="#CBD5E1" opacity={0.5} />
          <Circle cx={p.x} cy={p.y} r={8} fill="url(#glowGradient)" opacity={animations[i]} />
        </G>
      ))}
    </>
  );
}

// Segment complete sparkles
function SegmentCompleteSparkles({ segment }: { segment: any }) {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({ id: i, angle: (i * 30) * (Math.PI / 180) }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparkles.map((s) => (
        <Sparkle key={s.id} x={segment.end.x} y={segment.end.y} angle={s.angle} />
      ))}
    </View>
  );
}

function Sparkle({ x, y, angle }: { x: number; y: number; angle: number }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: Math.cos(angle) * 80, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: Math.sin(angle) * 80, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        { left: x - 12, top: y - 12, opacity, transform: [{ translateX }, { translateY }, { scale }] },
      ]}
    >
      ✨
    </Animated.Text>
  );
}

// Header HUD (centered tip only)
function AnimatedHeaderHUD({ currentSegment }: { currentSegment: any }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <View style={styles.hud}>
      <Animated.View style={[styles.tip, { transform: [{ translateY }] }]}>
        <Text style={styles.tipText}>✨ Trace along the glowing line ✨</Text>
      </Animated.View>
    </View>
  );
}

// Legend
function AnimatedLegend({ states }: { states: SegmentState[] }) {
  const labels = ['Left', 'Right', 'Cross'];
  const emojis = ['⬅️', '➡️', '↔️'];

  return (
    <View style={styles.legend}>
      {labels.map((label, i) => (
        <AnimatedLegendItem key={label} label={label} emoji={emojis[i]} state={states[i]} />
      ))}
    </View>
  );
}

function AnimatedLegendItem({ label, emoji, state }: { label: string; emoji: string; state: SegmentState }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'done') {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, friction: 3 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }),
      ]).start();
    }
  }, [state]);

  return (
    <Animated.View style={[styles.legendItem, { transform: [{ scale }] }]}>
      <View
        style={[
          styles.dot,
          state === 'done' ? styles.dotDone : state === 'active' ? styles.dotActive : styles.dotLocked,
        ]}
      />
      <Text style={styles.legendEmoji}>{emoji}</Text>
      <Text style={styles.legendText}>{label}</Text>
    </Animated.View>
  );
}

// Celebration
function SuccessBadge({ onRestart }: { onRestart: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const [confetti] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (CANVAS_W / 30) * i,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][i % 5],
    }))
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 20, speed: 8 }),
      Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confetti.map((c) => (
          <ConfettiPiece key={c.id} x={c.x} color={c.color} delay={c.id * 50} />
        ))}
      </View>

      <Animated.View style={[styles.success, { transform: [{ scale }] }]}>
        <Animated.Text style={[styles.successEmoji, { transform: [{ rotate: rotateInterpolate }] }]}>
          🎉
        </Animated.Text>
        <Text style={styles.successText}>Amazing! 🌟</Text>
        <Text style={styles.successSub}>You traced the letter A!</Text>
        <Text style={styles.successSub}>You're a superstar! ⭐</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={onRestart} activeOpacity={0.8}>
          <Text style={styles.restartText}>🔄 Trace Again!</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

function ConfettiPiece({ x, color, delay }: { x: number; color: string; delay: number }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, { toValue: CANVAS_H + 50, duration: 3000 + Math.random() * 1000, easing: Easing.linear, useNativeDriver: true }),
      ]),
      Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })),
      Animated.sequence([
        Animated.delay(delay + 2000),
        Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.confetti,
        { left: x, backgroundColor: color, opacity, transform: [{ translateY }, { rotate: rotateInterpolate }] },
      ]}
    />
  );
}

// Segment tracer for the child
function SegmentTracer({ segment, onDone }: { segment: any; onDone: () => void }) {
  const TOLERANCE = 35;
  const BACK_SLACK = 10;
  const puckR = 18;

  const progressIndexRef = useRef(0);
  const [offTrack, setOffTrack] = useState(false);
  const [rotation, setRotation] = useState(segment.pts[0]?.angle || 0);

  const puck = useRef(new Animated.ValueXY({ x: segment.pts[0].x, y: segment.pts[0].y })).current;
  const glow = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const setPuckToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(segment.pts.length - 1, idx));
      const pt = segment.pts[clamped];
      puck.setValue({ x: pt.x, y: pt.y });
      setRotation(pt.angle + 90);
    },
    [segment.pts, puck]
  );

  useEffect(() => {
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    glowAnim.start();
    pulseAnim.start();
    return () => {
      glowAnim.stop();
      pulseAnim.stop();
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setOffTrack(false);
          setPuckToIndex(progressIndexRef.current);
        },
        onPanResponderMove: (evt) => {
          const touchX = evt.nativeEvent.locationX;
          const touchY = evt.nativeEvent.locationY;

          const { index, dist2 } = nearestIndex(segment.pts, { x: touchX, y: touchY });
          const within = dist2 <= TOLERANCE * TOLERANCE;

          if (!within) {
            setOffTrack(true);
            return;
          }

          setOffTrack(false);

          const prev = progressIndexRef.current;
          const next = Math.max(prev - BACK_SLACK, index);
          progressIndexRef.current = Math.max(prev, next);

          setPuckToIndex(progressIndexRef.current);

          if (progressIndexRef.current >= segment.pts.length - 1) {
            setTimeout(onDone, 300);
          }
        },
        onPanResponderRelease: () => {
          if (offTrack) setPuckToIndex(progressIndexRef.current);
        },
      }),
    [segment.pts, onDone, offTrack, setPuckToIndex]
  );

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(34,197,94,0.0)', 'rgba(255,215,0,0.8)'],
  });

  const puckStyle = {
    transform: [
      { translateX: Animated.subtract(puck.x as any, puckR) },
      { translateY: Animated.subtract(puck.y as any, puckR) },
      { rotate: `${rotation}deg` },
      { scale: pulse },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" {...panResponder.panHandlers}>
      <Svg width={CANVAS_W} height={CANVAS_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="rainbowTrail" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
            <Stop offset="33%" stopColor="#FFD93D" stopOpacity="1" />
            <Stop offset="66%" stopColor="#6BCB77" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4D96FF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={
            `M ${segment.pts[0].x} ${segment.pts[0].y} ` +
            segment.pts.slice(1, progressIndexRef.current + 1).map((p: any) => `L ${p.x} ${p.y}`).join(' ')
          }
          stroke={offTrack ? '#F87171' : 'url(#rainbowTrail)'}
          strokeWidth={16}
          strokeLinecap="round"
          opacity={0.95}
        />
      </Svg>

      <Animated.View style={[styles.puck, puckStyle, offTrack && styles.puckOff]}>
        <Animated.View style={[styles.puckGlow, { backgroundColor: glowColor as any }]} />
        <Text style={styles.puckArrow}>↑</Text>
      </Animated.View>
    </View>
  );
}

const SAFE_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#87CEEB' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 28 },

  canvasWrap: { width: CANVAS_W, height: CANVAS_H, alignItems: 'center', justifyContent: 'center' },

  // Tiger
  tigerContainer: { position: 'absolute', bottom: 80, left: 30, zIndex: 1000, pointerEvents: 'none' },
  tigerImage: { width: 350, height: 350 },
  speechBubble: {
    position: 'absolute',
    top: -40,
    left: 140,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  speechText: { color: '#1F2937', fontSize: 13, fontWeight: '800' },

  // Progress
  progressBarContainer: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  progressBarBg: {
    width: 200,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  progressBarFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
  progressText: { fontSize: 13, fontWeight: '900', color: '#1F2937' },

  // HUD (center the tip across the whole screen)
  hud: {
    position: 'absolute',
    top: SAFE_TOP + 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Close button pinned to screen corner (independent of CANVAS_W)
  closeBtnScreen: {
    position: 'absolute',
    top: SAFE_TOP + 6,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10000,
  },
  closeText: { color: 'white', fontSize: 24, lineHeight: 26, marginTop: -2 },

  tip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginTop: -2, // slight lift if desired
  },
  tipText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },

  // Legend
  legend: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },// ...continuation of styles from previous message
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  dotDone: { backgroundColor: '#22C55E', shadowColor: '#22C55E', shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  dotActive: { backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  dotLocked: { backgroundColor: '#94A3B8' },
  legendEmoji: { fontSize: 14, marginRight: 4 },
  legendText: { color: '#0F172A', fontWeight: '700', fontSize: 11 },

  // Tracer puck
  puck: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  puckOff: { backgroundColor: '#EF4444', borderColor: '#DC2626', shadowColor: '#EF4444' },
  puckGlow: { position: 'absolute', top: -14, left: -14, right: -14, bottom: -14, borderRadius: 34 },
  puckArrow: {
    color: 'white',
    fontWeight: '900',
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Celebration
  success: {
    position: 'absolute',
    top: CANVAS_H / 3.5,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(34,197,94,0.98)',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  successEmoji: { fontSize: 64, marginBottom: 12 },
  successText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  successSub: { color: 'white', fontSize: 16, textAlign: 'center', marginTop: 6, opacity: 0.95, fontWeight: '700' },
  restartBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  restartText: { color: 'white', fontSize: 18, fontWeight: '800' },

  // Misc
  star: { position: 'absolute', fontSize: 20 },
  sparkle: { position: 'absolute', fontSize: 24 },
  confetti: { position: 'absolute', width: 10, height: 10, borderRadius: 2 },
});
