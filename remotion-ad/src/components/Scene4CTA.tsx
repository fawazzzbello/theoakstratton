import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'

const BRAND = {
  blue: '#005EB8',
  gold: '#FFC72C',
  purple: '#6A5ACD',
}

export const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scene fade in
  const sceneIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })

  // Entrance springs
  const priceSpring = spring({ frame, fps, config: { damping: 12, stiffness: 150 } })
  const subSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 140 } })
  const ctaSpring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 14, stiffness: 160 } })
  const linkSpring = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 13, stiffness: 140 } })

  // Pulsing CTA button
  const buttonScale = 1 + 0.025 * Math.sin((frame / fps) * Math.PI * 2.5)
  const buttonGlow = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.5)

  // Floating arrow
  const arrowY = -6 * Math.sin((frame / fps) * Math.PI * 1.8)

  // Confetti-like particles using simple circles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    const radius = interpolate(frame, [0, 90], [0, 280])
    const particleOpacity = interpolate(frame, [20, 50, 90], [0, 0.6, 0])
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      opacity: particleOpacity,
      size: 8 + (i % 3) * 4,
      color: i % 3 === 0 ? BRAND.gold : i % 3 === 1 ? BRAND.blue : BRAND.purple,
    }
  })

  return (
    <AbsoluteFill style={{ opacity: sceneIn }}>
      {/* Background */}
      <AbsoluteFill style={{
        background: `linear-gradient(160deg, #0a0f1e 0%, #111827 50%, #0d1117 100%)`,
      }} />

      {/* Gold top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.blue}, ${BRAND.purple})`,
      }} />

      {/* Blue center glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0,94,184,0.2) 0%, transparent 70%)`,
      }} />

      {/* Particle burst */}
      <div style={{ position: 'absolute', top: '28%', left: '50%' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        gap: 0,
      }}>
        {/* Price reveal */}
        <div style={{
          transform: `scale(${interpolate(priceSpring, [0, 1], [0.6, 1])}) translateY(${interpolate(priceSpring, [0, 1], [60, 0])}px)`,
          opacity: priceSpring,
          textAlign: 'center',
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 40,
            fontWeight: 600,
            color: BRAND.gold,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Starting from
          </div>
          <div style={{
            fontSize: 130,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: -5,
            lineHeight: 1,
            textShadow: `0 0 80px rgba(0,94,184,0.6)`,
          }}>
            £599
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 8,
          }}>
            one-time setup fee
          </div>
        </div>

        {/* Separator line */}
        <div style={{
          width: interpolate(subSpring, [0, 1], [0, 200]),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${BRAND.gold}, transparent)`,
          margin: '36px auto',
          opacity: subSpring,
        }} />

        {/* Benefit bullets */}
        <div style={{
          transform: `translateY(${interpolate(subSpring, [0, 1], [40, 0])}px)`,
          opacity: subSpring,
          textAlign: 'center',
          marginBottom: 52,
        }}>
          {[
            '💰 You get paid immediately',
            '🛡️ Zero risk to your business',
            '⚡ Live in as little as 7 days',
          ].map((line, i) => (
            <div key={i} style={{
              fontSize: 42,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.6,
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{
          transform: `scale(${interpolate(ctaSpring, [0, 1], [0.7, 1]) * buttonScale})`,
          opacity: ctaSpring,
          marginBottom: 40,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.gold} 0%, #ffb000 100%)`,
            borderRadius: 20,
            padding: '28px 80px',
            boxShadow: `0 0 ${40 + buttonGlow * 20}px rgba(255,199,44,${0.4 + buttonGlow * 0.2}), 0 8px 32px rgba(0,0,0,0.4)`,
          }}>
            <span style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#0D1117',
              letterSpacing: -1,
            }}>
              Get Started Today
            </span>
          </div>
        </div>

        {/* Link in bio */}
        <div style={{
          transform: `translateY(${interpolate(linkSpring, [0, 1], [30, arrowY])}px)`,
          opacity: linkSpring,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 52,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
          }}>
            ⬆ Link in bio
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            marginTop: 8,
          }}>
            oakstratton.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
