/**
 * HYPER-CORE: LOGICAL CUBE ENGINE
 * ZERO GEOMETRY: No X, Y, Z, 1D, 2D, or 3D math.
 * Method: Bit-Frequency folding to simulate "Cube" structures in a 1D stream.
 */

class AxiomLogic {
    constructor() {
        this.states = new Float32Array(8);
        this.clock = 0;
    }

    process() {
        this.clock += 0.008; 
        for (let i = 0; i < 8; i++) {
            // High-tension modulation to create 'Mechanical' movement
            const resonance = i % 2 === 0 ? Math.sin(this.clock) : Math.cos(this.clock);
            this.states[i] = Math.sin(this.clock * (1 + i * 0.25) + resonance);
        }
    }
}

class SystemRenderer {
    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        document.body.style.background = "#000";
        this.ctx = this.canvas.getContext('2d');
        this.logic = new AxiomLogic();
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.memory = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    }

    /**
     * THE CUBE AXIOM
     * Uses bitwise "wrapping" to create a box-like structure in raw memory.
     */
    cubeLogic(i, s) {
        // Step 1: Logic Folding
        // We find the 'beat' of the cube edges by using bit-masks on the index
        const frequency = Math.floor(200 + s[7] * 50);
        const bitEdge = (i ^ (i >> 8)) % frequency;

        // Step 2: Plane Interference
        // Instead of X/Y/Z, we use 3 different prime-number intervals 
        // to represent the 3 "faces" of the data cluster
        const faceA = Math.sin(i * 0.0001 * s[0]);
        const faceB = Math.cos(i * 0.00005 * s[1]);
        const faceC = Math.tan(i * 0.000002 * s[2]);

        // Step 3: Intersection
        // A "Cube" in this engine is just where these 3 logical frequencies overlap
        const structure = (bitEdge < 5) ? 1.0 : 0.0;
        const volume = (faceA * faceB * faceC);

        return (structure * 0.8) + (volume * 0.2);
    }

    synthesize() {
        const bits = this.memory.data;
        const s = this.logic.states;
        const len = bits.length;

        for (let i = 0; i < len; i += 4) {
            const factor = this.cubeLogic(i, s);

            if (factor <= 0.01) {
                bits[i] = bits[i+1] = bits[i+2] = 0;
                bits[i+3] = 255;
                continue;
            }

            // NEON AXIOM: Mechanical/Digital color palette
            bits[i]     = factor * (100 + s[4] * 155); // Edge Flash
            bits[i + 1] = factor * (255 * Math.abs(s[5])); // Core Glow
            bits[i + 2] = factor * (200 + s[6] * 55);  // Trace Blue
            bits[i + 3] = 255; 
        }
        
        this.ctx.putImageData(this.memory, 0, 0);
    }
}

const engine = new SystemRenderer();

function run() {
    engine.logic.process();
    engine.synthesize();
    requestAnimationFrame(run);
}

run();
