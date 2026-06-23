import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'
import { AnimatedCounter } from './AnimatedCounter'

const BRAND = {
  blue: '#005EB8',
  gold: '#FFC72C',
  purple: '#6A5ACD',
  dark: '#0D1117',
  darkMid: '#1A1F36',
}

interface StatCardProps {
  emoji: string
  value: string | React.ReactNode
  label: string
  sublabel: string
  delay: number
  accentColor: string
}

const StatCard: React.FC<StatCardProps> = ({ emoji, value, label, sublabel, delay, accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardSpring = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 140 },
  })

  const translateY = interpolate(cardSpring, [0, 1], [120, 0])
  const scale = interpolate(cardSpring, [0, 1], [0.85, 1])

  return (
    <div style={{
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: cardSpring,
      background: `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
      border: `2px solid ${accentColor}40`,
      borderRadius: 28,
      padding: '44px 40px',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      backdropFilter: 'blur(12px)',
      boxShadow: `0 8px 40px ${accentColor}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
    }}>
      {/* Left accent bar */}
      <div style={{
        width: 6,
        alignSelf: 'stretch',
        background: `linear-gradient(180deg, ${accentColor}, ${accentColor}60)`,
        borderRadius: 3,
        flexShrink: 0,
      }} />

      {/* Emoji */}
      <span style={{ fontSize: 64, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>

      {/* Text block */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: -3,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#FFFFFF',
          marginTop: 8,
          lineHeight: 1.2,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          marginTop: 4,
        }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}

export const Scene2Stats: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scene fade in/out
  const sceneIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const sceneOut = interpolate(frame, [148, 170], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sceneOpacity = Math.min(sceneIn, sceneOut)

  // Header entrance
  const headerSpring = spring({ frame, fps, config: { damping: 15, stiffness: 150 } })

  // Orb animation
  const orbPulse = 0.9 + 0.1 * Math.sin((frame / fps) * Math.PI)

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Background */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #111827 0%, #0D1117 100%)` }} />

      {/* Blue orb */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: -150,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,94,184,0.3) 0%, transparent 70%)`,
        transform: `scale(${orbPulse})`,
      }} />

      {/* Gold orb */}
      <div style={{
        position: 'absolute',
        bottom: 50,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,199,44,0.2) 0%, transparent 70%)`,
        transform: `scale(${1.1 - (orbPulse - 0.9)})`,
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 64px',
        gap: 0,
      }}>
        {/* Section header */}
        <div style={{
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-40, 0])}px)`,
          opacity: headerSpring,
          marginBottom: 52,
        }}>
          <div style={{
            fontSize: 34,
            fontWeight: 600,
            color: BRAND.gold,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Businesses using BNPL see
          </div>
          <div style={{
            fontSize: 62,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: -1.5,
            lineHeight: 1.1,
          }}>
            Real results, fast.
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <StatCard
            emoji="📈"
            value={
              <AnimatedCounter
                from={0}
                to={30}
                prefix="+"
                suffix="%"
                startFrame={15}
                durationFrames={45}
              />
            }
            label="Conversion rate"
            sublabel="More customers complete checkout"
            delay={8}
            accentColor={BRAND.blue}
          />
          <StatCard
            emoji="🛒"
            value={
              <AnimatedCounter
                from={0}
                to={40}
                prefix="+"
                suffix="%"
                startFrame={30}
                durationFrames={45}
              />
            }
            label="Average order value"
            sublabel="Customers spend more per visit"
            delay={22}
            accentColor={BRAND.purple}
          />
          <StatCard
            emoji="⚡"
            value={
              <AnimatedCounter
                from={0}
                to={7}
                suffix=" days"
                startFrame={45}
                durationFrames={30}
              />
            }
            label="To go live"
            sublabel="From sign-up to accepting payments"
            delay={36}
            accentColor={BRAND.gold}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
