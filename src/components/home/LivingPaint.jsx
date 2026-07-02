"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { hexToRgb01 } from "@/lib/paint-palettes";

const STORAGE_KEY = "beyondframes-theme";
const THEME_CHANGE_EVENT = "beyondframes-theme-change";
const LIGHT_PAINT_SCALE = 0.62;
const DARK_PAINT_SCALE = 0.44;

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ||
    window.localStorage.getItem(STORAGE_KEY) === "dark"
    ? "dark"
    : "light";
}

function subscribeThemeChange(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

// Täisekraani vedeliksimulatsioon — "elav värv". Kohandatud SplashCursori
// baasilt: värvid tulevad aktiivse kunstniku paletist, kursor segab värvi
// nagu pintsel ja taust hingab ise. frameRef on valikuline (kui antud,
// immitseb värv raami servadest).
export default function LivingPaint({
  palette,
  frameRef = null,
  burstKey = 0,
  intensity = 1,
}) {
  const canvasRef = useRef(null);
  const paletteRef = useRef(palette);
  const burstRef = useRef(null);
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    () => "light",
  );
  const colorScale =
    (theme === "light" ? LIGHT_PAINT_SCALE : DARK_PAINT_SCALE) * intensity;
  const colorScaleRef = useRef(colorScale);

  useEffect(() => {
    paletteRef.current =
      Array.isArray(palette) && palette.length ? palette : ["#b8763a"];
  }, [palette]);

  useEffect(() => {
    colorScaleRef.current = colorScale;
  }, [colorScale]);

  useEffect(() => {
    if (burstKey > 0 && burstRef.current) {
      burstRef.current();
    }
  }, [burstKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 760;

    let raf = 0;
    let lastUpdateTime = Date.now();
    let running = true;
    let emitAccumulator = 0;
    let ambientAccumulator = 0;
    let emitIndex = 0;
    let strokeColorTimer = 0;

    function pointerPrototype() {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = { r: 0.2, g: 0.15, b: 0.1 };
    }

    const config = {
      SIM_RESOLUTION: coarse ? 96 : 132,
      DYE_RESOLUTION: coarse ? 512 : 1024,
      DENSITY_DISSIPATION: 0.16,
      VELOCITY_DISSIPATION: 0.55,
      PRESSURE: 0.12,
      PRESSURE_ITERATIONS: 20,
      CURL: 9,
      SPLAT_RADIUS: 0.0062,
      SPLAT_FORCE: 5200,
      SHADING: true,
      TRANSPARENT: true,
    };

    const pointers = [new pointerPrototype()];
    const { gl, ext } = getWebGLContext(canvas);
    if (!gl) return undefined;

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    function getWebGLContext(target) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      };
      let context = target.getContext("webgl2", params);
      const isWebGL2 = !!context;
      if (!isWebGL2) {
        context =
          target.getContext("webgl", params) ||
          target.getContext("experimental-webgl", params);
      }
      if (!context) return { gl: null, ext: {} };
      let halfFloat;
      let supportLinearFiltering;
      if (isWebGL2) {
        context.getExtension("EXT_color_buffer_float");
        supportLinearFiltering = context.getExtension(
          "OES_texture_float_linear",
        );
      } else {
        halfFloat = context.getExtension("OES_texture_half_float");
        supportLinearFiltering = context.getExtension(
          "OES_texture_half_float_linear",
        );
      }
      context.clearColor(0, 0, 0, 0);
      const halfFloatTexType = isWebGL2
        ? context.HALF_FLOAT
        : halfFloat && halfFloat.HALF_FLOAT_OES;
      let formatRGBA;
      let formatRG;
      let formatR;
      if (isWebGL2) {
        formatRGBA = getSupportedFormat(
          context,
          context.RGBA16F,
          context.RGBA,
          halfFloatTexType,
        );
        formatRG = getSupportedFormat(
          context,
          context.RG16F,
          context.RG,
          halfFloatTexType,
        );
        formatR = getSupportedFormat(
          context,
          context.R16F,
          context.RED,
          halfFloatTexType,
        );
      } else {
        formatRGBA = getSupportedFormat(
          context,
          context.RGBA,
          context.RGBA,
          halfFloatTexType,
        );
        formatRG = getSupportedFormat(
          context,
          context.RGBA,
          context.RGBA,
          halfFloatTexType,
        );
        formatR = getSupportedFormat(
          context,
          context.RGBA,
          context.RGBA,
          halfFloatTexType,
        );
      }
      return {
        gl: context,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering,
        },
      };
    }

    function getSupportedFormat(context, internalFormat, format, type) {
      if (!supportRenderTextureFormat(context, internalFormat, format, type)) {
        switch (internalFormat) {
          case context.R16F:
            return getSupportedFormat(context, context.RG16F, context.RG, type);
          case context.RG16F:
            return getSupportedFormat(
              context,
              context.RGBA16F,
              context.RGBA,
              type,
            );
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    function supportRenderTextureFormat(context, internalFormat, format, type) {
      const texture = context.createTexture();
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.NEAREST,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MAG_FILTER,
        context.NEAREST,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_S,
        context.CLAMP_TO_EDGE,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_T,
        context.CLAMP_TO_EDGE,
      );
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null,
      );
      const fbo = context.createFramebuffer();
      context.bindFramebuffer(context.FRAMEBUFFER, fbo);
      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        context.COLOR_ATTACHMENT0,
        context.TEXTURE_2D,
        texture,
        0,
      );
      const status = context.checkFramebufferStatus(context.FRAMEBUFFER);
      context.deleteFramebuffer(fbo);
      context.deleteTexture(texture);
      return status === context.FRAMEBUFFER_COMPLETE;
    }

    class Material {
      constructor(vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
      }
      setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < (keywords?.length || 0); i++) {
          hash += hashCode(keywords[i]);
        }
        let program = this.programs[hash];
        if (program == null) {
          const fragmentShader = compileShader(
            gl.FRAGMENT_SHADER,
            this.fragmentShaderSource,
            keywords,
          );
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        if (program === this.activeProgram) return;
        this.uniforms = getUniforms(program);
        this.activeProgram = program;
      }
      bind() {
        gl.useProgram(this.activeProgram);
      }
    }

    class Program {
      constructor(vertexShader, fragmentShader) {
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        gl.useProgram(this.program);
      }
    }

    function createProgram(vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      return program;
    }

    function getUniforms(program) {
      const uniforms = [];
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return uniforms;
    }

    function compileShader(type, source, keywords) {
      const finalSource = addKeywords(source, keywords);
      const shader = gl.createShader(type);
      gl.shaderSource(shader, finalSource);
      gl.compileShader(shader);
      return shader;
    }

    function addKeywords(source, keywords) {
      if (!keywords || !keywords.length) return source;
      let prefix = "";
      for (const keyword of keywords) prefix += `#define ${keyword}\n`;
      return prefix + source;
    }

    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `,
    );

    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main(){ gl_FragColor = texture2D(uTexture, vUv); }
    `,
    );

    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }
    `,
    );

    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main(){
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;
          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);
          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);
          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          c *= diffuse;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `;

    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main(){
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `,
    );

    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize){
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main(){
        #ifdef MANUAL_FILTERING
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `,
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"],
    );

    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `,
    );

    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `,
    );

    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main(){
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    );

    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main(){
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `,
    );

    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    );

    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    let dye;
    let velocity;
    let divergence;
    let curl;
    let pressure;

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(
      baseVertexShader,
      gradientSubtractShader,
    );
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    function getResolution(resolution) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      if (!dye) {
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering,
        );
      } else {
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering,
        );
      }
      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      }
      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST,
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST,
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST,
      );
    }

    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        w,
        h,
        0,
        format,
        type,
        null,
      );
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(v) {
          fbo1 = v;
        },
        get write() {
          return fbo2;
        },
        set write(v) {
          fbo2 = v;
        },
        swap() {
          const t = fbo1;
          fbo1 = fbo2;
          fbo2 = t;
        },
      };
    }

    function resizeFBO(target, w, h, internalFormat, format, type, param) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(
        target.read,
        w,
        h,
        internalFormat,
        format,
        type,
        param,
      );
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function updateKeywords() {
      const displayKeywords = [];
      if (config.SHADING) displayKeywords.push("SHADING");
      displayMaterial.setKeywords(displayKeywords);
    }

    updateKeywords();
    initFramebuffers();

    function calcDeltaTime() {
      const now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = now;
      return dt;
    }

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(canvas.clientWidth * pixelRatio);
      const height = Math.floor(canvas.clientHeight * pixelRatio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    function paletteColor(strength = 1, jitter = 0.18) {
      const colors = paletteRef.current;
      const hex = colors[emitIndex % colors.length];
      emitIndex += 1;
      const rgb = hexToRgb01(hex);
      const scale =
        colorScaleRef.current *
        strength *
        (1 - jitter + Math.random() * jitter * 2);
      return { r: rgb.r * scale, g: rgb.g * scale, b: rgb.b * scale };
    }

    function applyInputs() {
      pointers.forEach((pointer) => {
        if (pointer.moved) {
          pointer.moved = false;
          splatPointer(pointer);
        }
      });
    }

    function step(dt) {
      gl.disable(gl.BLEND);
      curlProgram.bind();
      gl.uniform2f(
        curlProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);
      vorticityProgram.bind();
      gl.uniform2f(
        vorticityProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();
      divergenceProgram.bind();
      gl.uniform2f(
        divergenceProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();
      pressureProgram.bind();
      gl.uniform2f(
        pressureProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }
      gradienSubtractProgram.bind();
      gl.uniform2f(
        gradienSubtractProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl.uniform1i(
        gradienSubtractProgram.uniforms.uPressure,
        pressure.read.attach(0),
      );
      gl.uniform1i(
        gradienSubtractProgram.uniforms.uVelocity,
        velocity.read.attach(1),
      );
      blit(velocity.write);
      velocity.swap();
      advectionProgram.bind();
      gl.uniform2f(
        advectionProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      const velocityId = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(
        advectionProgram.uniforms.dissipation,
        config.VELOCITY_DISSIPATION,
      );
      blit(velocity.write);
      velocity.swap();
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          dye.texelSizeX,
          dye.texelSizeY,
        );
      }
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(
        advectionProgram.uniforms.dissipation,
        config.DENSITY_DISSIPATION,
      );
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      displayMaterial.bind();
      if (config.SHADING) {
        gl.uniform2f(
          displayMaterial.uniforms.texelSize,
          1 / gl.drawingBufferWidth,
          1 / gl.drawingBufferHeight,
        );
      }
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    function splatPointer(pointer) {
      const dx = pointer.deltaX * config.SPLAT_FORCE;
      const dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function splat(x, y, dx, dy, color, radiusScale = 1) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(
        splatProgram.uniforms.aspectRatio,
        canvas.width / canvas.height,
      );
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      gl.uniform1f(
        splatProgram.uniforms.radius,
        correctRadius((config.SPLAT_RADIUS * radiusScale) / 100),
      );
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function correctRadius(radius) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) return radius * aspectRatio;
      return radius;
    }

    // --- raami emitterid: värv immitseb raami servadest välja -----------

    function framePerimeterPoint(t, rect) {
      const w = rect.width;
      const h = rect.height;
      const perimeter = 2 * (w + h);
      let d = t * perimeter;
      if (d < w) {
        return { x: rect.left + d, y: rect.top, nx: 0, ny: -1 };
      }
      d -= w;
      if (d < h) {
        return { x: rect.right, y: rect.top + d, nx: 1, ny: 0 };
      }
      d -= h;
      if (d < w) {
        return { x: rect.right - d, y: rect.bottom, nx: 0, ny: 1 };
      }
      d -= w;
      return { x: rect.left, y: rect.top + d, nx: -1, ny: 0 };
    }

    function toTexcoords(screenX, screenY) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      return {
        x: (screenX * pixelRatio) / canvas.width,
        y: 1 - (screenY * pixelRatio) / canvas.height,
      };
    }

    function emitFromFrame(dt) {
      const frameEl = frameRef?.current;
      if (!frameEl) return;
      emitAccumulator += dt;
      const interval = 0.055;
      if (emitAccumulator < interval) return;
      const rect = frameEl.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        emitAccumulator = 0;
        return;
      }
      while (emitAccumulator >= interval) {
        emitAccumulator -= interval;
        const point = framePerimeterPoint(Math.random(), rect);
        const tex = toTexcoords(point.x, point.y);
        const strong = Math.random() < 0.06;
        const force = strong ? 1500 : 320 + Math.random() * 420;
        const tangentJitter = (Math.random() - 0.5) * 260;
        const dx = point.nx * force + -point.ny * tangentJitter;
        const dy = -point.ny * force + -point.nx * tangentJitter;
        splat(
          tex.x,
          tex.y,
          dx,
          dy,
          paletteColor(strong ? 1.15 : 0.62),
          strong ? 1.6 : 0.75 + Math.random() * 0.5,
        );
      }
    }

    function emitAmbient(dt) {
      ambientAccumulator += dt;
      if (ambientAccumulator < 2.6) return;
      ambientAccumulator = 0;
      const x = 0.12 + Math.random() * 0.76;
      const y = 0.12 + Math.random() * 0.76;
      const angle = Math.random() * Math.PI * 2;
      const force = 160 + Math.random() * 180;
      splat(
        x,
        y,
        Math.cos(angle) * force,
        Math.sin(angle) * force,
        paletteColor(0.34),
        2.4,
      );
    }

    function burst() {
      const frameEl = frameRef?.current;
      if (!frameEl) return;
      const rect = frameEl.getBoundingClientRect();
      if (!rect.width) return;
      const count = 14;
      for (let i = 0; i < count; i++) {
        const point = framePerimeterPoint((i + Math.random() * 0.6) / count, rect);
        const tex = toTexcoords(point.x, point.y);
        const force = 1400 + Math.random() * 900;
        splat(
          tex.x,
          tex.y,
          point.nx * force,
          -point.ny * force,
          paletteColor(1.35, 0.1),
          1.7,
        );
      }
    }

    burstRef.current = burst;

    // --- pointer --------------------------------------------------------

    function scaleByPixelRatio(input) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      return Math.floor(input * pixelRatio);
    }

    function hashCode(s) {
      if (!s || s.length === 0) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    }

    function updatePointerMoveData(pointer, posX, posY) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1 - posY / canvas.height;
      const aspectRatio = canvas.width / canvas.height;
      let deltaX = pointer.texcoordX - pointer.prevTexcoordX;
      let deltaY = pointer.texcoordY - pointer.prevTexcoordY;
      if (aspectRatio < 1) deltaX *= aspectRatio;
      if (aspectRatio > 1) deltaY /= aspectRatio;
      pointer.deltaX = deltaX;
      pointer.deltaY = deltaY;
      pointer.moved = Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0;
    }

    const onMouseDown = (event) => {
      const pointer = pointers[0];
      const x = scaleByPixelRatio(event.clientX);
      const y = scaleByPixelRatio(event.clientY);
      pointer.texcoordX = x / canvas.width;
      pointer.texcoordY = 1 - y / canvas.height;
      const color = paletteColor(2.2, 0.08);
      splat(
        pointer.texcoordX,
        pointer.texcoordY,
        16 * (Math.random() - 0.5),
        36 * (Math.random() - 0.5),
        color,
        2.2,
      );
    };

    const onMouseMove = (event) => {
      const pointer = pointers[0];
      strokeColorTimer += 1;
      if (strokeColorTimer > 14) {
        strokeColorTimer = 0;
        pointer.color = paletteColor(0.9);
      }
      if (!pointer.color || pointer.color.r === undefined) {
        pointer.color = paletteColor(0.9);
      }
      updatePointerMoveData(
        pointer,
        scaleByPixelRatio(event.clientX),
        scaleByPixelRatio(event.clientY),
      );
    };

    const onTouchStart = (event) => {
      const touches = event.targetTouches;
      const pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const x = scaleByPixelRatio(touches[i].clientX);
        const y = scaleByPixelRatio(touches[i].clientY);
        pointer.texcoordX = x / canvas.width;
        pointer.texcoordY = 1 - y / canvas.height;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.color = paletteColor(1);
      }
    };

    const onTouchMove = (event) => {
      const touches = event.targetTouches;
      const pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const x = scaleByPixelRatio(touches[i].clientX);
        const y = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, x, y);
      }
    };

    const onResize = () => {
      if (resizeCanvas()) initFramebuffers();
    };

    const onVisChange = () => {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (running && !raf) {
        lastUpdateTime = Date.now();
        raf = requestAnimationFrame(updateFrame);
      }
    };

    function updateFrame() {
      if (!running) return;
      if (document.visibilityState !== "visible") {
        raf = 0;
        return;
      }
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      applyInputs();
      emitFromFrame(dt);
      emitAmbient(dt);
      step(dt);
      render();
      raf = requestAnimationFrame(updateFrame);
    }

    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("visibilitychange", onVisChange);
    raf = requestAnimationFrame(updateFrame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      burstRef.current = null;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("visibilitychange", onVisChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bfl-paint" aria-hidden="true">
      <canvas className="bfl-paint__canvas" ref={canvasRef} />
    </div>
  );
}
