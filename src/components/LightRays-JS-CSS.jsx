"use client";

import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const DEFAULT_COLOR = "#ffffff";

const containerStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
  pointerEvents: "none",
  zIndex: 3,
  overflow: "hidden",
};

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!match) {
    return [1, 1, 1];
  }

  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
};

const getAnchorAndDirection = (origin, width, height) => {
  const outside = 0.2;

  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * height], direction: [0, 1] };
    case "top-right":
      return { anchor: [width, -outside * height], direction: [0, 1] };
    case "left":
      return { anchor: [-outside * width, 0.5 * height], direction: [1, 0] };
    case "right":
      return {
        anchor: [(1 + outside) * width, 0.5 * height],
        direction: [-1, 0],
      };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * height], direction: [0, -1] };
    case "bottom-center":
      return {
        anchor: [0.5 * width, (1 + outside) * height],
        direction: [0, -1],
      };
    case "bottom-right":
      return { anchor: [width, (1 + outside) * height], direction: [0, -1] };
    default:
      return {
        anchor: [0.5 * width, -outside * height],
        direction: [0, 1],
      };
  }
};

export function LightRaysJSCSS({
  raysOrigin = "top-center",
  raysColor = DEFAULT_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  animated = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const meshRef = useRef(null);
  const drawRef = useRef(null);
  const observerRef = useRef(null);
  const animationIdRef = useRef(null);
  const cleanupRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) {
      return undefined;
    }

    cleanupRef.current?.();
    cleanupRef.current = null;

    let cancelled = false;

    const initialize = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      if (cancelled || !containerRef.current) {
        return;
      }

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
        premultipliedAlpha: false,
      });
      const { gl } = renderer;

      rendererRef.current = renderer;
      gl.clearColor(0, 0, 0, 0);
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.display = "block";

      containerRef.current.replaceChildren(gl.canvas);

      const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const fragmentShader = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayReferenceDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayReferenceDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0,
    1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 finalRayDir = rayDir;

  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1 : 0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });

      uniformsRef.current = uniforms;
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!containerRef.current) {
          return;
        }

        renderer.dpr = Math.min(window.devicePixelRatio, 2);

        const widthCss = containerRef.current.clientWidth;
        const heightCss = containerRef.current.clientHeight;
        renderer.setSize(widthCss, heightCss);

        const width = widthCss * renderer.dpr;
        const height = heightCss * renderer.dpr;
        const { anchor, direction } = getAnchorAndDirection(
          raysOrigin,
          width,
          height
        );

        uniforms.iResolution.value = [width, height];
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = direction;
      };

      const draw = (time = 0) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
          return;
        }

        uniforms.iTime.value = time * 0.001;

        if (followMouse && mouseInfluence > 0) {
          const smoothing = 0.92;

          smoothMouseRef.current.x =
            smoothMouseRef.current.x * smoothing +
            mouseRef.current.x * (1 - smoothing);
          smoothMouseRef.current.y =
            smoothMouseRef.current.y * smoothing +
            mouseRef.current.y * (1 - smoothing);

          uniforms.mousePos.value = [
            smoothMouseRef.current.x,
            smoothMouseRef.current.y,
          ];
        }

        renderer.render({ scene: mesh });
      };

      drawRef.current = draw;

      const render = (time) => {
        draw(time);
        animationIdRef.current = window.requestAnimationFrame(render);
      };

      window.addEventListener("resize", updatePlacement);
      updatePlacement();
      draw(0);

      if (animated) {
        animationIdRef.current = window.requestAnimationFrame(render);
      }

      cleanupRef.current = () => {
        if (animationIdRef.current) {
          window.cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        window.removeEventListener("resize", updatePlacement);

        try {
          const loseContext = renderer.gl.getExtension("WEBGL_lose_context");
          loseContext?.loseContext();
        } catch {}

        if (gl.canvas.parentNode) {
          gl.canvas.parentNode.removeChild(gl.canvas);
        }

        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
        drawRef.current = null;
      };
    };

    initialize();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [
    fadeDistance,
    distortion,
    followMouse,
    isVisible,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
    saturation,
    animated,
  ]);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    const renderer = rendererRef.current;
    const element = containerRef.current;

    if (!uniforms || !renderer || !element) {
      return;
    }

    uniforms.raysColor.value = hexToRgb(raysColor);
    uniforms.raysSpeed.value = raysSpeed;
    uniforms.lightSpread.value = lightSpread;
    uniforms.rayLength.value = rayLength;
    uniforms.pulsating.value = pulsating ? 1 : 0;
    uniforms.fadeDistance.value = fadeDistance;
    uniforms.saturation.value = saturation;
    uniforms.mouseInfluence.value = mouseInfluence;
    uniforms.noiseAmount.value = noiseAmount;
    uniforms.distortion.value = distortion;

    const width = element.clientWidth * renderer.dpr;
    const height = element.clientHeight * renderer.dpr;
    const { anchor, direction } = getAnchorAndDirection(
      raysOrigin,
      width,
      height
    );

    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = direction;

    if (!animated) {
      drawRef.current?.(0);
    }
  }, [
    fadeDistance,
    distortion,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
    saturation,
    animated,
  ]);

  useEffect(() => {
    if (!followMouse) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const element = containerRef.current;

      if (!element || !rendererRef.current) {
        return;
      }

      const rect = element.getBoundingClientRect();
      mouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };

      if (!animated) {
        drawRef.current?.(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [animated, followMouse]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      aria-hidden="true"
    />
  );
}

export default LightRaysJSCSS;
