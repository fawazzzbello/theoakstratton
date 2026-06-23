import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'

const BRAND = {
  blue: '#005EB8',
  gold: '#FFC72C',
  purple: '#6A5ACD',
  dark: '#0D1117',
  darkMid: '#1A1F36',
}

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance springs
  const line1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 160 } })
  const line2Spring = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 160 } })
  const subSpring = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 16, stiffness: 140 } })
  const emojiSpring = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 10, stiffness: 200 } })

  // Gold underline reveal
  const underlineWidth = interpolate(Math.max(0, frame - 35), [0, 30], [0, 100], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })

  // Scene fade-out
  const sceneOpacity = interpolate(frame, [90, 110], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Animated orbs
  const orb1Y = interpolate(frame, [0, 110], [0, -40])
  const orb2Y = interpolate(frame, [0, 110], [0, 30])

  // Question mark pulse
  const qmarkScale = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2)

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Background */}
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${BRAND.darkMid} 0%, ${BRAND.dark} 60%, #110d20 100%)` }} />

      {/* Orb 1 — blue top right */}
      <div style={{
        position: 'absolute',
        top: -240,
        right: -180,
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,94,184,0.45) 0%, transparent 70%)`,
        transform: `translateY(${orb1Y}px)`,
        filter: 'blur(4px)',
      }} />

      {/* Orb 2 — purple bottom left */}
      <div style={{
        position: 'absolute',
        bottom: -300,
        left: -200,
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(106,90,205,0.35) 0%, transparent 65%)`,
        transform: `translateY(${orb2Y}px)`,
        filter: 'blur(4px)',
      }} />

      {/* Thin top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple}, ${BRAND.gold})`,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        gap: 0,
      }}>
        {/* Line 1 */}
        <div style={{
          transform: `translateY(${interpolate(line1Spring, [0, 1], [80, 0])}px)`,
          opacity: line1Spring,
          fontSize: 92,
          fontWeight: 900,
          color: '#FFFFFF',
          lineHeight: 1.1,
          textAlign: 'center',
          letterSpacing: -2,
        }}>
          Still not offering
        </div>

        {/* Line 2 — gold with animated underline */}
        <div style={{
          transform: `translateY(${interpolate(line2Spring, [0, 1], [80, 0])}px)`,
          opacity: line2Spring,
          position: 'relative',
          display: 'inline-block',
          marginTop: 8,
        }}>
          <span style={{
            fontSize: 92,
            fontWeight: 900,
            color: BRAND.gold,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}>
            payment plans
          </span>
          <span style={{
            fontSize: 92,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            transform: `scale(${qmarkScale})`,
            display: 'inline-block',
          }}>?</span>

          {/* Underline */}
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            height: 7,
            width: `${underlineWidth}%`,
            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple})`,
            borderRadius: 4,
          }} />
        </div>

        {/* Subtitle */}
        <div style={{
          marginTop: 72,
          transform: `translateY(${interpolate(subSpring, [0, 1], [50, 0])}px)`,
          opacity: subSpring,
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 52,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.45,
          }}>
            You're leaving sales on the table
          </span>
        </div>

        {/* Emoji */}
        <div style={{
          marginTop: 32,
          transform: `scale(${interpolate(emojiSpring, [0, 1], [0.3, 1])}) translateY(${interpolate(emojiSpring, [0, 1], [30, 0])}px)`,
          opacity: emojiSpring,
          fontSize: 80,
        }}>
          💸
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
