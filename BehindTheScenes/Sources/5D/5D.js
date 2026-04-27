// 5D WebGPU Animation Engine - Pure Frontend, No Dependencies
// Mathematical 5D Hyperdimensional Rendering Engine

(async function() {
  'use strict';

  // Check for WebGPU support
  if (!navigator.gpu) {
    console.error('WebGPU not supported. Please use Chrome Canary with --enable-unsafe-webgpu');
    document.body.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#fff;"><h1>⚠️ WebGPU Not Supported</h1><p>Please enable WebGPU in chrome://flags/#enable-unsafe-webgpu</p></div>';
    return;
  }

  // ==================== 5D Mathematical Primitives ====================
  
  class Vector5D {
    constructor(x = 0, y = 0, z = 0, w = 0, v = 0) {
      this.x = x; this.y = y; this.z = z; this.w = w; this.v = v;
    }
    
    add(other) {
      return new Vector5D(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w, this.v + other.v);
    }
    
    sub(other) {
      return new Vector5D(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w, this.v - other.v);
    }
    
    mul(scalar) {
      return new Vector5D(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar, this.v * scalar);
    }
    
    dot(other) {
      return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w + this.v * other.v;
    }
    
    magnitude() {
      return Math.sqrt(this.dot(this));
    }
    
    normalize() {
      const mag = this.magnitude();
      return mag === 0 ? new Vector5D() : this.mul(1 / mag);
    }
    
    // Project 5D to 3D for visualization
    project3D(angleX, angleY, angleZ, angleW) {
      // 5D rotation matrices applied
      let x = this.x;
      let y = this.y;
      let z = this.z;
      let w = this.w;
      let v = this.v;
      
      // Rotate in X-W plane
      const cosXW = Math.cos(angleX);
      const sinXW = Math.sin(angleX);
      let nx = x * cosXW - w * sinXW;
      let nw = x * sinXW + w * cosXW;
      x = nx; w = nw;
      
      // Rotate in Y-V plane
      const cosYV = Math.cos(angleY);
      const sinYV = Math.sin(angleY);
      let ny = y * cosYV - v * sinYV;
      let nv = y * sinYV + v * cosYV;
      y = ny; v = nv;
      
      // Rotate in Z-W plane
      const cosZW = Math.cos(angleZ);
      const sinZW = Math.sin(angleZ);
      let nz = z * cosZW - w * sinZW;
      nw = z * sinZW + w * cosZW;
      z = nz; w = nw;
      
      // Rotate in X-V plane
      const cosXV = Math.cos(angleW);
      const sinXV = Math.sin(angleW);
      nx = x * cosXV - v * sinXV;
      nv = x * sinXV + v * cosXV;
      x = nx; v = nv;
      
      // Perspective projection from 5D to 3D
      const distance = 5;
      const perspective = distance / (distance + w * 0.3 + v * 0.2);
      
      return { x: x * perspective, y: y * perspective, z: z * perspective };
    }
  }
  
  class Hypercube5D {
    constructor(size = 1.5) {
      this.size = size;
      this.vertices = [];
      this.edges = [];
      this.generate();
    }
    
    generate() {
      // 32 vertices of a 5D hypercube (2^5)
      for (let i = 0; i < 32; i++) {
        const x = ((i >> 0) & 1) === 0 ? -this.size : this.size;
        const y = ((i >> 1) & 1) === 0 ? -this.size : this.size;
        const z = ((i >> 2) & 1) === 0 ? -this.size : this.size;
        const w = ((i >> 3) & 1) === 0 ? -this.size : this.size;
        const v = ((i >> 4) & 1) === 0 ? -this.size : this.size;
        this.vertices.push(new Vector5D(x, y, z, w, v));
      }
      
      // Generate edges (connect vertices differing by one bit)
      for (let i = 0; i < 32; i++) {
        for (let j = i + 1; j < 32; j++) {
          let diff = i ^ j;
          if ((diff & (diff - 1)) === 0) { // Power of two = differs by one bit
            this.edges.push([i, j]);
          }
        }
      }
    }
    
    updateVertices(angles) {
      return this.vertices.map(v => v.project3D(angles.x, angles.y, angles.z, angles.w));
    }
  }
  
  class Hypersphere5D {
    constructor(points = 5000) {
      this.points = [];
      this.generate(points);
    }
    
    generate(count) {
      for (let i = 0; i < count; i++) {
        // Generate points on a 4-sphere (5D surface)
        const angles = [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.acos(2 * Math.random() - 1)
        ];
        
        const radius = 2;
        const x = radius * Math.sin(angles[4]) * Math.cos(angles[0]);
        const y = radius * Math.sin(angles[4]) * Math.sin(angles[0]) * Math.cos(angles[1]);
        const z = radius * Math.sin(angles[4]) * Math.sin(angles[0]) * Math.sin(angles[1]) * Math.cos(angles[2]);
        const w = radius * Math.sin(angles[4]) * Math.sin(angles[0]) * Math.sin(angles[1]) * Math.sin(angles[2]) * Math.cos(angles[3]);
        const v = radius * Math.sin(angles[4]) * Math.sin(angles[0]) * Math.sin(angles[1]) * Math.sin(angles[2]) * Math.sin(angles[3]);
        
        this.points.push(new Vector5D(x, y, z, w, v));
      }
    }
    
    updatePoints(angles) {
      return this.points.map(p => p.project3D(angles.x, angles.y, angles.z, angles.w));
    }
  }
  
  class Tesseract5D {
    constructor() {
      this.vertices = [];
      this.generate();
    }
    
    generate() {
      // Recursive 5D tesseract - 5D cross polytope
      for (let i = 0; i < 10; i++) {
        const coords = [0, 0, 0, 0, 0];
        coords[i % 5] = (Math.floor(i / 5) === 0 ? 1 : -1) * 1.5;
        this.vertices.push(new Vector5D(coords[0], coords[1], coords[2], coords[3], coords[4]));
      }
      
      // Connect all vertices
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          let dot = this.vertices[i].dot(this.vertices[j]);
          if (Math.abs(dot) < 0.01) {
            this.edges = this.edges || [];
            this.edges.push([i, j]);
          }
        }
      }
    }
    
    updateVertices(angles) {
      return this.vertices.map(v => v.project3D(angles.x, angles.y, angles.z, angles.w));
    }
  }
  
  class Hyperdonut5D {
    constructor(segments = 200) {
      this.vertices = [];
      this.generate(segments);
    }
    
    generate(segments) {
      // 5D toroidal shape (hyperdonut)
      const R1 = 2.5, R2 = 1.2, R3 = 0.8, R4 = 0.5;
      
      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        const cosU = Math.cos(u), sinU = Math.sin(u);
        
        for (let j = 0; j <= segments; j++) {
          const v = (j / segments) * Math.PI * 2;
          const cosV = Math.cos(v), sinV = Math.sin(v);
          
          for (let k = 0; k <= segments/4; k++) {
            const w = (k / (segments/4)) * Math.PI * 2;
            const cosW = Math.cos(w), sinW = Math.sin(w);
            
            // 5D torus embedding
            const x = (R1 + R2 * cosU) * cosV;
            const y = (R1 + R2 * cosU) * sinV;
            const z = R2 * sinU * cosW;
            const wDim = R2 * sinU * sinW;
            const vDim = R3 * Math.sin(u * 2) * cosV + R4 * sinU;
            
            this.vertices.push(new Vector5D(x, y, z, wDim, vDim));
          }
        }
      }
    }
    
    updateVertices(angles) {
      return this.vertices.map(v => v.project3D(angles.x, angles.y, angles.z, angles.w));
    }
  }
  
  class Hyperknot5D {
    constructor(resolution = 1000) {
      this.vertices = [];
      this.generate(resolution);
    }
    
    generate(resolution) {
      // 5D torus knot (5,3) extended into 5D
      const p = 5, q = 3;
      
      for (let i = 0; i <= resolution; i++) {
        const t = (i / resolution) * Math.PI * 2;
        const R = 2.5;
        const r = 0.8;
        
        const x = (R + r * Math.cos(p * t)) * Math.cos(q * t);
        const y = (R + r * Math.cos(p * t)) * Math.sin(q * t);
        const z = r * Math.sin(p * t);
        const w = r * Math.cos(p * t) * Math.sin(q * t * 0.5);
        const v = r * Math.sin(p * t * 1.3) * Math.cos(q * t * 0.7);
        
        this.vertices.push(new Vector5D(x, y, z, w, v));
      }
    }
    
    updateVertices(angles) {
      return this.vertices.map(v => v.project3D(angles.x, angles.y, angles.z, angles.w));
    }
  }
  
  class Hyperfield5D {
    constructor(particles = 10000) {
      this.particles = [];
      this.velocities = [];
      this.generate(particles);
    }
    
    generate(count) {
      for (let i = 0; i < count; i++) {
        // Random positions in 5D space
        this.particles.push(new Vector5D(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        ));
        this.velocities.push(new Vector5D(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ));
      }
    }
    
    update(angles, time) {
      // Update particle positions with 5D forces
      const center = new Vector5D(0, 0, 0, 0, 0);
      
      for (let i = 0; i < this.particles.length; i++) {
        // Gravity towards center
        const toCenter = center.sub(this.particles[i]);
        const force = toCenter.mul(0.003);
        this.velocities[i] = this.velocities[i].add(force);
        
        // Add some randomness for fluid motion
        this.velocities[i].x += (Math.random() - 0.5) * 0.005;
        this.velocities[i].y += (Math.random() - 0.5) * 0.005;
        this.velocities[i].z += (Math.random() - 0.5) * 0.005;
        this.velocities[i].w += (Math.random() - 0.5) * 0.003;
        this.velocities[i].v += (Math.random() - 0.5) * 0.003;
        
        // Apply velocity
        this.particles[i] = this.particles[i].add(this.velocities[i]);
        
        // Boundary wrapping
        if (Math.abs(this.particles[i].x) > 5) this.particles[i].x *= -0.95;
        if (Math.abs(this.particles[i].y) > 5) this.particles[i].y *= -0.95;
        if (Math.abs(this.particles[i].z) > 5) this.particles[i].z *= -0.95;
        if (Math.abs(this.particles[i].w) > 4) this.particles[i].w *= -0.95;
        if (Math.abs(this.particles[i].v) > 4) this.particles[i].v *= -0.95;
      }
      
      return this.particles.map(p => p.project3D(angles.x + time * 0.1, angles.y + time * 0.07, angles.z + time * 0.05, angles.w + time * 0.03));
    }
  }
  
  // ==================== WebGPU Renderer ====================
  
  class WebGPU5DRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.device = null;
      this.context = null;
      this.format = null;
      this.pipeline = null;
      this.vertices = [];
      this.colors = [];
      this.vertexBuffer = null;
      this.uniformBuffer = null;
      this.animationId = null;
      this.time = 0;
    }
    
    async init() {
      const adapter = await navigator.gpu.requestAdapter();
      this.device = await adapter.requestDevice();
      this.context = this.canvas.getContext('webgpu');
      
      this.format = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: 'premultiplied',
      });
      
      // Create shader modules
      const shaderModule = this.device.createShaderModule({
        code: `
          struct VertexInput {
            @location(0) position: vec3<f32>,
            @location(1) color: vec3<f32>,
          };
          
          struct Uniforms {
            viewProjection: mat4x4<f32>,
            time: f32,
          };
          
          @group(0) @binding(0) var<uniform> uniforms: Uniforms;
          
          struct VertexOutput {
            @builtin(position) position: vec4<f32>,
            @location(0) color: vec3<f32>,
          };
          
          @vertex
          fn vertexMain(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;
            output.position = uniforms.viewProjection * vec4<f32>(input.position, 1.0);
            output.color = input.color;
            return output;
          }
          
          @fragment
          fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
            return vec4<f32>(input.color, 1.0);
          }
        `,
      });
      
      this.pipeline = this.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vertexMain',
          buffers: [
            {
              arrayStride: 24,
              attributes: [
                { shaderLocation: 0, offset: 0, format: 'float32x3' },
                { shaderLocation: 1, offset: 12, format: 'float32x3' },
              ],
            },
          ],
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fragmentMain',
          targets: [{ format: this.format }],
        },
        primitive: {
          topology: 'line-strip',
          stripIndexFormat: 'uint32',
        },
      });
      
      // Create uniform buffer
      this.uniformBuffer = this.device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
    }
    
    updateGeometry(vertices3D, colors) {
      if (!vertices3D || vertices3D.length === 0) return;
      
      const vertexData = new Float32Array(vertices3D.length * 6);
      for (let i = 0; i < vertices3D.length; i++) {
        vertexData[i * 6] = vertices3D[i].x;
        vertexData[i * 6 + 1] = vertices3D[i].y;
        vertexData[i * 6 + 2] = vertices3D[i].z;
        vertexData[i * 6 + 3] = colors[i % colors.length][0];
        vertexData[i * 6 + 4] = colors[i % colors.length][1];
        vertexData[i * 6 + 5] = colors[i % colors.length][2];
      }
      
      if (this.vertexBuffer) {
        this.vertexBuffer.destroy();
      }
      
      this.vertexBuffer = this.device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      
      new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
      this.vertexBuffer.unmap();
      
      this.vertexCount = vertices3D.length;
    }
    
    updateUniforms(viewMatrix, time) {
      const matrixData = new Float32Array(16);
      for (let i = 0; i < 16; i++) matrixData[i] = viewMatrix[i];
      
      const uniformData = new Float32Array([...matrixData, time]);
      this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }
    
    render(viewMatrix, time) {
      if (!this.vertexBuffer || this.vertexCount === 0) return;
      
      const commandEncoder = this.device.createCommandEncoder();
      const textureView = this.context.getCurrentTexture().createView();
      
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      
      renderPass.setPipeline(this.pipeline);
      renderPass.setVertexBuffer(0, this.vertexBuffer);
      renderPass.setBindGroup(0, this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
      }));
      
      this.updateUniforms(viewMatrix, time);
      renderPass.draw(this.vertexCount);
      renderPass.end();
      
      this.device.queue.submit([commandEncoder.finish()]);
    }
    
    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this.vertexBuffer) this.vertexBuffer.destroy();
      if (this.uniformBuffer) this.uniformBuffer.destroy();
      if (this.device) this.device.destroy();
    }
  }
  
  // ==================== 5D Animation Controller ====================
  
  class HyperdimensionalScene {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.renderer = null;
      this.animationType = 'hypercube';
      this.objects = {
        hypercube: null,
        hypersphere: null,
        tesseract: null,
        hyperdonut: null,
        hyperknot: null,
        hyperfield: null
      };
      this.angles = { x: 0, y: 0, z: 0, w: 0 };
      this.colors = [
        [1, 0.2, 0.4], [0.2, 0.6, 1], [0.4, 1, 0.3], [1, 0.8, 0.2],
        [0.8, 0.3, 1], [0.2, 1, 0.8], [1, 0.5, 0.5], [0.5, 0.5, 1],
        [1, 0.5, 0.2], [0.2, 0.8, 0.5], [0.8, 0.2, 0.6], [0.6, 0.8, 0.2]
      ];
      this.time = 0;
      this.rotationSpeed = 0.005;
      this.perspective = 5;
    }
    
    async init() {
      this.renderer = new WebGPU5DRenderer(this.canvas);
      await this.renderer.init();
      
      // Initialize 5D objects
      this.objects.hypercube = new Hypercube5D(1.5);
      this.objects.hypersphere = new Hypersphere5D(3000);
      this.objects.tesseract = new Tesseract5D();
      this.objects.hyperdonut = new Hyperdonut5D(150);
      this.objects.hyperknot = new Hyperknot5D(2000);
      this.objects.hyperfield = new Hyperfield5D(8000);
      
      this.start();
    }
    
    setAnimationType(type) {
      if (this.objects[type]) {
        this.animationType = type;
      }
    }
    
    updateAngles(deltaX, deltaY, deltaZ, deltaW) {
      this.angles.x += deltaX * 0.01;
      this.angles.y += deltaY * 0.01;
      this.angles.z += deltaZ * 0.01;
      this.angles.w += deltaW * 0.01;
    }
    
    getViewMatrix() {
      // Create perspective projection matrix for 3D viewing
      const fov = 60 * Math.PI / 180;
      const aspect = this.canvas.width / this.canvas.height;
      const near = 0.1;
      const far = 100;
      
      const yScale = 1 / Math.tan(fov / 2);
      const xScale = yScale / aspect;
      const range = far / (far - near);
      
      return [
        xScale, 0, 0, 0,
        0, yScale, 0, 0,
        0, 0, range, 1,
        0, 0, -range * near, 0
      ];
    }
    
    render() {
      this.time += 0.016;
      
      // Auto-rotate angles
      this.angles.x += this.rotationSpeed;
      this.angles.y += this.rotationSpeed * 0.7;
      this.angles.z += this.rotationSpeed * 0.5;
      this.angles.w += this.rotationSpeed * 0.3;
      
      let vertices3D = [];
      let vertexColors = [];
      
      switch (this.animationType) {
        case 'hypercube':
          vertices3D = this.objects.hypercube.updateVertices(this.angles);
          vertexColors = Array(vertices3D.length).fill(this.colors[0]);
          break;
          
        case 'hypersphere':
          vertices3D = this.objects.hypersphere.updatePoints(this.angles);
          vertexColors = vertices3D.map((_, i) => this.colors[i % this.colors.length]);
          break;
          
        case 'tesseract':
          vertices3D = this.objects.tesseract.updateVertices(this.angles);
          vertexColors = Array(vertices3D.length).fill(this.colors[2]);
          break;
          
        case 'hyperdonut':
          vertices3D = this.objects.hyperdonut.updateVertices(this.angles);
          vertexColors = vertices3D.map((_, i) => this.colors[i % this.colors.length]);
          break;
          
        case 'hyperknot':
          vertices3D = this.objects.hyperknot.updateVertices(this.angles);
          vertexColors = vertices3D.map((_, i) => {
            const t = i / vertices3D.length;
            return [Math.sin(t * Math.PI * 2) * 0.5 + 0.5, Math.cos(t * Math.PI * 3) * 0.5 + 0.5, Math.sin(t * Math.PI * 5) * 0.5 + 0.5];
          });
          break;
          
        case 'hyperfield':
          vertices3D = this.objects.hyperfield.update(this.angles, this.time);
          vertexColors = vertices3D.map((_, i) => {
            const intensity = (Math.sin(this.time * 2 + i * 0.01) + 1) / 2;
            return [intensity, intensity * 0.5, intensity * 0.8];
          });
          break;
      }
      
      if (vertices3D && vertices3D.length > 0) {
        this.renderer.updateGeometry(vertices3D, vertexColors);
        this.renderer.render(this.getViewMatrix(), this.time);
      }
      
      requestAnimationFrame(() => this.render());
    }
    
    start() {
      this.render();
    }
    
    destroy() {
      this.renderer.destroy();
    }
  }
  
  // ==================== UI Controller ====================
  
  class UI5DController {
    constructor() {
      this.scene = null;
      this.setupUI();
    }
    
    setupUI() {
      // Create control panel
      const panel = document.createElement('div');
      panel.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);border-radius:16px;padding:15px;z-index:1000;font-family:monospace;color:#fff;border:1px solid rgba(102,126,234,0.5);';
      
      panel.innerHTML = `
        <div style="margin-bottom:10px;font-weight:bold;text-align:center;">🌀 5D Hyperdimensional Controls</div>
        <select id="animationType" style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;background:#1a1a2e;color:#fff;border:1px solid #667eea;">
          <option value="hypercube">🎲 5D Hypercube (Penteract)</option>
          <option value="hypersphere">⚪ 4-Sphere (5D Surface)</option>
          <option value="tesseract">🔷 5D Tesseract</option>
          <option value="hyperdonut">🍩 5D Hyperdonut (Torus)</option>
          <option value="hyperknot">🌀 5D Hyperknot (5,3)</option>
          <option value="hyperfield">✨ 5D Particle Field</option>
        </select>
        <div style="margin-top:10px;">
          <label>Rotation Speed: <span id="speedValue">0.005</span></label>
          <input type="range" id="speedSlider" min="0" max="0.02" step="0.0005" value="0.005" style="width:100%;margin:5px 0;">
        </div>
        <div style="margin-top:10px;font-size:10px;opacity:0.6;text-align:center;">
          🎨 5D Mathematical Projection | WebGPU Powered
        </div>
      `;
      
      document.body.appendChild(panel);
      
      const select = document.getElementById('animationType');
      const speedSlider = document.getElementById('speedSlider');
      const speedValue = document.getElementById('speedValue');
      
      select.addEventListener('change', (e) => {
        if (this.scene) this.scene.setAnimationType(e.target.value);
      });
      
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        speedValue.textContent = val;
        if (this.scene) this.scene.rotationSpeed = val;
      });
    }
    
    async initialize(canvasId) {
      this.scene = new HyperdimensionalScene(canvasId);
      await this.scene.init();
      if (this.scene) this.scene.setAnimationType('hypercube');
    }
  }
  
  // ==================== Export and Auto-Initialize ====================
  
  window.Hyperdimensional5D = {
    Scene: HyperdimensionalScene,
    Controller: UI5DController,
    Vector5D: Vector5D,
    Hypercube5D: Hypercube5D,
    Hypersphere5D: Hypersphere5D,
    Tesseract5D: Tesseract5D,
    Hyperdonut5D: Hyperdonut5D,
    Hyperknot5D: Hyperknot5D,
    Hyperfield5D: Hyperfield5D,
    WebGPU5DRenderer: WebGPU5DRenderer
  };
  
  // Auto-initialize when script loads
  const canvas = document.createElement('canvas');
  canvas.id = 'hypercanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);
  
  const controller = new UI5DController();
  await controller.initialize('hypercanvas');
  
  console.log('🌀 5D Hyperdimensional Engine Active | WebGPU | Mathematical 5D Projections');
})();
