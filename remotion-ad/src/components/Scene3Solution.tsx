import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'

const BRAND = {
  blue: '#005EB8',
  gold: '#FFC72C',
  purple: '#6A5ACD',
}

export const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scene fade in/out
  const sceneIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const sceneOut = interpolate(frame, [88, 110], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sceneOpacity = Math.min(sceneIn, sceneOut)

  // Brand name entrance — letters feel like they're assembling
  const brandSpring = spring({ frame, fps, config: { damping: 16, stiffness: 120 } })
  const subSpring = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 15, stiffness: 130 } })
  const pill1Spring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 13, stiffness: 150 } })
  const pill2Spring = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 13, stiffness: 150 } })
  const pill3Spring = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 13, stiffness: 150 } })

  // Rotating gradient hue
  const hue = interpolate(frame, [0, 110], [0, 30])

  // Pulsing brand glow
  const glowIntensity = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.5)

  const pills = [
    { icon: '✅', text: 'You get paid immediately', spring: pill1Spring },
    { icon: '🔒', text: 'Zero credit risk', spring: pill2Spring },
    { icon: '🚀', text: 'Live in 7 days', spring: pill3Spring },
  ]

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Gradient background */}
      <AbsoluteFill style={{
        background: `linear-gradient(155deg, hsl(${215 + hue}, 80%, 28%) 0%, hsl(${260 + hue}, 60%, 20%) 50%, #0D1117 100%)`,
      }} />

      {/* Top radial glow */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 900,
        height: 900,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,94,184,${0.35 + glowIntensity * 0.15}) 0%, transparent 65%)`,
      }} />

      {/* Bottom purple glow */}
      <div style={{
        position: 'absolute',
        bottom: -200,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(106,90,205,0.4) 0%, transparent 70%)`,
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        gap: 0,
      }}>
        {/* "The solution" label */}
        <div style={{
          transform: `translateY(${interpolate(brandSpring, [0, 1], [-30, 0])}px)`,
          opacity: brandSpring,
          fontSize: 32,
          fontWeight: 600,
          color: BRAND.gold,
          letterSpacing: 5,
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Introducing
        </div>

        {/* Brand name */}
        <div style={{
          transform: `scale(${interpolate(brandSpring, [0, 1], [0.7, 1])})`,
          opacity: brandSpring,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 112,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: -4,
            textShadow: `0 0 60px rgba(255,199,44,${glowIntensity * 0.6})`,
            lineHeight: 1,
          }}>
            Oak
          </span>
          <span style={{
            fontSize: 112,
            fontWeight: 900,
            color: BRAND.gold,
            letterSpacing: -4,
            textShadow: `0 0 60px rgba(255,199,44,${glowIntensity * 0.8})`,
            lineHeight: 1,
          }}>
            stratton
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          transform: `translateY(${interpolate(subSpring, [0, 1], [40, 0])}px)`,
          opacity: subSpring,
          textAlign: 'center',
          marginBottom: 56,
        }}>
          <div style={{
            fontSize: 46,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.35,
          }}>
            We set up BNPL payment plans
          </div>
          <div style={{
            fontSize: 46,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.35,
          }}>
            for your business
          </div>
        </div>

        {/* Benefit pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
          {pills.map(({ icon, text, spring: s }) => (
            <div
              key={text}
              style={{
                transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                opacity: s,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 18,
                padding: '20px 32px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <span style={{ fontSize: 40 }}>{icon}</span>
              <span style={{ fontSize: 38, fontWeight: 600, color: '#FFFFFF' }}>{text}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
