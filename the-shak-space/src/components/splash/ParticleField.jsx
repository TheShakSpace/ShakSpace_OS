import React, { useEffect, useRef } from "react";

export default function ParticleField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, hover: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.tx = e.clientX - width / 2;
      mouseRef.current.ty = e.clientY - height / 2;
      mouseRef.current.hover = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.hover = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const particleCount = 450;
    const particles = [];

    const colors = [
      "rgba(79, 140, 255, ",
      "rgba(128, 90, 213, ",
      "rgba(147, 197, 253, ",
      "rgba(255, 255, 255, ",
    ];

    const fov = 400;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 100 + Math.random() * 800;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = (Math.random() - 0.5) * 1600;

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        size: Math.random() * 1.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        speedZ: -0.2 - Math.random() * 0.6,
        brightness: Math.random(),
      });
    }

    let cameraAngleX = 0;
    let cameraAngleY = 0;

    const render = () => {
      ctx.fillStyle = "#0F1115";
      ctx.fillRect(0, 0, width, height);

      const radialGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );

      radialGlow.addColorStop(0, "rgba(20, 25, 45, 0.45)");
      radialGlow.addColorStop(0.5, "rgba(15, 17, 21, 0.95)");
      radialGlow.addColorStop(1, "#0F1115");

      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      mouseRef.current.x +=
        (mouseRef.current.tx - mouseRef.current.x) * 0.05;
      mouseRef.current.y +=
        (mouseRef.current.ty - mouseRef.current.y) * 0.05;

      cameraAngleY = (mouseRef.current.x / width) * 0.35;
      cameraAngleX = (mouseRef.current.y / height) * 0.35;

      const cosY = Math.cos(cameraAngleY);
      const sinY = Math.sin(cameraAngleY);
      const cosX = Math.cos(cameraAngleX);
      const sinX = Math.sin(cameraAngleX);

      const computedParticles = particles.map((p) => {
        p.z += p.speedZ;
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.z < -fov) {
          p.z = 1000;
        }

        let rx = p.x;
        let ry = p.y;
        let rz = p.z;

        let x1 = rx * cosY - rz * sinY;
        let z1 = rx * sinY + rz * cosY;

        let y2 = ry * cosX - z1 * sinX;
        let z2 = ry * sinX + z1 * cosX;

        const perspective = fov / (fov + z2);

        return {
          px: x1 * perspective + width / 2,
          py: y2 * perspective + height / 2,
          size: p.size * perspective * 2.2,
          z: z2,
          color: p.color,
          brightness: p.brightness,
          original: p,
        };
      });

      computedParticles.sort((a, b) => b.z - a.z);

      ctx.lineWidth = 0.55;

      for (let i = 0; i < computedParticles.length; i++) {
        const p1 = computedParticles[i];

        if (
          p1.z > 600 ||
          p1.px < 0 ||
          p1.px > width ||
          p1.py < 0 ||
          p1.py > height
        )
          continue;

        let connections = 0;

        for (let j = i + 1; j < computedParticles.length; j++) {
          if (connections >= 2) break;

          const p2 = computedParticles[j];

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            const alpha =
              (1 - dist / 105) * 0.18 * (1 - p1.z / 1000);

            ctx.strokeStyle = `rgba(79, 140, 255, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();

            connections++;
          }
        }
      }

      computedParticles.forEach((p) => {
        if (
          p.px < -20 ||
          p.px > width + 20 ||
          p.py < -20 ||
          p.py > height + 20
        )
          return;

        const alpha =
          Math.max(0.1, Math.min(1.0, 1 - p.z / 1200)) *
          p.brightness;

        ctx.beginPath();

        if (p.size > 2.5) {
          const radial = ctx.createRadialGradient(
            p.px,
            p.py,
            0,
            p.px,
            p.py,
            p.size * 2
          );

          radial.addColorStop(0, p.color + alpha + ")");
          radial.addColorStop(0.4, p.color + alpha * 0.3 + ")");
          radial.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = radial;
          ctx.arc(p.px, p.py, p.size * 2, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = p.color + alpha + ")";
          ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        }

        ctx.fill();
      });

      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(160, 166, 177, 0.15)";
      ctx.fillText(
        `CAM_COORD: x${cameraAngleY.toFixed(4)} y${cameraAngleX.toFixed(
          4
        )} z${fov}`,
        24,
        height - 24
      );

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full pointer-events-none z-0"
    />
  );
}