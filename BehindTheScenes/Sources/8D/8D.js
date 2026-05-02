/**
 * HYPER-CORE: AGNOSTIC CUBE
 * PROOF: No X/Y, no Width/Height used in the math kernel.
 * The logic only sees a "Long Number" (i), not a "Place" (x,y).
 */

class AxiomLogic {
    constructor() {
        this.states = new Float32Array(8);
        this.clock = 0;
    }

    process() {
        this.clock += 0.008; 
        for (let i = 0; i < 8; i++) {
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
     * THE AGNOSTIC KERNEL
     * This function has NO access to canvas width or height.
     * It only knows the Memory Address (i).
     */
    cubeAxiom(i, s) {
        // Step 1: Sequential Folding (Based on a constant, not screen size)
        // A "Cube" emerges if we wrap every 1024 * 5 pixels regardless of screen shape.
        const logicWrap = 5120; 
        const edgePulse = (i % logicWrap) < (50 * s[7]);

        // Step 2: Pure Logical Harmonics
        const s1 = Math.sin(i * 0.00001 * s[0]);
        const s2 = Math.cos(i * 0.00002 * s[1]);
        
        // Step 3: Bitwise "Solidification"
        // This creates 'Surfaces' using Logic Gates (AND), not Geometry
        const logicSurface = (i ^ (i >> 4)) & (i >> 8);
        
        return edgePulse ? 1.0 : (logicSurface % 255 < 20 ? 0.3 : 0);
    }

    synthesize() {
        const bits = this.memory.data;
        const s = this.logic.states;
        const len = bits.length;

        for (let i = 0; i < len; i += 4) {
            // Passing ONLY 'i' and 's'. The math is blind to the 2D grid.
            const factor = this.cubeAxiom(i, s);

            if (factor <= 0) {
                bits[i] = bits[i+1] = bits[i+2] = 0;
                bits[i+3] = 255;
                continue;
            }

            bits[i]     = factor * (100 + s[4] * 155); 
            bits[i + 1] = factor * (255 * Math.abs(s[5])); 
            bits[i + 2] = factor * (200 + s[6] * 55);  
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
