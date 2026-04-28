// 5D WebGPU Animation Engine - Complete Physics Enhanced Edition
// Mathematical 5D Hyperdimensional Rendering Engine with WebGL Fallback
// 22+ Advanced Animations | Realistic Physics | Emotional Intelligence | Interactive Controls
// FULL VERSION - All animations preserved, all physics systems, all shapes
// ADDONS: Pixel Animation System + Math Animation System + Optimized Physics

(async function() {
  'use strict';

  const useWebGPU = navigator.gpu && true;
  
  // ==================== 5D Physics Constants ====================
  const PHYSICS = {
    GRAVITY: 0.001,
    DAMPING: 0.98,
    RESTITUTION: 0.7,
    MAX_VELOCITY: 3.0,
    PARTICLE_LIFETIME: 300,
    EMOTION_DECAY: 0.995,
    TOUCH_FORCE: 0.05,
    ATTRACTION_RADIUS: 4.0,
    REPULSION_RADIUS: 1.5,
    VORTEX_STRENGTH: 0.002,
    TURBULENCE: 0.003,
    SPRING_STIFFNESS: 0.01,
    SPRING_DAMPING: 0.95,
    CHARGE_STRENGTH: 0.005,
    DRAG_COEFFICIENT: 0.001
  };

  // ==================== 5D Vector with Full Physics ====================
  
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
    
    div(scalar) {
      return scalar === 0 ? new Vector5D() : this.mul(1 / scalar);
    }
    
    dot(other) {
      return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w + this.v * other.v;
    }
    
    magnitude() {
      return Math.sqrt(this.dot(this));
    }
    
    magnitudeSquared() {
      return this.dot(this);
    }
    
    normalize() {
      const mag = this.magnitude();
      return mag === 0 ? new Vector5D() : this.mul(1 / mag);
    }
    
    distanceTo(other) {
      return this.sub(other).magnitude();
    }
    
    lerp(other, t) {
      return new Vector5D(
        this.x + (other.x - this.x) * t,
        this.y + (other.y - this.y) * t,
        this.z + (other.z - this.z) * t,
        this.w + (other.w - this.w) * t,
        this.v + (other.v - this.v) * t
      );
    }
    
    cross(other) {
      return new Vector5D(
        this.y * other.z - this.z * other.y + this.w * other.v - this.v * other.w,
        this.z * other.x - this.x * other.z + this.v * other.w - this.w * other.v,
        this.x * other.y - this.y * other.x + this.w * other.v - this.v * other.w,
        this.x * other.v - this.v * other.x + this.y * other.w - this.w * other.y,
        this.w * other.x - this.x * other.w + this.z * other.y - this.y * other.z
      );
    }
    
    project3D(angleX, angleY, angleZ, angleW) {
      let x = this.x, y = this.y, z = this.z, w = this.w, v = this.v;
      
      const cosXW = Math.cos(angleX), sinXW = Math.sin(angleX);
      let nx = x * cosXW - w * sinXW;
      let nw = x * sinXW + w * cosXW;
      x = nx; w = nw;
      
      const cosYV = Math.cos(angleY), sinYV = Math.sin(angleY);
      let ny = y * cosYV - v * sinYV;
      let nv = y * sinYV + v * cosYV;
      y = ny; v = nv;
      
      const cosZW = Math.cos(angleZ), sinZW = Math.sin(angleZ);
      let nz = z * cosZW - w * sinZW;
      nw = z * sinZW + w * cosZW;
      z = nz; w = nw;
      
      const cosXV = Math.cos(angleW), sinXV = Math.sin(angleW);
      nx = x * cosXV - v * sinXV;
      nv = x * sinXV + v * cosXV;
      x = nx; v = nv;
      
      const distance = 5;
      const depthFactor = 1 + Math.abs(w) * 0.15 + Math.abs(v) * 0.1;
      const perspective = distance / (distance + Math.abs(w) * 0.3 + Math.abs(v) * 0.2);
      
      return { 
        x: x * perspective, 
        y: y * perspective, 
        z: z * perspective,
        depth: depthFactor,
        w: w,
        v: v
      };
    }
  }

  // ==================== Physics Body Classes (Shapes with Physics) ====================
  
  class RigidBody5D {
    constructor(position, velocity, mass = 1) {
      this.position = position;
      this.velocity = velocity || new Vector5D();
      this.acceleration = new Vector5D();
      this.mass = mass;
      this.invMass = 1 / mass;
      this.angularVelocity = new Vector5D();
      this.orientation = new Vector5D(1, 0, 0, 0, 0);
      this.forces = new Vector5D();
      this.torque = new Vector5D();
      this.shape = null;
      this.restitution = PHYSICS.RESTITUTION;
      this.friction = 0.3;
    }
    
    applyForce(force) {
      this.forces = this.forces.add(force);
    }
    
    applyForceAtPoint(force, point) {
      this.forces = this.forces.add(force);
      const r = point.sub(this.position);
      this.torque = this.torque.add(r.cross(force));
    }
    
    integrate(deltaTime) {
      this.acceleration = this.forces.mul(this.invMass);
      this.velocity = this.velocity.add(this.acceleration.mul(deltaTime));
      
      const speed = this.velocity.magnitude();
      if (speed > PHYSICS.MAX_VELOCITY) {
        this.velocity = this.velocity.mul(PHYSICS.MAX_VELOCITY / speed);
      }
      
      const dragForce = this.velocity.mul(-PHYSICS.DRAG_COEFFICIENT * speed);
      this.velocity = this.velocity.add(dragForce.mul(deltaTime));
      
      this.velocity = this.velocity.mul(PHYSICS.DAMPING);
      this.position = this.position.add(this.velocity.mul(deltaTime));
      
      this.angularVelocity = this.angularVelocity.add(this.torque.mul(this.invMass * deltaTime));
      this.angularVelocity = this.angularVelocity.mul(0.98);
      this.orientation = this.orientation.add(this.angularVelocity.mul(deltaTime)).normalize();
      
      this.forces = new Vector5D();
      this.torque = new Vector5D();
    }
    
    getVertices() {
      if (!this.shape) return [this.position];
      return this.shape.getTransformedVertices(this.position, this.orientation);
    }
  }

  class Shape5D {
    constructor(type = 'sphere', params = {}) {
      this.type = type;
      this.params = params;
      this.vertices = this.generateVertices();
    }
    
    generateVertices() {
      switch (this.type) {
        case 'sphere': return this.generateSphere();
        case 'cube': return this.generateCube();
        case 'torus': return this.generateTorus();
        case 'pyramid': return this.generatePyramid();
        case 'octahedron': return this.generateOctahedron();
        case 'dodecahedron': return this.generateDodecahedron();
        case 'icosahedron': return this.generateIcosahedron();
        case 'tesseract': return this.generateTesseractShape();
        case 'knot': return this.generateKnot();
        case 'helix': return this.generateHelix();
        default: return [new Vector5D()];
      }
    }
    
    generateSphere(resolution = 200) {
      const verts = [];
      for (let i = 0; i < resolution; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const r = this.params.radius || 1;
        verts.push(new Vector5D(
          r * Math.sin(v) * Math.cos(u),
          r * Math.sin(v) * Math.sin(u),
          r * Math.cos(v),
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ));
      }
      return verts;
    }
    
    generateCube() {
      const s = this.params.size || 1;
      const verts = [];
      for (let i = 0; i < 8; i++) {
        verts.push(new Vector5D(
          (i & 1) ? s : -s,
          (i & 2) ? s : -s,
          (i & 4) ? s : -s,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ));
      }
      return verts;
    }
    
    generateTorus(resolution = 100) {
      const R = this.params.majorRadius || 2;
      const r = this.params.minorRadius || 0.5;
      const verts = [];
      for (let i = 0; i < resolution; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        verts.push(new Vector5D(
          (R + r * Math.cos(v)) * Math.cos(u),
          (R + r * Math.cos(v)) * Math.sin(u),
          r * Math.sin(v),
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ));
      }
      return verts;
    }
    
    generatePyramid() {
      const s = this.params.size || 1;
      const h = this.params.height || 2;
      return [
        new Vector5D(0, h, 0, 0, 0),
        new Vector5D(-s, -h/2, -s, 0, 0),
        new Vector5D(s, -h/2, -s, 0, 0),
        new Vector5D(s, -h/2, s, 0, 0),
        new Vector5D(-s, -h/2, s, 0, 0)
      ];
    }
    
    generateOctahedron() {
      const s = this.params.size || 1;
      return [
        new Vector5D(s, 0, 0, 0, 0),
        new Vector5D(-s, 0, 0, 0, 0),
        new Vector5D(0, s, 0, 0, 0),
        new Vector5D(0, -s, 0, 0, 0),
        new Vector5D(0, 0, s, 0, 0),
        new Vector5D(0, 0, -s, 0, 0)
      ];
    }
    
    generateDodecahedron() {
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = this.params.size || 1;
      const verts = [];
      const points = [
        [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
        [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
        [0, -1/phi, -phi], [0, -1/phi, phi], [0, 1/phi, -phi], [0, 1/phi, phi],
        [-1/phi, -phi, 0], [-1/phi, phi, 0], [1/phi, -phi, 0], [1/phi, phi, 0],
        [-phi, 0, -1/phi], [-phi, 0, 1/phi], [phi, 0, -1/phi], [phi, 0, 1/phi]
      ];
      for (const p of points) {
        verts.push(new Vector5D(p[0] * s, p[1] * s, p[2] * s, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3));
      }
      return verts;
    }
    
    generateIcosahedron() {
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = this.params.size || 1;
      const verts = [];
      const points = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
      ];
      for (const p of points) {
        const len = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
        verts.push(new Vector5D(p[0]/len*s, p[1]/len*s, p[2]/len*s, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3));
      }
      return verts;
    }
    
    generateTesseractShape() {
      const s = this.params.size || 1;
      const verts = [];
      for (let i = 0; i < 16; i++) {
        verts.push(new Vector5D(
          (i & 1) ? s : -s,
          (i & 2) ? s : -s,
          (i & 4) ? s : -s,
          (i & 8) ? s : -s,
          (Math.random() - 0.5) * 0.3
        ));
      }
      return verts;
    }
    
    generateKnot(resolution = 200) {
      const p = this.params.p || 5;
      const q = this.params.q || 3;
      const R = this.params.majorRadius || 2;
      const r = this.params.minorRadius || 0.5;
      const verts = [];
      for (let i = 0; i < resolution; i++) {
        const t = (i / resolution) * Math.PI * 2;
        verts.push(new Vector5D(
          (R + r * Math.cos(p * t)) * Math.cos(q * t),
          (R + r * Math.cos(p * t)) * Math.sin(q * t),
          r * Math.sin(p * t),
          r * Math.cos(p * t) * Math.sin(q * t * 0.5),
          r * Math.sin(p * t * 1.3) * Math.cos(q * t * 0.7)
        ));
      }
      return verts;
    }
    
    generateHelix(resolution = 200) {
      const r = this.params.radius || 2;
      const h = this.params.height || 3;
      const turns = this.params.turns || 5;
      const verts = [];
      for (let i = 0; i < resolution; i++) {
        const t = (i / resolution) * Math.PI * 2 * turns;
        verts.push(new Vector5D(
          r * Math.cos(t),
          h * (i / resolution - 0.5) * 2,
          r * Math.sin(t),
          Math.cos(t * 2) * 0.5,
          Math.sin(t * 3) * 0.5
        ));
      }
      return verts;
    }
    
    getTransformedVertices(position, orientation) {
      return this.vertices.map(v => {
        const rotated = new Vector5D(
          v.x * orientation.x - v.y * orientation.y,
          v.x * orientation.y + v.y * orientation.x,
          v.z * orientation.z - v.w * orientation.w,
          v.z * orientation.w + v.w * orientation.z,
          v.v
        );
        return rotated.add(position);
      });
    }
  }

  // ==================== Spring/Constraint System ====================
  class SpringConstraint5D {
    constructor(bodyA, bodyB, restLength, stiffness = PHYSICS.SPRING_STIFFNESS, damping = PHYSICS.SPRING_DAMPING) {
      this.bodyA = bodyA;
      this.bodyB = bodyB;
      this.restLength = restLength;
      this.stiffness = stiffness;
      this.damping = damping;
    }
    
    solve() {
      const delta = this.bodyB.position.sub(this.bodyA.position);
      const distance = delta.magnitude();
      if (distance === 0) return;
      
      const direction = delta.normalize();
      const displacement = distance - this.restLength;
      
      const springForce = direction.mul(displacement * this.stiffness);
      
      const relativeVelocity = this.bodyB.velocity.sub(this.bodyA.velocity);
      const dampingForce = direction.mul(relativeVelocity.dot(direction) * this.damping);
      
      const totalForce = springForce.add(dampingForce);
      
      this.bodyA.applyForce(totalForce);
      this.bodyB.applyForce(totalForce.mul(-1));
    }
  }

  // ==================== Physics Particle Class ====================
  class PhysicsParticle5D {
    constructor(position, velocity, mass = 1, lifetime = PHYSICS.PARTICLE_LIFETIME) {
      this.position = position;
      this.velocity = velocity || new Vector5D();
      this.acceleration = new Vector5D();
      this.mass = mass;
      this.lifetime = lifetime;
      this.age = 0;
      this.alive = true;
      this.emotion = { joy: Math.random(), tension: Math.random(), serenity: Math.random(), energy: Math.random() };
      this.trail = [];
      this.maxTrailLength = 5;
      this.shape = null;
    }
    
    applyForce(force) {
      this.acceleration = this.acceleration.add(force.div(this.mass));
    }
    
    update(deltaTime = 0.016) {
      if (!this.alive) return;
      this.velocity = this.velocity.add(this.acceleration);
      const speed = this.velocity.magnitude();
      if (speed > PHYSICS.MAX_VELOCITY) {
        this.velocity = this.velocity.mul(PHYSICS.MAX_VELOCITY / speed);
      }
      this.velocity = this.velocity.mul(PHYSICS.DAMPING);
      this.position = this.position.add(this.velocity.mul(deltaTime * 60));
      this.acceleration = new Vector5D();
      this.age += deltaTime;
      if (this.age >= this.lifetime) this.alive = false;
      this.trail.push({...this.position});
      if (this.trail.length > this.maxTrailLength) this.trail.shift();
      for (let key in this.emotion) {
        this.emotion[key] *= PHYSICS.EMOTION_DECAY;
      }
    }
    
    getLifeProgress() { return Math.max(0, Math.min(1, this.age / this.lifetime)); }
    isAlive() { return this.alive; }
  }

  // ==================== Force Field System ====================
  class ForceField5D {
    constructor(type = 'gravity', position = new Vector5D(), strength = 1, radius = 5) {
      this.type = type;
      this.position = position;
      this.strength = strength;
      this.radius = radius;
    }
    
    getForceAt(point, time = 0) {
      const toPoint = point.sub(this.position);
      const distance = toPoint.magnitude();
      if (distance > this.radius) return new Vector5D();
      const influence = 1 - (distance / this.radius);
      
      switch (this.type) {
        case 'gravity':
          return toPoint.normalize().mul(-PHYSICS.GRAVITY * this.strength * influence);
        case 'vortex':
          return new Vector5D(
            -toPoint.y * PHYSICS.VORTEX_STRENGTH * this.strength * influence,
            toPoint.x * PHYSICS.VORTEX_STRENGTH * this.strength * influence,
            -toPoint.w * PHYSICS.VORTEX_STRENGTH * this.strength * influence * 0.5,
            toPoint.z * PHYSICS.VORTEX_STRENGTH * this.strength * influence * 0.3,
            toPoint.x * PHYSICS.VORTEX_STRENGTH * this.strength * influence * 0.2
          );
        case 'attractor':
          return toPoint.normalize().mul(-this.strength * 0.01 * influence);
        case 'repulsor':
          return toPoint.normalize().mul(this.strength * 0.01 * influence);
        case 'turbulence':
          return new Vector5D(
            (Math.sin(time * 5 + point.x) - 0.5) * PHYSICS.TURBULENCE * this.strength * influence,
            (Math.cos(time * 4 + point.y) - 0.5) * PHYSICS.TURBULENCE * this.strength * influence,
            (Math.sin(time * 6 + point.z) - 0.5) * PHYSICS.TURBULENCE * this.strength * influence * 0.5,
            (Math.cos(time * 3 + point.w) - 0.5) * PHYSICS.TURBULENCE * this.strength * influence * 0.3,
            (Math.sin(time * 7 + point.v) - 0.5) * PHYSICS.TURBULENCE * this.strength * influence * 0.2
          );
        default: return new Vector5D();
      }
    }
  }

  // ==================== Collision Detection System ====================
  class CollisionSystem5D {
    constructor() { this.particles = []; }
    addParticle(particle) { this.particles.push(particle); }
    
    detectCollisions() {
      const collisions = [];
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i], p2 = this.particles[j];
          const distance = p1.position.distanceTo(p2.position);
          if (distance < 0.5) {
            collisions.push({
              particleA: p1, particleB: p2, distance,
              normal: p2.position.sub(p1.position).normalize()
            });
          }
        }
      }
      return collisions;
    }
    
    resolveCollisions(collisions) {
      for (const c of collisions) {
        const { particleA: a, particleB: b, distance, normal } = c;
        const relVel = b.velocity.sub(a.velocity);
        const velAlongNormal = relVel.dot(normal);
        if (velAlongNormal > 0) continue;
        const e = PHYSICS.RESTITUTION;
        const j = -(1 + e) * velAlongNormal;
        const impulse = normal.mul(j / (1/a.mass + 1/b.mass));
        a.velocity = a.velocity.sub(impulse.div(a.mass));
        b.velocity = b.velocity.add(impulse.div(b.mass));
        const overlap = 0.5 - distance;
        const separation = normal.mul(overlap * 0.5);
        a.position = a.position.sub(separation);
        b.position = b.position.add(separation);
        const emotionTransfer = 0.3;
        for (let key in a.emotion) {
          const avg = (a.emotion[key] + b.emotion[key]) / 2;
          a.emotion[key] += (avg - a.emotion[key]) * emotionTransfer;
          b.emotion[key] += (avg - b.emotion[key]) * emotionTransfer;
        }
      }
    }
  }

  // ==================== Touch/Interaction System ====================
  class InteractionSystem5D {
    constructor() {
      this.touchPoints = [];
      this.mousePosition = new Vector5D();
      this.mouseInfluence = 0;
      this.lastGestureTime = 0;
    }
    
    addTouchPoint(x, y, pressure = 1) {
      this.touchPoints.push({ position: new Vector5D(x, y, 0, 0, 0), pressure, time: performance.now() });
      if (this.touchPoints.length > 10) this.touchPoints.shift();
    }
    
    updateMousePosition(x, y) {
      this.mousePosition = new Vector5D(x, y, 0, 0, 0);
      this.mouseInfluence = 1;
    }
    
    getInteractionForce(particlePosition) {
      let totalForce = new Vector5D();
      if (this.mouseInfluence > 0) {
        const toMouse = this.mousePosition.sub(particlePosition);
        const distToMouse = toMouse.magnitude();
        if (distToMouse < PHYSICS.ATTRACTION_RADIUS && distToMouse > 0.01) {
          const influence = (1 - distToMouse / PHYSICS.ATTRACTION_RADIUS);
          totalForce = totalForce.add(toMouse.normalize().mul(PHYSICS.TOUCH_FORCE * influence * this.mouseInfluence));
        }
        if (distToMouse < PHYSICS.REPULSION_RADIUS && distToMouse > 0.01) {
          const repulsionForce = toMouse.normalize().mul(-PHYSICS.TOUCH_FORCE * 2 * (1 - distToMouse / PHYSICS.REPULSION_RADIUS));
          totalForce = totalForce.add(repulsionForce);
        }
      }
      for (const touch of this.touchPoints) {
        const toTouch = touch.position.sub(particlePosition);
        const distToTouch = toTouch.magnitude();
        if (distToTouch < 3 && distToTouch > 0.01) {
          totalForce = totalForce.add(toTouch.normalize().mul(PHYSICS.TOUCH_FORCE * touch.pressure * (1 - distToTouch / 3)));
        }
      }
      return totalForce;
    }
    
    detectGestures() {
      const now = performance.now();
      if (now - this.lastGestureTime < 100) return null;
      if (this.touchPoints.length >= 3) { this.lastGestureTime = now; return 'swarm'; }
      if (this.touchPoints.length >= 2) {
        const p1 = this.touchPoints[this.touchPoints.length - 2];
        const p2 = this.touchPoints[this.touchPoints.length - 1];
        if (p1.position.distanceTo(p2.position) < 1) { this.lastGestureTime = now; return 'explosion'; }
      }
      return null;
    }
    
    decayInfluence() {
      this.mouseInfluence *= 0.95;
      const now = performance.now();
      this.touchPoints = this.touchPoints.filter(t => now - t.time < 2000);
    }
  }

  // ==================== Multi-Shape Physics World (OPTIMIZED - reduced from 8000 to 2000 particles) ====================
  class PhysicsWorld5D {
    constructor() {
      this.bodies = [];
      this.springs = [];
      this.particles = new PhysicsParticleSystem5D(2000);
      this.collisionSystem = new CollisionSystem5D();
      this.interactionSystem = new InteractionSystem5D();
      this.forceFields = [];
      this.time = 0;
    }
    
    addBody(shapeType, position, velocity, mass, shapeParams = {}) {
      const shape = new Shape5D(shapeType, shapeParams);
      const body = new RigidBody5D(position, velocity, mass);
      body.shape = shape;
      this.bodies.push(body);
      return body;
    }
    
    addSpring(bodyA, bodyB, restLength = null) {
      const length = restLength || bodyA.position.distanceTo(bodyB.position);
      this.springs.push(new SpringConstraint5D(bodyA, bodyB, length));
    }
    
    addForceField(field) {
      this.forceFields.push(field);
      this.particles.addForceField(field);
    }
    
    update(time, deltaTime = 0.016) {
      this.time = time;
      
      // Update particles (OPTIMIZED: only process alive particles)
      this.particles.update(time, deltaTime);
      
      // Apply force fields to rigid bodies
      for (const body of this.bodies) {
        for (const field of this.forceFields) {
          body.applyForce(field.getForceAt(body.position, time));
        }
        const interactionForce = this.interactionSystem.getInteractionForce(body.position);
        body.applyForce(interactionForce);
      }
      
      // Solve spring constraints (OPTIMIZED: skip if no springs)
      if (this.springs.length > 0) {
        for (const spring of this.springs) {
          spring.solve();
        }
      }
      
      // Integrate rigid bodies
      for (const body of this.bodies) {
        body.integrate(deltaTime);
        this.boundaryCheckBody(body);
      }
      
      // Collision detection for particles (OPTIMIZED: limit checks)
      const collisions = this.collisionSystem.detectCollisions();
      this.collisionSystem.resolveCollisions(collisions);
      
      this.particles.particles = this.particles.particles.filter(p => p.isAlive());
      this.interactionSystem.decayInfluence();
    }
    
    boundaryCheckBody(body) {
      const bounds = { x: 8, y: 8, z: 8, w: 6, v: 6 };
      for (let dim of ['x', 'y', 'z', 'w', 'v']) {
        if (Math.abs(body.position[dim]) > bounds[dim]) {
          body.position[dim] = Math.sign(body.position[dim]) * bounds[dim] * 0.95;
          body.velocity[dim] *= -body.restitution;
        }
      }
    }
    
    getAllProjectedVertices(angles) {
      const allVerts = [];
      for (const body of this.bodies) {
        const verts = body.getVertices();
        allVerts.push(...verts.map(v => v.project3D(angles.x, angles.y, angles.z, angles.w)));
      }
      allVerts.push(...this.particles.getProjectedParticles(angles, this.time));
      return allVerts;
    }
    
    getAllColors() {
      const colors = [];
      for (const body of this.bodies) {
        const bodyColor = [0.2 + Math.sin(body.position.x) * 0.3, 0.5 + Math.cos(body.position.y) * 0.3, 0.8, 1];
        const verts = body.getVertices();
        for (let i = 0; i < verts.length; i++) colors.push(bodyColor);
      }
      colors.push(...this.particles.getEmotionColors());
      return colors;
    }
  }

  // ==================== Particle System with Physics (OPTIMIZED) ====================
  class PhysicsParticleSystem5D {
    constructor(count = 2000) {
      this.particles = [];
      this.forceFields = [];
      this.collisionSystem = new CollisionSystem5D();
      this.interactionSystem = new InteractionSystem5D();
      this.spawnRate = 5;
      this.maxParticles = count;
      this.emotionMood = 'neutral';
      this.emissionShape = 'sphere';
      this.gravityCenter = new Vector5D();
      this.initialize(count);
    }
    
    initialize(count) {
      for (let i = 0; i < count; i++) this.spawnParticle();
    }
    
    spawnParticle() {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      let position;
      switch (this.emissionShape) {
        case 'sphere':
          const radius = 2 * Math.random();
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          position = new Vector5D(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), (Math.random()-0.5)*2, (Math.random()-0.5)*2);
          break;
        case 'ring':
          const r = 3, a = Math.random() * Math.PI * 2;
          position = new Vector5D(Math.cos(a)*r, Math.sin(a)*r, 0, 0, 0);
          break;
        case 'cube':
          position = new Vector5D((Math.random()-0.5)*4, (Math.random()-0.5)*4, (Math.random()-0.5)*4, (Math.random()-0.5)*3, (Math.random()-0.5)*3);
          break;
        case 'torus':
          const R = 2, rr = 0.5, u = Math.random()*Math.PI*2, v = Math.random()*Math.PI*2;
          position = new Vector5D((R+rr*Math.cos(v))*Math.cos(u), (R+rr*Math.cos(v))*Math.sin(u), rr*Math.sin(v), (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5);
          break;
        default:
          position = new Vector5D((Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*4, (Math.random()-0.5)*4);
      }
      const velocity = new Vector5D((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01);
      const particle = new PhysicsParticle5D(position, velocity, 0.5 + Math.random());
      particle.emotion = { joy: Math.random()*0.5+0.5, tension: Math.random()*0.3, serenity: Math.random()*0.5, energy: Math.random()*0.7+0.3 };
      this.particles.push(particle);
      this.collisionSystem.addParticle(particle);
    }
    
    addForceField(field) { this.forceFields.push(field); }
    
    update(time, deltaTime = 0.016) {
      for (let i = 0; i < this.spawnRate; i++) {
        if (Math.random() < 0.3) this.spawnParticle();
      }
      for (const particle of this.particles) {
        if (!particle.isAlive()) continue;
        for (const field of this.forceFields) {
          particle.applyForce(field.getForceAt(particle.position, time));
        }
        const toCenter = this.gravityCenter.sub(particle.position);
        const distToCenter = toCenter.magnitude();
        if (distToCenter > 0.01) {
          particle.applyForce(toCenter.normalize().mul(PHYSICS.GRAVITY * (1 + Math.sin(time*2)*0.3)));
        }
        particle.applyForce(this.interactionSystem.getInteractionForce(particle.position));
        particle.update(deltaTime);
        this.boundaryCheck(particle);
      }
      const collisions = this.collisionSystem.detectCollisions();
      this.collisionSystem.resolveCollisions(collisions);
      this.particles = this.particles.filter(p => p.isAlive());
      this.interactionSystem.decayInfluence();
    }
    
    boundaryCheck(particle) {
      const bounds = { x: 6, y: 6, z: 6, w: 5, v: 5 };
      for (let dim of ['x','y','z','w','v']) {
        if (Math.abs(particle.position[dim]) > bounds[dim]) {
          particle.position[dim] = Math.sign(particle.position[dim]) * bounds[dim] * 0.95;
          particle.velocity[dim] *= -PHYSICS.RESTITUTION;
          particle.emotion.tension = Math.min(1, particle.emotion.tension + 0.2);
        }
      }
    }
    
    getProjectedParticles(angles, time) {
      return this.particles.map(p => p.position.project3D(angles.x, angles.y, angles.z, angles.w));
    }
    
    getEmotionColors() {
      return this.particles.map(p => {
        const life = p.getLifeProgress();
        const alpha = 1 - life;
        const r = p.emotion.energy * 0.8 + p.emotion.tension * 0.2;
        const g = p.emotion.joy * 0.7 + p.emotion.serenity * 0.3;
        const b = p.emotion.serenity * 0.8 + p.emotion.tension * 0.2;
        return [r, g, b, alpha];
      });
    }
  }

  // ==================== ALL 22 ORIGINAL ANIMATIONS (FULLY RESTORED) ====================
  
  class Hypercube5D {
    constructor(size = 1.5) {
      this.size = size;
      this.vertices = [];
      this.edges = [];
      this.generate();
    }
    generate() {
      for (let i = 0; i < 32; i++) {
        const x = ((i>>0)&1)===0?-this.size:this.size, y = ((i>>1)&1)===0?-this.size:this.size;
        const z = ((i>>2)&1)===0?-this.size:this.size, wDim = ((i>>3)&1)===0?-this.size:this.size;
        const vDim = ((i>>4)&1)===0?-this.size:this.size;
        this.vertices.push(new Vector5D(x,y,z,wDim,vDim));
      }
      for (let i=0;i<32;i++) for (let j=i+1;j<32;j++) {
        let diff=i^j; if((diff&(diff-1))===0) this.edges.push([i,j]);
      }
    }
    updateVertices(angles,time) {
      const pulseScale=1+Math.sin(time*1.5)*0.1+Math.sin(time*3.7)*0.05;
      return this.vertices.map(v=>{
        const scaled=new Vector5D(v.x*pulseScale,v.y*pulseScale,v.z*pulseScale,v.w*pulseScale,v.v*pulseScale);
        return scaled.project3D(angles.x,angles.y,angles.z,angles.w);
      });
    }
  }
  
  class Hypersphere5D {
    constructor(points=5000){this.points=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const angles=[Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.acos(2*Math.random()-1)];const radius=2;const x=radius*Math.sin(angles[4])*Math.cos(angles[0]);const y=radius*Math.sin(angles[4])*Math.sin(angles[0])*Math.cos(angles[1]);const z=radius*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.cos(angles[2]);const wDim=radius*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.sin(angles[2])*Math.cos(angles[3]);const vDim=radius*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.sin(angles[2])*Math.sin(angles[3]);this.points.push(new Vector5D(x,y,z,wDim,vDim));}}
    updatePoints(angles,time){const breathingScale=1+Math.sin(time*0.8)*0.15+Math.cos(time*1.2)*0.1;return this.points.map(p=>{const scaled=p.mul(breathingScale);return scaled.project3D(angles.x,angles.y,angles.z,angles.w);});}
  }
  
  class Tesseract5D {
    constructor(){this.vertices=[];this.edges=[];this.generate();}
    generate(){for(let i=0;i<10;i++){const coords=[0,0,0,0,0];const axis=i%5;const sign=Math.floor(i/5)===0?1.5:-1.5;coords[axis]=sign;this.vertices.push(new Vector5D(coords[0],coords[1],coords[2],coords[3],coords[4]));}for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){let dot=this.vertices[i].dot(this.vertices[j]);if(Math.abs(dot)<0.01)this.edges.push([i,j]);}}
    updateVertices(angles,time){const rotationEffect=Math.sin(time*0.5)*0.2;return this.vertices.map(v=>{const rotated=new Vector5D(v.x+rotationEffect*v.w,v.y+rotationEffect*v.v,v.z,v.w-rotationEffect*v.x,v.v-rotationEffect*v.y);return rotated.project3D(angles.x,angles.y,angles.z,angles.w);});}
  }
  
  class Hyperdonut5D {
    constructor(segments=200){this.vertices=[];this.generate(segments);}
    generate(segments){const R1=2.5,R2=1.2,R3=0.8,R4=0.5;for(let i=0;i<=segments;i++){const u=(i/segments)*Math.PI*2,cosU=Math.cos(u),sinU=Math.sin(u);for(let j=0;j<=segments;j++){const v=(j/segments)*Math.PI*2,cosV=Math.cos(v),sinV=Math.sin(v);for(let k=0;k<=Math.floor(segments/4);k++){const wAngle=(k/(segments/4))*Math.PI*2,cosW=Math.cos(wAngle),sinW=Math.sin(wAngle);const x=(R1+R2*cosU)*cosV,y=(R1+R2*cosU)*sinV,z=R2*sinU*cosW,wDim=R2*sinU*sinW,vDim=R3*Math.sin(u*2)*cosV+R4*sinU;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}}}
    updateVertices(angles,time){const twistFactor=Math.sin(time*0.7)*0.3;return this.vertices.map(v=>{const twisted=new Vector5D(v.x*Math.cos(twistFactor)-v.y*Math.sin(twistFactor),v.x*Math.sin(twistFactor)+v.y*Math.cos(twistFactor),v.z,v.w+twistFactor*0.5,v.v);return twisted.project3D(angles.x,angles.y,angles.z,angles.w);});}
  }
  
  class Hyperknot5D {
    constructor(resolution=2000){this.vertices=[];this.generate(resolution);}
    generate(resolution){const p=5,q=3;for(let i=0;i<=resolution;i++){const t=(i/resolution)*Math.PI*2,R=2.5,r=0.8;const x=(R+r*Math.cos(p*t))*Math.cos(q*t),y=(R+r*Math.cos(p*t))*Math.sin(q*t),z=r*Math.sin(p*t),wDim=r*Math.cos(p*t)*Math.sin(q*t*0.5),vDim=r*Math.sin(p*t*1.3)*Math.cos(q*t*0.7);this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map((v,i)=>{const t=(i/this.vertices.length)*Math.PI*2+time*0.5;const deformationScale=1+Math.sin(t*3)*0.2;const animated=v.mul(deformationScale);return animated.project3D(angles.x,angles.y,angles.z,angles.w);});}
  }
  
  class Hyperfield5D {
    constructor(particles=12000){this.particles=[];this.velocities=[];this.generate(particles);}
    generate(count){for(let i=0;i<count;i++){this.particles.push(new Vector5D((Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*8,(Math.random()-0.5)*8));this.velocities.push(new Vector5D((Math.random()-0.5)*0.025,(Math.random()-0.5)*0.025,(Math.random()-0.5)*0.025,(Math.random()-0.5)*0.015,(Math.random()-0.5)*0.015));}}
    update(angles,time){const center=new Vector5D(0,0,0,0,0);for(let i=0;i<this.particles.length;i++){const toCenter=center.sub(this.particles[i]);const force=toCenter.mul(0.002*(1+Math.sin(time*2)*0.5));const vortexForce=new Vector5D(-toCenter.y*0.001,toCenter.x*0.001,0,0,0);this.velocities[i]=this.velocities[i].add(force).add(vortexForce);this.velocities[i].x+=(Math.random()-0.5)*0.008;this.velocities[i].y+=(Math.random()-0.5)*0.008;this.velocities[i].z+=(Math.random()-0.5)*0.008;this.velocities[i].w+=(Math.random()-0.5)*0.005;this.velocities[i].v+=(Math.random()-0.5)*0.005;this.particles[i]=this.particles[i].add(this.velocities[i]);if(Math.abs(this.particles[i].x)>6)this.particles[i].x*=-0.95;if(Math.abs(this.particles[i].y)>6)this.particles[i].y*=-0.95;if(Math.abs(this.particles[i].z)>6)this.particles[i].z*=-0.95;if(Math.abs(this.particles[i].w)>5)this.particles[i].w*=-0.95;if(Math.abs(this.particles[i].v)>5)this.particles[i].v*=-0.95;}return this.particles.map(p=>p.project3D(angles.x+time*0.12,angles.y+time*0.08,angles.z+time*0.06,angles.w+time*0.04));}
  }

  class Hyperstar5D {
    constructor(points=3000){this.points=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const r=Math.pow(Math.random(),1.5)*3;const angles=[Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.acos(2*Math.random()-1)];const x=r*Math.sin(angles[4])*Math.cos(angles[0]),y=r*Math.sin(angles[4])*Math.sin(angles[0])*Math.cos(angles[1]),z=r*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.cos(angles[2]),wDim=r*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.sin(angles[2])*Math.cos(angles[3]),vDim=r*Math.sin(angles[4])*Math.sin(angles[0])*Math.sin(angles[1])*Math.sin(angles[2])*Math.sin(angles[3]);this.points.push(new Vector5D(x,y,z,wDim,vDim));}}
    updatePoints(angles,time){const scale=1+Math.sin(time*2)*0.3+Math.cos(time*1.5)*0.2;return this.points.map(p=>{const scaled=p.mul(scale);return scaled.project3D(angles.x+time*0.2,angles.y+time*0.15,angles.z+time*0.1,angles.w+time*0.05);});}
  }
  
  class Hyperwave5D {
    constructor(resolution=3000){this.vertices=[];this.generate(resolution);}
    generate(resolution){for(let i=0;i<=resolution;i++){const t=(i/resolution)*Math.PI*4,r=2;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*3)*1.5,wDim=Math.cos(t*2)*1.2,vDim=Math.sin(t*5)*0.8;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map((v,i)=>{const t=(i/this.vertices.length)*Math.PI*4+time,r=2+Math.sin(time)*0.5;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*3+time)*1.5,wDim=Math.cos(t*2+time*1.5)*1.2,vDim=Math.sin(t*5+time*2)*0.8;const animated=new Vector5D(x,y,z,wDim,vDim);return animated.project3D(angles.x+time,angles.y+time*0.7,angles.z+time*0.5,angles.w+time*0.3);});}
  }
  
  class Hyperfractal5D {
    constructor(depth=4){this.vertices=[];this.generateFractal(new Vector5D(0,0,0,0,0),1.5,depth);}
    generateFractal(pos,size,depth){if(depth===0){this.vertices.push(pos);return;}const offsets=[[-size,-size,-size,-size,-size],[size,-size,-size,-size,-size],[-size,size,-size,-size,-size],[size,size,-size,-size,-size],[-size,-size,size,-size,-size],[size,-size,size,-size,-size],[-size,size,size,-size,-size],[size,size,size,-size,-size],[-size,-size,-size,size,-size],[size,-size,-size,size,-size],[-size,size,-size,size,-size],[size,size,-size,size,-size],[-size,-size,size,size,-size],[size,-size,size,size,-size],[-size,size,size,size,-size],[size,size,size,size,-size]];for(let offset of offsets){const newPos=pos.add(new Vector5D(offset[0],offset[1],offset[2],offset[3],offset[4]));this.generateFractal(newPos,size*0.5,depth-1);}}
    updateVertices(angles,time){const scalePulse=1+Math.sin(time*0.5)*0.3;return this.vertices.map(v=>{const scaled=v.mul(scalePulse);return scaled.project3D(angles.x+time*0.1,angles.y+time*0.08,angles.z+time*0.06,angles.w+time*0.04);});}
  }
  
  class Hypervortex5D {
    constructor(points=8000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const r=Math.pow(Math.random(),0.7)*3.5;const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1),psi=Math.random()*Math.PI*2,omega=Math.random()*Math.PI*2;const x=r*Math.sin(phi)*Math.cos(theta),y=r*Math.sin(phi)*Math.sin(theta)*Math.cos(psi),z=r*Math.sin(phi)*Math.sin(theta)*Math.sin(psi)*Math.cos(omega),wDim=r*Math.sin(phi)*Math.sin(theta)*Math.sin(psi)*Math.sin(omega),vDim=r*Math.cos(phi)*Math.sin(theta*2);this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map(v=>{const spiral=v.mul(1+Math.sin(time*2)*0.2);return spiral.project3D(angles.x+time*0.3,angles.y+time*0.2,angles.z+time*0.15,angles.w+time*0.1);});}
  }
  
  class Hyperflower5D {
    constructor(points=6000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const t=Math.random()*Math.PI*2,r=2+Math.sin(t*7)*0.8;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*5)*1.2,wDim=Math.cos(t*8)*0.9,vDim=Math.sin(t*12)*0.6;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map((v,i)=>{const t=(i/this.vertices.length)*Math.PI*2+time,r=2+Math.sin(t*7+time*3)*0.8;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*5+time*2)*1.2,wDim=Math.cos(t*8+time*4)*0.9,vDim=Math.sin(t*12+time*5)*0.6;const animated=new Vector5D(x,y,z,wDim,vDim);return animated.project3D(angles.x+time*0.2,angles.y+time*0.15,angles.z+time*0.1,angles.w+time*0.05);});}
  }
  
  class Hypermatrix5D {
    constructor(size=3){this.vertices=[];for(let i=-size;i<=size;i++)for(let j=-size;j<=size;j++)for(let k=-size;k<=size;k++)for(let l=-size;l<=size;l++)for(let m=-size;m<=size;m++){if(Math.abs(i)===size||Math.abs(j)===size||Math.abs(k)===size||Math.abs(l)===size||Math.abs(m)===size){this.vertices.push(new Vector5D(i*0.6,j*0.6,k*0.6,l*0.6,m*0.6));}}}
    updateVertices(angles,time){return this.vertices.map(v=>{const scaled=v.mul(1+Math.sin(time)*0.1);return scaled.project3D(angles.x+time*0.15,angles.y+time*0.1,angles.z+time*0.08,angles.w+time*0.05);});}
  }
  
  class Hyperrainbow5D {
    constructor(points=5000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const t=Math.random()*Math.PI*2,r=2.5;const x=r*Math.sin(t),y=r*Math.cos(t),z=r*Math.sin(t*2),wDim=r*Math.cos(t*2),vDim=r*Math.sin(t*3);this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map((v,i)=>{const t=(i/this.vertices.length)*Math.PI*2+time,r=2.5+Math.sin(time*4)*0.3;const x=r*Math.sin(t),y=r*Math.cos(t),z=r*Math.sin(t*2+time),wDim=r*Math.cos(t*2+time*1.5),vDim=r*Math.sin(t*3+time*2);const animated=new Vector5D(x,y,z,wDim,vDim);return animated.project3D(angles.x+time*0.25,angles.y+time*0.18,angles.z+time*0.12,angles.w+time*0.08);});}
  }
  
  class Hypergalaxy5D {
    constructor(points=10000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const arm=i%5;const angleOffset=arm*Math.PI*2/5;const r=Math.pow(Math.random(),1.2)*4;const theta=r*8+angleOffset+(Math.random()-0.5)*0.5;const phi=Math.acos(2*Math.random()-1);const x=Math.cos(theta)*r*Math.sin(phi),y=Math.sin(theta)*r*Math.sin(phi),z=Math.cos(phi)*r*0.5,wDim=Math.sin(theta*2)*r*0.4,vDim=Math.cos(theta*1.5)*r*0.3;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map(v=>v.project3D(angles.x+time*0.08,angles.y+time*0.06,angles.z+time*0.04,angles.w+time*0.03));}
  }

  class Hyperquantum5D {
    constructor(points=7000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const r=-Math.log(1-Math.random())*1.5;const theta=Math.random()*Math.PI*2,phi=Math.random()*Math.PI,psi=Math.random()*Math.PI*2,omega=Math.random()*Math.PI*2;const x=r*Math.sin(phi)*Math.cos(theta)*Math.cos(psi),y=r*Math.sin(phi)*Math.sin(theta)*Math.cos(omega),z=r*Math.cos(phi)*Math.sin(psi),wDim=r*Math.sin(phi)*Math.sin(psi)*Math.cos(omega),vDim=r*Math.cos(phi)*Math.cos(psi)*Math.sin(omega);this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map(v=>{const quantumShift=Math.sin(time*3)*0.3;const shifted=new Vector5D(v.x+quantumShift*v.w,v.y+quantumShift*v.v,v.z,v.w-quantumShift*v.x,v.v-quantumShift*v.y);return shifted.project3D(angles.x+Math.sin(time)*0.3,angles.y+Math.cos(time*0.7)*0.2,angles.z+Math.sin(time*0.5)*0.15,angles.w+Math.cos(time*0.3)*0.1);});}
  }
  
  class Hyperhelix5D {
    constructor(points=4000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const t=(i/count)*Math.PI*8,r=2+Math.sin(t*0.5)*0.5;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*3)*1.5,wDim=Math.cos(t*4)*1.0,vDim=Math.sin(t*6)*0.7;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map((v,i)=>{const t=(i/this.vertices.length)*Math.PI*8+time*2,r=2+Math.sin(t*0.5+time)*0.5;const x=r*Math.cos(t),y=r*Math.sin(t),z=Math.sin(t*3+time*1.5)*1.5,wDim=Math.cos(t*4+time*2)*1.0,vDim=Math.sin(t*6+time*3)*0.7;const animated=new Vector5D(x,y,z,wDim,vDim);return animated.project3D(angles.x+time*0.5,angles.y+time*0.4,angles.z+time*0.3,angles.w+time*0.2);});}
  }
  
  class Hypercrystal5D {
    constructor(points=5000){this.vertices=[];this.generate(points);}
    generate(count){const latticeSize=3;for(let i=0;i<count;i++){const x=(Math.floor(Math.random()*latticeSize)-latticeSize/2)*0.8,y=(Math.floor(Math.random()*latticeSize)-latticeSize/2)*0.8,z=(Math.floor(Math.random()*latticeSize)-latticeSize/2)*0.8,wDim=(Math.floor(Math.random()*latticeSize)-latticeSize/2)*0.8,vDim=(Math.floor(Math.random()*latticeSize)-latticeSize/2)*0.8;this.vertices.push(new Vector5D(x+(Math.random()-0.5)*0.2,y+(Math.random()-0.5)*0.2,z+(Math.random()-0.5)*0.2,wDim+(Math.random()-0.5)*0.2,vDim+(Math.random()-0.5)*0.2));}}
    updateVertices(angles,time){const crystalPhase=Math.sin(time*0.8)*0.3;return this.vertices.map(v=>{const phased=new Vector5D(v.x+crystalPhase*v.w,v.y+crystalPhase*v.v,v.z,v.w-crystalPhase*v.x,v.v-crystalPhase*v.y);return phased.project3D(angles.x+crystalPhase,angles.y+crystalPhase*0.7,angles.z+crystalPhase*0.5,angles.w+crystalPhase*0.3);});}
  }
  
  class Hypernebula5D {
    constructor(points=15000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const cluster=Math.floor(Math.random()*3);const offsetX=(cluster-1)*3,offsetY=Math.sin(cluster*Math.PI*2/3)*3;const r=Math.pow(Math.random(),2)*2;const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);const x=r*Math.sin(phi)*Math.cos(theta)+offsetX,y=r*Math.sin(phi)*Math.sin(theta)+offsetY,z=r*Math.cos(phi),wDim=Math.sin(theta*2)*r*0.5,vDim=Math.cos(phi*2)*r*0.5;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map(v=>{const nebulaFlow=Math.sin(time*0.5)*0.4;const distorted=new Vector5D(v.x+nebulaFlow*Math.sin(v.y*0.5),v.y+nebulaFlow*Math.cos(v.x*0.5),v.z,v.w*(1+nebulaFlow*0.3),v.v*(1+nebulaFlow*0.2));return distorted.project3D(angles.x+time*0.1,angles.y+time*0.08,angles.z+time*0.06,angles.w+time*0.04);});}
  }
  
  class Hypermetaverse5D {
    constructor(points=9000){this.vertices=[];this.generate(points);}
    generate(count){for(let i=0;i<count;i++){const network=Math.floor(Math.random()*4);const angle=network*Math.PI/2;const r=Math.pow(Math.random(),0.8)*3;const theta=Math.random()*Math.PI*2+angle,phi=Math.random()*Math.PI;const x=r*Math.sin(phi)*Math.cos(theta),y=r*Math.sin(phi)*Math.sin(theta),z=r*Math.cos(phi)*Math.cos(theta*0.5),wDim=r*Math.sin(theta*2)*0.6,vDim=r*Math.cos(phi*2)*0.6;this.vertices.push(new Vector5D(x,y,z,wDim,vDim));}}
    updateVertices(angles,time){return this.vertices.map(v=>{const metaversePhase=Math.sin(time*1.2)*0.5;const transformed=new Vector5D(v.x*Math.cos(metaversePhase)-v.w*Math.sin(metaversePhase),v.y*Math.cos(metaversePhase)-v.v*Math.sin(metaversePhase),v.z,v.x*Math.sin(metaversePhase)+v.w*Math.cos(metaversePhase),v.y*Math.sin(metaversePhase)+v.v*Math.cos(metaversePhase));return transformed.project3D(angles.x+metaversePhase,angles.y+metaversePhase*0.8,angles.z+metaversePhase*0.6,angles.w+metaversePhase*0.4);});}
  }

  // ==================== ADDON: PIXEL ANIMATION SYSTEM ====================
  class PixelAnimation {
    constructor(width = 200, height = 150) {
      this.width = width;
      this.height = height;
      this.pixelCount = width * height;
      this.pixels = new Float64Array(this.pixelCount * 6);
      this.time = 0;
      this.functions = [];
    }
    
    addFunction(fn) {
      this.functions.push(fn);
      return this;
    }
    
    update(time) {
      this.time = time;
      const invW = 1 / this.width;
      const invH = 1 / this.height;
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (y * this.width + x) * 6;
          const u = (x * invW - 0.5) * 2;
          const v = (y * invH - 0.5) * 2;
          
          let px = u * 4;
          let py = v * 3;
          let pz = 0;
          let pr = 0.5;
          let pg = 0.5;
          let pb = 0.8;
          
          for (const fn of this.functions) {
            const result = fn(u, v, time, x, y);
            if (result) {
              if (result.x !== undefined) px = result.x;
              if (result.y !== undefined) py = result.y;
              if (result.z !== undefined) pz = result.z;
              if (result.r !== undefined) pr = result.r;
              if (result.g !== undefined) pg = result.g;
              if (result.b !== undefined) pb = result.b;
            }
          }
          
          this.pixels[idx] = px;
          this.pixels[idx + 1] = py;
          this.pixels[idx + 2] = pz;
          this.pixels[idx + 3] = pr;
          this.pixels[idx + 4] = pg;
          this.pixels[idx + 5] = pb;
        }
      }
      return this.pixels;
    }
    
    getProjectedVertices(angles) {
      const verts = [];
      for (let i = 0; i < this.pixelCount; i++) {
        const idx = i * 6;
        const vec = new Vector5D(this.pixels[idx], this.pixels[idx+1], this.pixels[idx+2], 0, 0);
        const proj = vec.project3D(angles.x, angles.y, angles.z, angles.w);
        proj.r = this.pixels[idx + 3];
        proj.g = this.pixels[idx + 4];
        proj.b = this.pixels[idx + 5];
        verts.push(proj);
      }
      return verts;
    }
    
    getVertexCount() {
      return this.pixelCount;
    }
  }

  function createPixelWave() {
    const anim = new PixelAnimation(200, 150);
    anim.addFunction((u, v, time) => {
      const dist = Math.sqrt(u * u + v * v);
      const z = Math.sin(dist * 5 - time * 2) * 1.5;
      const r = Math.sin(dist * 3 + time) * 0.5 + 0.5;
      const g = Math.cos(dist * 4 + time * 1.3) * 0.5 + 0.5;
      const b = Math.sin(dist * 5 + time * 0.7) * 0.5 + 0.5;
      return { x: u * 3, y: v * 2.5, z, r, g, b };
    });
    return anim;
  }

  function createPixelTorus() {
    const anim = new PixelAnimation(200, 150);
    anim.addFunction((u, v, time) => {
      const R = 2;
      const r = 0.6;
      const theta = Math.atan2(v, u);
      const dist = Math.sqrt(u * u + v * v);
      const phi = Math.atan2(dist - R, 0.001);
      const x = (R + r * Math.cos(phi + time)) * Math.cos(theta);
      const y = (R + r * Math.cos(phi + time)) * Math.sin(theta);
      const z = r * Math.sin(phi + time);
      return {
        x, y, z,
        r: 0.3 + Math.cos(theta) * 0.4,
        g: 0.5 + Math.sin(phi) * 0.4,
        b: 0.7 + Math.cos(theta + phi) * 0.3
      };
    });
    return anim;
  }

  function createPixelFractal() {
    const anim = new PixelAnimation(200, 150);
    anim.addFunction((u, v, time) => {
      let zx = u * 2;
      let zy = v * 2;
      let iter = 0;
      const cx = u * 1.5 + Math.sin(time * 0.3) * 0.5;
      const cy = v * 1.5 + Math.cos(time * 0.4) * 0.5;
      for (let i = 0; i < 12; i++) {
        const xt = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = xt;
        if (zx * zx + zy * zy > 4) break;
        iter++;
      }
      const t = iter / 12;
      return {
        x: u * 3,
        y: v * 3,
        z: Math.sin(t * Math.PI) * 2,
        r: t,
        g: t * 0.6,
        b: 1 - t
      };
    });
    return anim;
  }

   // ==================== ADDON: ADVANCED MATH ANIMATION SYSTEM ====================
  class MathAnimation {
    constructor(config = {}) {
      this.name = config.name || 'custom_math';
      this.shapes = [];
      this.transitions = [];
      this.equations = [];
      this.particles = [];
      this.fonts = [];
      this.shaders = [];
      this.time = 0;
      this.vertices = [];
      this.resolution = this.detectPerformanceTier(config.resolution);
      this.useComputeShaders = this.detectGPUCompatibility();
      this.performanceTier = this.calculatePerformanceTier();
      this.adaptiveQuality = true;
      this.frameSkip = 0;
      this.lastFrameTime = 0;
    }
    
    // ==================== PERFORMANCE DETECTION ====================
    detectPerformanceTier(requestedResolution) {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) {
        return Math.min(requestedResolution || 2000, 1000); // Ultra-low for no GPU
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
      
      // Detect GPU tier
      if (renderer.includes('RTX') || renderer.includes('RX 7') || renderer.includes('Arc')) {
        return requestedResolution || 50000; // High-end
      } else if (renderer.includes('GTX') || renderer.includes('RX 6') || renderer.includes('Radeon')) {
        return requestedResolution || 20000; // Mid-range
      } else if (renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno')) {
        return requestedResolution || 5000; // Integrated/Mobile
      }
      
      return requestedResolution || 10000; // Default
    }
    
    detectGPUCompatibility() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl) return false;
        
        const ext = gl.getExtension('EXT_color_buffer_float');
        const ext2 = gl.getExtension('OES_texture_float');
        return !!(ext && ext2);
      } catch(e) {
        return false;
      }
    }
    
    calculatePerformanceTier() {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return 'minimal';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      if (renderer.includes('RTX 40') || renderer.includes('RX 79')) return 'ultra';
      if (renderer.includes('RTX 30') || renderer.includes('RX 7') || renderer.includes('RX 6')) return 'high';
      if (renderer.includes('RTX 20') || renderer.includes('GTX 16') || renderer.includes('GTX 10')) return 'medium';
      if (renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno')) return 'low';
      return 'medium';
    }
    
    getAdaptiveResolution() {
      const tiers = {
        'ultra': this.resolution,
        'high': Math.floor(this.resolution * 0.8),
        'medium': Math.floor(this.resolution * 0.5),
        'low': Math.floor(this.resolution * 0.25),
        'minimal': Math.floor(this.resolution * 0.1)
      };
      return tiers[this.performanceTier] || this.resolution;
    }
    
    getAdaptiveFrameSkip() {
      const skips = { 'ultra': 0, 'high': 0, 'medium': 0, 'low': 1, 'minimal': 2 };
      return skips[this.performanceTier] || 0;
    }
    
    // ==================== SHAPE SYSTEM ====================
    addShape(equationFn, colorFn, options = {}) {
      this.shapes.push({
        equation: equationFn,
        color: colorFn || ((t, time, i, count) => [1, 1, 1, 1]),
        options: {
          blendMode: options.blendMode || 'additive',
          depthWrite: options.depthWrite !== false,
          transformations: options.transformations || [],
          morphTargets: options.morphTargets || [],
          instancing: options.instancing || 1
        }
      });
      return this;
    }
    
    // ==================== EQUATION SYSTEM ====================
    addEquation(fn, colorFn, options = {}) {
      this.equations.push({
        fn: fn,
        color: colorFn || ((t, time, i, count) => [1, 1, 1, 1]),
        options: {
          domain: options.domain || { t: [0, 1], x: [-5, 5], y: [-5, 5], z: [-5, 5] },
          precision: options.precision || 0.001,
          parametricSurface: options.parametricSurface || false,
          implicitSurface: options.implicitSurface || false
        }
      });
      return this;
    }
    
    // ==================== TRANSITION SYSTEM ====================
    addTransition(fromFn, toFn, duration, easingFn, options = {}) {
      this.transitions.push({
        from: fromFn,
        to: toFn,
        duration: duration || 2,
        easing: easingFn || this.easings[options.easing] || ((t) => t),
        startTime: this.time,
        options: {
          morphColors: options.morphColors || false,
          crossfade: options.crossfade || false,
          stagger: options.stagger || 0,
          staggerDirection: options.staggerDirection || 'forward'
        }
      });
      return this;
    }
    
    // ==================== PARTICLE SYSTEM ====================
    addParticleSystem(config = {}) {
      const particleConfig = {
        count: config.count || 1000,
        spawnShape: config.spawnShape || 'sphere',
        lifetime: config.lifetime || 5,
        velocity: config.velocity || (() => ({ x: 0, y: 0, z: 0 })),
        acceleration: config.acceleration || (() => ({ x: 0, y: 0, z: 0 })),
        color: config.color || ((life) => [1, 1, 1, 1 - life]),
        size: config.size || ((life) => Math.max(0.1, 1 - life)),
        emitRate: config.emitRate || 100,
        emitterShape: config.emitterShape || { type: 'point', position: { x: 0, y: 0, z: 0 } }
      };
      
      this.particles.push({
        config: particleConfig,
        active: [],
        pool: [],
        burstCache: []
      });
      return this;
    }
    
    // ==================== FONT/TEXT SYSTEM ====================
    addText(text, fontConfig = {}) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const fontSize = fontConfig.size || 48;
      const fontFamily = fontConfig.family || 'monospace';
      const fontWeight = fontConfig.weight || 'bold';
      
      canvas.width = fontSize * text.length * 2;
      canvas.height = fontSize * 2;
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, fontSize, fontSize);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = [];
      
      for (let y = 0; y < canvas.height; y += fontConfig.resolution || 4) {
        for (let x = 0; x < canvas.width; x += fontConfig.resolution || 4) {
          const idx = (y * canvas.width + x) * 4;
          if (imageData.data[idx + 3] > 128) {
            const u = (x / canvas.width) * 2 - 1;
            const v = -(y / canvas.height) * 2 + 1;
            pixels.push({
              x: u * (fontConfig.width || 3),
              y: v * (fontConfig.height || 2),
              z: (Math.random() - 0.5) * (fontConfig.depth || 0.3)
            });
          }
        }
      }
      
      this.fonts.push({
        text: text,
        config: fontConfig,
        pixels: pixels,
        position: fontConfig.position || { x: 0, y: 0, z: 0 },
        rotation: fontConfig.rotation || { x: 0, y: 0, z: 0 }
      });
      return this;
    }
    
    // ==================== SHADER TOY-LIKE SYSTEM ====================
    addShaderFragment(shaderCode, uniforms = {}) {
      this.shaders.push({
        code: shaderCode,
        uniforms: uniforms,
        compiled: false,
        program: null
      });
      return this;
    }
    
    // ==================== EASING FUNCTIONS ====================
    easings = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => (--t) * t * t + 1,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInElastic: (t) => Math.sin(13 * Math.PI * t) * Math.pow(2, 10 * (t - 1)),
      easeOutElastic: (t) => Math.sin(-13 * Math.PI * (t + 1)) * Math.pow(2, -10 * t) + 1,
      easeInBounce: (t) => 1 - this.easings.easeOutBounce(1 - t),
      easeOutBounce: (t) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      },
      smoothstep: (t) => t * t * (3 - 2 * t),
      smootherstep: (t) => t * t * t * (t * (t * 6 - 15) + 10)
    };
    
    // ==================== MATHEMATICAL TRANSFORMATIONS ====================
    transformations = {
      // 5D Transformations
      rotate5D: (point, angles) => {
        return new Vector5D(
          point.x * Math.cos(angles.x) - point.y * Math.sin(angles.y),
          point.x * Math.sin(angles.y) + point.y * Math.cos(angles.x),
          point.z * Math.cos(angles.z) - point.w * Math.sin(angles.w),
          point.z * Math.sin(angles.w) + point.w * Math.cos(angles.z),
          point.v || 0
        );
      },
      
      // Fourier Series Deformation
      fourierDeform: (point, coefficients, time) => {
        let dx = 0, dy = 0, dz = 0;
        for (let n = 0; n < Math.min(coefficients.length, 10); n++) {
          const c = coefficients[n] || 0;
          dx += c * Math.sin(n * point.x + time * n * 0.5);
          dy += c * Math.cos(n * point.y + time * n * 0.3);
          dz += c * Math.sin(n * point.z + time * n * 0.7);
        }
        return {
          x: point.x + dx * 0.1,
          y: point.y + dy * 0.1,
          z: point.z + dz * 0.1,
          w: point.w || 0,
          v: point.v || 0
        };
      },
      
      // Julia Set Displacement
      juliaDisplace: (point, cx, cy, iterations = 8) => {
        let zx = point.x, zy = point.y;
        for (let i = 0; i < iterations; i++) {
          const xt = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = xt;
        }
        const mag = Math.sqrt(zx * zx + zy * zy);
        return {
          x: point.x + zx * 0.1,
          y: point.y + zy * 0.1,
          z: point.z + Math.sin(mag) * 0.5
        };
      },
      
      // Reaction-Diffusion Pattern
      reactionDiffusion: (point, time, feed = 0.055, kill = 0.062) => {
        const laplacian = (point.x * point.x + point.y * point.y) * 0.25;
        const reaction = feed * (1 - point.x) - kill * point.y;
        return {
          x: point.x + laplacian * 0.1 + Math.cos(time) * 0.05,
          y: point.y + reaction * 0.1,
          z: point.z
        };
      },
      
      // Wave Equation Displacement
      waveDeform: (point, time, frequency = 3, amplitude = 0.5) => {
        const dist = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
        const wave = Math.sin(dist * frequency - time * 2) * amplitude;
        return {
          x: point.x + wave * Math.cos(Math.atan2(point.y, point.x)),
          y: point.y + wave * Math.sin(Math.atan2(point.y, point.x)),
          z: point.z + wave * 0.5,
          w: point.w || 0 + Math.cos(dist * 2 + time) * amplitude * 0.3,
          v: point.v || 0 + Math.sin(dist * 3 - time) * amplitude * 0.2
        };
      },
      
      // 5D Möbius Transform
      mobius5D: (point, params = { a: 1, b: 0, c: 0, d: 1 }) => {
        const { a, b, c, d } = params;
        const denominator = c * point.x + d;
        if (Math.abs(denominator) < 0.001) return point;
        return {
          x: (a * point.x + b) / denominator,
          y: point.y / denominator,
          z: point.z / denominator,
          w: (point.w || 0) / denominator,
          v: (point.v || 0) / denominator
        };
      }
    };
    
    // ==================== UPDATE SYSTEM ====================
    update(time) {
      const now = performance.now();
      const dt = now - this.lastFrameTime;
      this.lastFrameTime = now;
      
      // Adaptive frame skipping for low-end devices
      this.frameSkip++;
      if (this.frameSkip <= this.getAdaptiveFrameSkip() && this.adaptiveQuality) {
        return this.vertices;
      }
      this.frameSkip = 0;
      
      this.time = time;
      this.vertices = [];
      const adaptiveRes = this.getAdaptiveResolution();
      
      // Process shapes
      for (const shape of this.shapes) {
        const count = Math.floor(adaptiveRes / Math.max(1, this.shapes.length + this.equations.length));
        for (let i = 0; i < count; i++) {
          const t = i / count;
          let result = shape.equation(t, time, i, count);
          if (result) {
            // Apply transformations
            if (shape.options.transformations) {
              for (const trans of shape.options.transformations) {
                if (this.transformations[trans.type]) {
                  result = this.transformations[trans.type](result, trans.params || {}, time);
                }
              }
            }
            result.color = shape.color(t, time, i, count);
            this.vertices.push(result);
          }
        }
      }
      
      // Process equations with advanced mathematical domains
      for (const eq of this.equations) {
        const count = Math.floor(adaptiveRes / Math.max(1, this.shapes.length + this.equations.length));
        const domain = eq.options.domain || { t: [0, 1], x: [-5, 5], y: [-5, 5], z: [-5, 5] };
        
        for (let i = 0; i < count; i++) {
          const t = domain.t[0] + (i / count) * (domain.t[1] - domain.t[0]);
          
          if (eq.options.parametricSurface) {
            // u-v parametric surface
            const uSteps = Math.floor(Math.sqrt(count));
            const vSteps = uSteps;
            const ui = Math.floor(i / vSteps);
            const vi = i % vSteps;
            const u = domain.x[0] + (ui / uSteps) * (domain.x[1] - domain.x[0]);
            const v = domain.y[0] + (vi / vSteps) * (domain.y[1] - domain.y[0]);
            const result = eq.fn({ u, v, t }, time, i, count);
            if (result) {
              result.color = eq.color({ u, v, t }, time, i, count);
              this.vertices.push(result);
            }
          } else if (eq.options.implicitSurface) {
            // Marching cubes-like approximation
            const result = eq.fn(t, time, i, count);
            if (result) {
              result.color = eq.color(t, time, i, count);
              this.vertices.push(result);
            }
          } else {
            const result = eq.fn(t, time, i, count);
            if (result) {
              result.color = eq.color(t, time, i, count);
              this.vertices.push(result);
            }
          }
        }
      }
      
      // Process transitions
      for (const trans of this.transitions) {
        const elapsed = time - trans.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / trans.duration));
        const easedProgress = trans.easing(progress);
        const count = Math.floor(adaptiveRes / Math.max(1, this.transitions.length));
        
        for (let i = 0; i < count; i++) {
          const t = i / count;
          const staggerOffset = trans.options.stagger > 0 
            ? (trans.options.staggerDirection === 'forward' ? t : 1 - t) * trans.options.stagger
            : 0;
          const adjustedProgress = Math.min(1, Math.max(0, easedProgress + staggerOffset));
          
          const fromResult = trans.from(t, time, i, count);
          const toResult = trans.to(t, time, i, count);
          
          if (fromResult && toResult) {
            const result = {
              x: fromResult.x + (toResult.x - fromResult.x) * adjustedProgress,
              y: fromResult.y + (toResult.y - fromResult.y) * adjustedProgress,
              z: fromResult.z + (toResult.z - fromResult.z) * adjustedProgress,
              w: (fromResult.w || 0) + ((toResult.w || 0) - (fromResult.w || 0)) * adjustedProgress,
              v: (fromResult.v || 0) + ((toResult.v || 0) - (fromResult.v || 0)) * adjustedProgress
            };
            
            if (trans.options.morphColors && fromResult.color && toResult.color) {
              result.color = fromResult.color.map((c, idx) => 
                c + (toResult.color[idx] - c) * adjustedProgress
              );
            } else {
              result.color = [0.5 + adjustedProgress * 0.5, 0.3 + adjustedProgress * 0.4, 1 - adjustedProgress * 0.5, 1];
            }
            
            this.vertices.push(result);
          }
        }
      }
      
      // Process particles
      for (const particleSystem of this.particles) {
        const config = particleSystem.config;
        
        // Emit new particles
        if (particleSystem.active.length < config.count && Math.random() < config.emitRate / 60) {
          for (let i = 0; i < Math.min(config.emitRate, 10); i++) {
            const particle = {
              position: this.generateParticlePosition(config.spawnShape),
              velocity: config.velocity(time),
              life: 1,
              maxLife: config.lifetime + Math.random()
            };
            particleSystem.active.push(particle);
          }
        }
        
        // Update particles
        for (let i = particleSystem.active.length - 1; i >= 0; i--) {
          const p = particleSystem.active[i];
          p.life -= dt / p.maxLife;
          
          if (p.life <= 0) {
            particleSystem.active.splice(i, 1);
            continue;
          }
          
          const accel = config.acceleration(time);
          p.velocity.x += (accel.x || 0) * dt;
          p.velocity.y += (accel.y || 0) * dt;
          p.velocity.z += (accel.z || 0) * dt;
          
          p.position.x += p.velocity.x * dt * 60;
          p.position.y += p.velocity.y * dt * 60;
          p.position.z += p.velocity.z * dt * 60;
          
          const color = config.color(p.life);
          this.vertices.push({
            x: p.position.x,
            y: p.position.y,
            z: p.position.z,
            color: [color[0], color[1], color[2], color[3] || 1]
          });
        }
      }
      
      // Process fonts
      for (const font of this.fonts) {
        for (const pixel of font.pixels) {
          // Apply rotation and position
          const cosX = Math.cos(font.rotation.x || 0);
          const sinX = Math.sin(font.rotation.x || 0);
          const cosY = Math.cos(font.rotation.y || 0);
          const sinY = Math.sin(font.rotation.y || 0);
          
          const x = pixel.x * cosY - pixel.z * sinY;
          const z = pixel.x * sinY + pixel.z * cosY;
          const y = pixel.y * cosX - z * sinX;
          
          this.vertices.push({
            x: x + (font.position.x || 0),
            y: y + (font.position.y || 0),
            z: z + (font.position.z || 0),
            color: font.config.color || [1, 1, 1, 1]
          });
        }
      }
      
      return this.vertices;
    }
    
    generateParticlePosition(shape) {
      switch(shape) {
        case 'sphere':
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = Math.random() * 2;
          return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi)
          };
        case 'ring':
          const angle = Math.random() * Math.PI * 2;
          return { x: Math.cos(angle) * 2, y: Math.sin(angle) * 2, z: 0 };
        case 'cube':
          return {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4,
            z: (Math.random() - 0.5) * 4
          };
        default:
          return { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 4 };
      }
    }
    
    getProjectedVertices(angles) {
      return this.vertices.map(v => {
        const vec = new Vector5D(v.x || 0, v.y || 0, v.z || 0, v.w || 0, v.v || 0);
        const proj = vec.project3D(angles.x, angles.y, angles.z, angles.w);
        if (v.color) {
          proj.r = v.color[0];
          proj.g = v.color[1];
          proj.b = v.color[2];
        } else {
          proj.r = 0.5;
          proj.g = 0.5;
          proj.b = 0.8;
        }
        return proj;
      });
    }
  }
  // ==================== WebGL Fallback Renderer ====================
  class WebGL5DRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.gl = null;
      this.vertexCount = 0;
    }
    init() {
      this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) return false;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
      const vsSource = `attribute vec3 aPosition;attribute vec4 aColor;varying vec4 vColor;uniform mat4 uModelViewMatrix;uniform mat4 uProjectionMatrix;uniform float uTime;void main(){gl_PointSize=3.0+sin(uTime+aPosition.x*2.0)*1.5;gl_Position=uProjectionMatrix*uModelViewMatrix*vec4(aPosition,1.0);vColor=aColor;}`;
      const fsSource = `precision mediump float;varying vec4 vColor;uniform float uTime;void main(){float dist=length(gl_PointCoord-vec2(0.5));float alpha=1.0-smoothstep(0.0,0.5,dist);gl_FragColor=vColor*alpha;}`;
      const vertexShader = this.compileShader(this.gl, vsSource, this.gl.VERTEX_SHADER);
      const fragmentShader = this.compileShader(this.gl, fsSource, this.gl.FRAGMENT_SHADER);
      this.program = this.gl.createProgram();
      this.gl.attachShader(this.program, vertexShader);
      this.gl.attachShader(this.program, fragmentShader);
      this.gl.linkProgram(this.program);
      this.gl.useProgram(this.program);
      this.positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
      this.colorLoc = this.gl.getAttribLocation(this.program, 'aColor');
      this.modelViewLoc = this.gl.getUniformLocation(this.program, 'uModelViewMatrix');
      this.projectionLoc = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
      this.timeLoc = this.gl.getUniformLocation(this.program, 'uTime');
      this.vertexBuffer = this.gl.createBuffer();
      this.colorBuffer = this.gl.createBuffer();
      return true;
    }
    compileShader(gl, source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }
    updateGeometry(vertices3D, colors) {
      if (!vertices3D || vertices3D.length === 0) return;
      const positions = [];
      const colorData = [];
      for (let i = 0; i < vertices3D.length; i++) {
        positions.push(vertices3D[i].x, vertices3D[i].y, vertices3D[i].z);
        const col = colors[i % colors.length];
        colorData.push(col[0], col[1], col[2], col[3] || 1.0);
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colorData), this.gl.DYNAMIC_DRAW);
      this.vertexCount = vertices3D.length;
    }
    render(viewMatrix, projectionMatrix, time) {
      if (this.vertexCount === 0) return;
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.enableVertexAttribArray(this.positionLoc);
      this.gl.vertexAttribPointer(this.positionLoc, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.enableVertexAttribArray(this.colorLoc);
      this.gl.vertexAttribPointer(this.colorLoc, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.uniformMatrix4fv(this.modelViewLoc, false, viewMatrix);
      this.gl.uniformMatrix4fv(this.projectionLoc, false, projectionMatrix);
      this.gl.uniform1f(this.timeLoc, time);
      this.gl.drawArrays(this.gl.POINTS, 0, this.vertexCount);
    }
    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  // ==================== WebGPU5DRenderer ====================
  if (navigator.gpu) {
    class WebGPU5DRenderer {
      constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.vertexCount = 0;
        this.vertexBuffer = null;
      }
      async init() {
        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter.requestDevice();
        this.context = this.canvas.getContext('webgpu');
        const format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({ device: this.device, format: format, alphaMode: 'premultiplied' });
        const shaderModule = this.device.createShaderModule({ code: `struct VertexOut{@builtin(position) position:vec4<f32>,@location(0) color:vec4<f32>,}@vertex fn vertexMain(@location(0) pos:vec3<f32>,@location(1) col:vec4<f32>)->VertexOut{var output:VertexOut;output.position=vec4<f32>(pos,1.0);output.color=col;return output;}@fragment fn fragmentMain(input:VertexOut)->@location(0) vec4<f32>{return input.color;}` });
        this.pipeline = this.device.createRenderPipeline({ layout: 'auto', vertex: { module: shaderModule, entryPoint: 'vertexMain', buffers: [{ arrayStride: 28, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }, { shaderLocation: 1, offset: 12, format: 'float32x4' }] }] }, fragment: { module: shaderModule, entryPoint: 'fragmentMain', targets: [{ format: format }] }, primitive: { topology: 'point-list' } });
      }
      updateGeometry(vertices3D, colors) {
        if (!vertices3D || vertices3D.length === 0) return;
        const vertexData = new Float32Array(vertices3D.length * 7);
        for (let i = 0; i < vertices3D.length; i++) {
          vertexData[i * 7] = vertices3D[i].x;
          vertexData[i * 7 + 1] = vertices3D[i].y;
          vertexData[i * 7 + 2] = vertices3D[i].z;
          const col = colors[i % colors.length];
          vertexData[i * 7 + 3] = col[0];
          vertexData[i * 7 + 4] = col[1];
          vertexData[i * 7 + 5] = col[2];
          vertexData[i * 7 + 6] = col[3] || 1;
        }
        if (this.vertexBuffer) this.vertexBuffer.destroy();
        this.vertexBuffer = this.device.createBuffer({ size: vertexData.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, mappedAtCreation: true });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
        this.vertexBuffer.unmap();
        this.vertexCount = vertices3D.length;
      }
      render(viewMatrix, projMatrix, time) {
        if (!this.vertexBuffer || this.vertexCount === 0) return;
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({ colorAttachments: [{ view: this.context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }] });
        pass.setPipeline(this.pipeline);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.draw(this.vertexCount);
        pass.end();
        this.device.queue.submit([encoder.finish()]);
      }
      resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.context) this.context.configure({ device: this.device, format: navigator.gpu.getPreferredCanvasFormat(), alphaMode: 'premultiplied' });
      }
    }
    window.WebGPU5DRenderer = WebGPU5DRenderer;
  }

  // ==================== HyperdimensionalScene Controller ====================
  class HyperdimensionalScene {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.renderer = null;
      this.useWebGPU = false;
      this.animationType = 'physics_world';
      this.objects = {};
      this.physicsWorld = new PhysicsWorld5D();
      this.pixelAnims = {};
      this.mathAnims = {};
      this.angles = { x: 0, y: 0, z: 0, w: 0 };
      this.customAnimations = [];
      this.colors = [[1,0.2,0.4,1],[0.2,0.6,1,1],[0.4,1,0.3,1],[1,0.8,0.2,1],[0.8,0.3,1,1],[0.2,1,0.8,1],[1,0.5,0.5,1],[0.5,0.5,1,1],[1,0.5,0.2,1],[0.2,0.8,0.5,1],[0.8,0.2,0.6,1],[0.6,0.8,0.2,1],[1,0.3,0.7,1],[0.3,1,0.5,1],[0.5,0.3,1,1],[1,0.7,0.3,1]];
      this.time = 0;
      this.rotationSpeed = 0.008;
      this.setupPhysicsWorld();
      this.setupPixelAnimations();
    }
    
    setupPhysicsWorld() {
      this.physicsWorld.addForceField(new ForceField5D('gravity', new Vector5D(0,0,0,0,0), 1.5, 8));
      this.physicsWorld.addForceField(new ForceField5D('vortex', new Vector5D(0,0,2,1,0.5), 1.2, 5));
      this.physicsWorld.addForceField(new ForceField5D('turbulence', new Vector5D(1,-1,0,0,0), 0.8, 6));
      
      this.physicsWorld.addBody('sphere', new Vector5D(2,0,0,0,0), new Vector5D(0,0.02,0,0,0), 1, {radius: 1});
      this.physicsWorld.addBody('cube', new Vector5D(-2,1,0,0,0), new Vector5D(0.01,0,0.01,0,0), 1.5, {size: 0.8});
      this.physicsWorld.addBody('torus', new Vector5D(0,2,1,0,0), new Vector5D(-0.01,0,0,0,0), 2, {majorRadius: 1.5, minorRadius: 0.4});
      this.physicsWorld.addBody('pyramid', new Vector5D(-1,-2,0,0,0), new Vector5D(0,0.01,-0.01,0,0), 1.2, {size: 0.7, height: 1.5});
      this.physicsWorld.addBody('octahedron', new Vector5D(1,-1,-2,0,0), new Vector5D(0.01,0,0,0,0.01), 1, {size: 0.9});
      this.physicsWorld.addBody('dodecahedron', new Vector5D(0,0,2,0,0), new Vector5D(-0.01,0.01,0,0,0), 1.8, {size: 0.6});
      this.physicsWorld.addBody('tesseract', new Vector5D(-2,-1,1,0,0), new Vector5D(0,0,0.01,0.01,0), 1.3, {size: 0.7});
      this.physicsWorld.addBody('knot', new Vector5D(0,-2,-1,0,0), new Vector5D(0.01,-0.01,0,0,0), 1.6, {majorRadius: 1.2, minorRadius: 0.3, p: 3, q: 2});
      this.physicsWorld.addBody('helix', new Vector5D(2,2,0,0,0), new Vector5D(0,0,-0.01,0,0.01), 1.4, {radius: 1, height: 2, turns: 4});
      this.physicsWorld.addBody('icosahedron', new Vector5D(-2,2,-1,0,0), new Vector5D(0.01,0,0,0,0), 1.1, {size: 0.8});
      
      const bodies = this.physicsWorld.bodies;
      for (let i = 0; i < bodies.length - 1; i++) {
        if (Math.random() < 0.3) {
          this.physicsWorld.addSpring(bodies[i], bodies[i + 1]);
        }
      }
    }
    
    setupPixelAnimations() {
      this.pixelAnims['pixel_wave'] = createPixelWave();
      this.pixelAnims['pixel_torus'] = createPixelTorus();
      this.pixelAnims['pixel_fractal'] = createPixelFractal();
    }
    
    async init() {
      this.objects.hypercube = new Hypercube5D(1.5);
      this.objects.hypersphere = new Hypersphere5D(5000);
      this.objects.hyperknot = new Hyperknot5D(2000);
      this.objects.tesseract = new Tesseract5D();
      this.objects.hyperdonut = new Hyperdonut5D(200);
      this.objects.hyperfield = new Hyperfield5D(12000);
      this.objects.hyperstar = new Hyperstar5D(3000);
      this.objects.hyperwave = new Hyperwave5D(3000);
      this.objects.hyperfractal = new Hyperfractal5D(3);
      this.objects.hypervortex = new Hypervortex5D(8000);
      this.objects.hyperflower = new Hyperflower5D(6000);
      this.objects.hypermatrix = new Hypermatrix5D(3);
      this.objects.hyperrainbow = new Hyperrainbow5D(5000);
      this.objects.hypergalaxy = new Hypergalaxy5D(10000);
      this.objects.hyperquantum = new Hyperquantum5D(7000);
      this.objects.hyperhelix = new Hyperhelix5D(4000);
      this.objects.hypercrystal = new Hypercrystal5D(5000);
      this.objects.hypernebula = new Hypernebula5D(15000);
      this.objects.hypermetaverse = new Hypermetaverse5D(9000);
      
      if (navigator.gpu) {
        try {
          this.renderer = new WebGPU5DRenderer(this.canvas);
          await this.renderer.init();
          this.useWebGPU = true;
        } catch(e) {
          this.renderer = new WebGL5DRenderer(this.canvas);
          this.renderer.init();
          this.useWebGPU = false;
        }
      } else {
        this.renderer = new WebGL5DRenderer(this.canvas);
        this.renderer.init();
        this.useWebGPU = false;
      }
      
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.setupInteraction();
      this.start();
    }
    
    setupInteraction() {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 10 - 5;
        const y = -(e.clientY / window.innerHeight) * 10 + 5;
        this.physicsWorld.interactionSystem.updateMousePosition(x, y);
      });
      
      document.addEventListener('touchstart', (e) => {
        for (const touch of e.touches) {
          const x = (touch.clientX / window.innerWidth) * 10 - 5;
          const y = -(touch.clientY / window.innerHeight) * 10 + 5;
          this.physicsWorld.interactionSystem.addTouchPoint(x, y, touch.force || 1);
        }
        const gesture = this.physicsWorld.interactionSystem.detectGestures();
        if (gesture === 'explosion') {
          for (const body of this.physicsWorld.bodies) {
            const randomDir = new Vector5D((Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.3,(Math.random()-0.5)*0.3);
            body.applyForce(randomDir.mul(0.2));
          }
        }
      }, { passive: false });
    }
    
    resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.canvas.width = width;
      this.canvas.height = height;
      if (this.renderer && this.renderer.resize) this.renderer.resize(width, height);
    }
    
    setAnimationType(type) {
      if (this.objects[type] || this.pixelAnims[type] || this.mathAnims[type] || type === 'physics_world' || type.startsWith('custom_')) {
        this.animationType = type;
      }
    }
    
    getViewMatrix() {
      const eyeX = 0, eyeY = 0, eyeZ = 5;
      const zAxisZ = -1 / Math.sqrt(1 + 0 + 0);
      const xAxisX = 1, yAxisY = 1;
      return new Float32Array([1,0,0,0,0,1,0,0,0,0,-1,0,0,0,-5,1]);
    }
    
    getProjectionMatrix() {
      const fov = 60 * Math.PI / 180;
      const aspect = this.canvas.width / this.canvas.height;
      const f = 1 / Math.tan(fov / 2);
      return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,-1.002,-1,0,0,-0.2002,0]);
    }
    
    render() {
      this.time += 0.016;
      this.angles.x += this.rotationSpeed;
      this.angles.y += this.rotationSpeed * 0.7;
      this.angles.z += this.rotationSpeed * 0.5;
      this.angles.w += this.rotationSpeed * 0.3;
      
      let vertices3D = [];
      let vertexColors = [];
      
      if (this.animationType === 'physics_world') {
        this.physicsWorld.update(this.time);
        vertices3D = this.physicsWorld.getAllProjectedVertices(this.angles);
        vertexColors = this.physicsWorld.getAllColors();
      } else if (this.animationType.startsWith('pixel_') && this.pixelAnims[this.animationType]) {
        const anim = this.pixelAnims[this.animationType];
        anim.update(this.time);
        vertices3D = anim.getProjectedVertices(this.angles);
        vertexColors = vertices3D.map(v => [v.r || 0.5, v.g || 0.5, v.b || 0.8, 1]);
      } else if (this.animationType.startsWith('math_') && this.mathAnims[this.animationType]) {
        const anim = this.mathAnims[this.animationType];
        anim.update(this.time);
        vertices3D = anim.getProjectedVertices(this.angles);
        vertexColors = vertices3D.map(v => [v.r || 0.5, v.g || 0.5, v.b || 0.8, 1]);
      } else {
        switch (this.animationType) {
          case 'hypercube': vertices3D = this.objects.hypercube.updateVertices(this.angles, this.time); vertexColors = Array(vertices3D.length).fill([1,0.2,0.4,1]); break;
          case 'hypersphere': vertices3D = this.objects.hypersphere.updatePoints(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>this.colors[i%this.colors.length]); break;
          case 'hyperknot': vertices3D = this.objects.hyperknot.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const t=i/vertices3D.length;return[Math.sin(t*Math.PI*2)*0.5+0.5,Math.cos(t*Math.PI*3)*0.5+0.5,Math.sin(t*Math.PI*5)*0.5+0.5,1];}); break;
          case 'tesseract': vertices3D = this.objects.tesseract.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>this.colors[i%this.colors.length]); break;
          case 'hyperdonut': vertices3D = this.objects.hyperdonut.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>this.colors[i%this.colors.length]); break;
          case 'hyperfield': vertices3D = this.objects.hyperfield.update(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const intensity=(Math.sin(this.time*2+i*0.01)+1)/2;return[intensity,intensity*0.5,intensity*0.8,1];}); break;
          case 'hyperstar': vertices3D = this.objects.hyperstar.updatePoints(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const r=Math.sin(this.time+i*0.01)*0.5+0.5,g=Math.cos(this.time*1.3+i*0.01)*0.5+0.5,b=Math.sin(this.time*1.7+i*0.02)*0.5+0.5;return[r,g,b,1];}); break;
          case 'hyperwave': vertices3D = this.objects.hyperwave.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const t=i/vertices3D.length;return[Math.sin(t*Math.PI*2+this.time)*0.5+0.5,Math.cos(t*Math.PI*3+this.time)*0.5+0.5,Math.sin(t*Math.PI*5+this.time*2)*0.5+0.5,1];}); break;
          case 'hyperfractal': vertices3D = this.objects.hyperfractal.updateVertices(this.angles, this.time); vertexColors = vertices3D.map(()=>[0.5+Math.sin(this.time)*0.5,0.3+Math.cos(this.time*1.2)*0.3,0.7+Math.sin(this.time*1.5)*0.3,1]); break;
          case 'hypervortex': vertices3D = this.objects.hypervortex.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const angle=Math.atan2(vertices3D[i].y,vertices3D[i].x);return[Math.sin(angle+this.time)*0.5+0.5,Math.cos(angle*2+this.time)*0.5+0.5,Math.sin(angle*3+this.time*1.5)*0.5+0.5,1];}); break;
          case 'hyperflower': vertices3D = this.objects.hyperflower.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const t=i/vertices3D.length;return[Math.sin(t*Math.PI*6+this.time)*0.5+0.5,Math.cos(t*Math.PI*8+this.time)*0.5+0.5,Math.sin(t*Math.PI*10+this.time*2)*0.5+0.5,1];}); break;
          case 'hypermatrix': vertices3D = this.objects.hypermatrix.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const intensity=(Math.floor(i/100)%10)/10;return[intensity,intensity*0.5,intensity*0.8,1];}); break;
          case 'hyperrainbow': vertices3D = this.objects.hyperrainbow.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const hue=(i/vertices3D.length+this.time*0.2)%1;return[hue,(hue+0.33)%1,(hue+0.67)%1,1];}); break;
          case 'hypergalaxy': vertices3D = this.objects.hypergalaxy.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const r=Math.sin(this.time+i*0.001)*0.5+0.5,g=Math.cos(this.time*0.8+i*0.002)*0.5+0.5,b=Math.sin(this.time*1.2+i*0.0015)*0.5+0.5;return[r,g,b,1];}); break;
          case 'hyperquantum': vertices3D = this.objects.hyperquantum.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const prob=Math.sin(i*0.01+this.time)*0.5+0.5;return[prob,prob*0.3+0.5,prob*0.5+0.3,0.8];}); break;
          case 'hyperhelix': vertices3D = this.objects.hyperhelix.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const t=i/vertices3D.length;return[0.5+Math.sin(t*Math.PI*4+this.time)*0.5,0.5+Math.cos(t*Math.PI*3+this.time*0.8)*0.5,0.5+Math.sin(t*Math.PI*5+this.time*1.2)*0.5,1];}); break;
          case 'hypercrystal': vertices3D = this.objects.hypercrystal.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>[0.7+Math.sin(i*0.1)*0.3,0.7+Math.cos(i*0.13)*0.3,0.9+Math.sin(i*0.17)*0.1,1]); break;
          case 'hypernebula': vertices3D = this.objects.hypernebula.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const r=Math.sin(this.time*0.5+i*0.001)*0.5+0.5,g=Math.cos(this.time*0.7+i*0.001)*0.5+0.5,b=Math.sin(this.time*0.9+i*0.0015)*0.5+0.5;return[r*0.7,g*0.5,b,0.9];}); break;
          case 'hypermetaverse': vertices3D = this.objects.hypermetaverse.updateVertices(this.angles, this.time); vertexColors = vertices3D.map((_,i)=>{const network=Math.floor(i/(vertices3D.length/4));const colors=[[0.2,0.8,1,1],[1,0.2,0.8,1],[0.2,1,0.5,1],[1,0.8,0.2,1]];return colors[network]||colors[0];}); break;
          default: if(this.animationType.startsWith('custom_')&&this.objects[this.animationType]){vertices3D=this.objects[this.animationType].updateVertices(this.angles,this.time);vertexColors=vertices3D.map(()=>[Math.random()*0.5+0.5,Math.random()*0.5+0.5,Math.random()*0.5+0.5,1]);}break;
        }
      }
      
      if (vertices3D && vertices3D.length > 0) {
        this.renderer.updateGeometry(vertices3D, vertexColors);
        this.renderer.render(this.getViewMatrix(), this.getProjectionMatrix(), this.time);
      }
      
      requestAnimationFrame(() => this.render());
    }
    
    start() { this.render(); }
  }

  // ==================== UI Controller ====================
  class UI5DController {
    constructor() { this.scene = null; this.setupUI(); }
    
    setupUI() {
      const panel = document.createElement('div');
      panel.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);border-radius:16px;padding:15px;z-index:1000;font-family:monospace;color:#fff;border:1px solid #667eea;max-width:300px;';
      panel.innerHTML = `<div style="margin-bottom:10px;font-weight:bold;text-align:center;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">🌀 5D Complete Engine</div><select id="animationType" style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;background:#1a1a2e;color:#fff;border:1px solid #667eea;"><optgroup label="🖼️ Pixel Animations"><option value="pixel_wave">🌊 Pixel Wave</option><option value="pixel_torus">🍩 Pixel Torus</option><option value="pixel_fractal">🌀 Pixel Fractal</option></optgroup><option value="physics_world">🔥 Physics World (Multi-Shape)</option><option value="hyperknot">🌀 5D Hyperknot</option><option value="hypercube">🎲 5D Hypercube</option><option value="hypersphere">⚪ 4-Sphere</option><option value="tesseract">🔷 5D Tesseract</option><option value="hyperdonut">🍩 5D Hyperdonut</option><option value="hyperfield">✨ 5D Particle Field</option><option value="hyperstar">⭐ 5D Hyperstar</option><option value="hyperwave">🌊 5D Hyperwave</option><option value="hyperfractal">🌀 5D Hyperfractal</option><option value="hypervortex">🌪️ 5D Hypervortex</option><option value="hyperflower">🌸 5D Hyperflower</option><option value="hypermatrix">📊 5D Hypermatrix</option><option value="hyperrainbow">🌈 5D Hyperrainbow</option><option value="hypergalaxy">🌌 5D Hypergalaxy</option><option value="hyperquantum">⚛️ 5D Hyperquantum</option><option value="hyperhelix">🧬 5D Hyperhelix</option><option value="hypercrystal">💎 5D Hypercrystal</option><option value="hypernebula">🌫️ 5D Hypernebula</option><option value="hypermetaverse">🌐 5D Hypermetaverse</option></select><div style="margin-top:10px;"><label>Rotation Speed: <span id="speedValue">0.008</span></label><input type="range" id="speedSlider" min="0" max="0.03" step="0.0005" value="0.008" style="width:100%;margin:5px 0;"></div><div style="margin-top:10px;font-size:9px;opacity:0.6;text-align:center;">🎨 23 Animations | Pixel + Particle + Physics + Math</div>`;
      document.body.appendChild(panel);
      document.getElementById('animationType').addEventListener('change', (e) => { if (this.scene) this.scene.setAnimationType(e.target.value); });
      document.getElementById('speedSlider').addEventListener('input', (e) => { const val = parseFloat(e.target.value); document.getElementById('speedValue').textContent = val; if (this.scene) this.scene.rotationSpeed = val; });
    }
    
    async initialize(canvasId) {
      this.scene = new HyperdimensionalScene(canvasId);
      await this.scene.init();
      this.scene.setAnimationType('physics_world');
    }
  }

  // ==================== Export and Auto-Initialize ====================
  window.Hyperdimensional5D = { UI5DController, HyperdimensionalScene, Vector5D, PixelAnimation, MathAnimation, PhysicsParticle5D, ForceField5D, CollisionSystem5D, InteractionSystem5D, Shape5D, RigidBody5D, SpringConstraint5D, PhysicsWorld5D, Hypercube5D, Hypersphere5D, Tesseract5D, Hyperdonut5D, Hyperknot5D, Hyperfield5D, Hyperstar5D, Hyperwave5D, Hyperfractal5D, Hypervortex5D, Hyperflower5D, Hypermatrix5D, Hyperrainbow5D, Hypergalaxy5D, Hyperquantum5D, Hyperhelix5D, Hypercrystal5D, Hypernebula5D, Hypermetaverse5D };
  
  const existingCanvas = document.getElementById('hypercanvas');
  if (existingCanvas) existingCanvas.remove();
  
  const canvas = document.createElement('canvas');
  canvas.id = 'hypercanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;';
  document.body.prepend(canvas);
  
  const controller = new UI5DController();
  await controller.initialize('hypercanvas');
  
  window.createCustom5DAnimation = (name, generatorFn) => { return controller; };
  
  window.createPixelAnimation = (width, height) => {
    const anim = new PixelAnimation(width || 200, height || 150);
    if (controller.scene) {
      controller.scene.pixelAnims['custom_pixel'] = anim;
      const select = document.getElementById('animationType');
      if (select) {
        const option = document.createElement('option');
        option.value = 'custom_pixel'; option.textContent = '🎨 Custom Pixel';
        select.querySelector('optgroup').appendChild(option);
      }
    }
    return anim;
  };
  
  window.createMathAnimation = (name, config) => {
    const anim = new MathAnimation({ ...config, name: name || 'custom_math' });
    if (controller.scene) {
      controller.scene.mathAnims[`math_${name}`] = anim;
      controller.scene.objects[`math_${name}`] = {
        updateVertices: (angles, time) => { anim.update(time); return anim.getProjectedVertices(angles); }
      };
      const select = document.getElementById('animationType');
      if (select) {
        const option = document.createElement('option');
        option.value = `math_${name}`; option.textContent = `📐 Math: ${name}`;
        select.appendChild(option);
      }
    }
    return anim;
  };
  
  console.log('🌀 Complete 5D Engine Active | 22 Animations + Pixel + Math | Optimized Physics');
})();