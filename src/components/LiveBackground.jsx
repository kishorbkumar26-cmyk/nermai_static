import { useEffect, useRef } from 'react'

export default function LiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    let mouseX = width / 2
    let mouseY = height / 2

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Particle count scaling with screen area
    const particleCount = Math.min(Math.floor((width * height) / 20000), 55)
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    // Ambient floating gold light spheres
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.15, vy: 0.1, radius: 260, color: 'rgba(212, 175, 55, 0.07)' },
      { x: width * 0.8, y: height * 0.75, vx: -0.1, vy: -0.12, radius: 320, color: 'rgba(245, 208, 97, 0.06)' },
      { x: width * 0.5, y: height * 0.5, vx: 0.08, vy: -0.15, radius: 220, color: 'rgba(184, 134, 11, 0.05)' },
    ]

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Render glowing background light orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -120 || orb.x > width + 120) orb.vx *= -1
        if (orb.y < -120 || orb.y > height + 120) orb.vy *= -1

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        gradient.addColorStop(0, orb.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Update and draw golden particles
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        p.pulsePhase += p.pulseSpeed
        const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.15

        // Gentle interactive mouse push
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140
          p.x -= (dx / dist) * force * 0.6
          p.y -= (dy / dist) * force * 0.6
        }

        // Draw individual particle with soft gold blur
        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.1, Math.min(1, currentAlpha))})`
        ctx.shadowBlur = 6
        ctx.shadowColor = 'rgba(245, 208, 97, 0.5)'
        ctx.fill()
        ctx.restore()

        // Draw delicate connecting lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const pdx = p2.x - p.x
          const pdy = p2.y - p.y
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy)
          if (pdist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.12 * (1 - pdist / 110)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75,
      }}
    />
  )
}
