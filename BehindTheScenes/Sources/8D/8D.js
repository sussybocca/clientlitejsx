/**
 * THE BITSTREAM ENGINE - ZERO SPATIAL KERNEL
 * Fixed: This code does NOT use width or height for its internal logic.
 * It operates on a raw, fixed-size data array.
 */

class AxiomLogic {
    constructor() {
        this.states = new Float32Array(8);
        this.clock = 0;
    }

    process() {
        this.clock += 0.008; 
        for (let i = 0; i < 8; i++) {
            this.states[i] = Math.sin(this.clock * (1 + i * 0.25));
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
        
        // We define a fixed data-size that has nothing to do with screen width
        this.dataSize = 1000000; 
        this.memory = this.ctx.createImageData(1000, 1000); // Internal visual box
        
        this._init();
    }

    _init() {
        // We force the canvas to just show our raw data block
        this.canvas.width = 1000;
        this.canvas.height = 1000;
    }

    /**
     * THE BLIND AXIOM
     * No Width. No Height. Just Index (i) and State (s).
     */
    synthesize() {
        const bits = this.memory.data;
        const s = this.logic.states;

        for (let i = 0; i < bits.length; i += 4) {
            // Logic: Is this bit active? 
            // We use a "Modulo Frequency" that is totally independent of 2D grids.
            const freq = 4096; // Purely logical wrap-point
            const logicEdge = (i % freq) < (100 * s[0]);
            
            const intensity = logicEdge ? 1.0 : 0.05;

            bits[i]     = intensity * (127 + s[1] * 127); 
            bits[i + 1] = intensity * (127 + s[2] * 127); 
            bits[i + 2] = intensity * (200 + s[3] * 55);  
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
