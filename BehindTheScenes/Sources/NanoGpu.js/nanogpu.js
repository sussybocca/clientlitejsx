class NanoGPU_v8 {
  constructor(displayId = null, width = 60, height = 20) {
    this.width = width;
    this.height = height;
    this.displayElement = typeof document !== 'undefined' ? document.getElementById(displayId) : null;
    
    // VRAM & Z-BUFFER (Physical Memory Banks)
    this.bufferA = new Uint8Array(width * height).fill(32);
    this.bufferB = new Uint8Array(width * height).fill(32);
    this.zBuffer = new Uint8Array(width * height).fill(0);
    this.backBuffer = this.bufferA;
    this.frontBuffer = this.bufferB;

    // --- NEW: PHYSICAL HARDWARE COMPONENTS (For True Emulation) ---
    this.textureRAM = new Uint8Array(8 * 8).fill(46); 
    
    // Physical Arithmetic Logic Unit (ALU) Registers
    // In real hardware, math happens in these 'slots', not variables
    this.hw_regs = new Int16Array(16); 

    this.registers = {
      STATUS: 0x00,    // Hardware Pin: 0x01 = BUSY, 0x00 = IDLE
      ROTATION: 0,
      OFFSET_X: 0,
      OFFSET_Y: 0,
      SAMPLER_MODE: 0,
      IRQ_MASK: 0x00   // Interrupt Request Mask
    };

    this.commandQueue = [];
    this.frame = 0;
  }

  // THE DATA BUS: Moves binary data from CPU to GPU
  sendData(buffer) {
    this.commandQueue.push(...buffer);
  }

  // THE INSTRUCTION DECODER: The core of the emulation
  cycle() {
    this.frame++;
    this.registers.STATUS = 0x01; // Set physical BUSY pin

    while (this.commandQueue.length > 0) {
      const opcode = this.commandQueue.shift();

      switch (opcode) {
        // --- v7 Legacy Instructions (Untouched) ---
        case 0xA1: this.registers.ROTATION = this.commandQueue.shift(); break;
        case 0xA3: this.registers.OFFSET_X = this.commandQueue.shift(); break;
        case 0xA6: this.registers.SAMPLER_MODE = this.commandQueue.shift(); break;
        case 0xB0: 
          for(let i=0; i<64; i++) this.textureRAM[i] = this.commandQueue.shift();
          break;
        case 0x40: 
          const [rx, ry, rw, rh, rd] = [
            this.commandQueue.shift(), this.commandQueue.shift(),
            this.commandQueue.shift(), this.commandQueue.shift(),
            this.commandQueue.shift()
          ];
          this._drawRect(rx, ry, rw, rh, rd);
          break;
        case 0x20: 
          this.backBuffer.fill(32);
          this.zBuffer.fill(0);
          break;
        case 0x30: this._swapBuffers(); break;

        // --- NEW: TRUE EMULATION INSTRUCTIONS ---
        
        // DMA_WRITE: Directly write a value to a physical VRAM address
        // Emulates Memory-Mapped I/O (MMIO)
        case 0xC0: 
          const addr = this.commandQueue.shift();
          const val = this.commandQueue.shift();
          this.backBuffer[addr] = val;
          break;

        // ALU_OP: Perform hardware-level math on internal registers
        // opcode [RegIndex, Operation, Value]
        case 0xD0:
          const regIdx = this.commandQueue.shift();
          const op = this.commandQueue.shift(); // 0: ADD, 1: SUB
          const v = this.commandQueue.shift();
          if (op === 0) this.hw_regs[regIdx] += v;
          else this.hw_regs[regIdx] -= v;
          break;
          
        // INTERRUPT: Signal the CPU that a specific operation finished
        case 0xEE:
            this.registers.IRQ_MASK = this.commandQueue.shift();
            break;
      }
    }
    this.registers.STATUS = 0x00; // Set physical IDLE pin
  }

  // --- INTERNAL HARDWARE CIRCUITS (Untouched) ---

  _swapBuffers() { [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer]; }

  _sampleTexture(u, v) {
    const tx = Math.floor(u * 7) % 8;
    const ty = Math.floor(v * 7) % 8;
    return this.textureRAM[ty * 8 + tx];
  }

  _drawWithDepth(x, y, char, depth) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const index = Math.floor(y) * this.width + Math.floor(x);
    if (depth >= this.zBuffer[index]) {
      this.zBuffer[index] = depth;
      this.backBuffer[index] = char;
    }
  }

  _drawRect(x, y, w, h, depth) {
    const angle = (this.registers.ROTATION * Math.PI) / 180;
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let dx = (x + i) - centerX;
        let dy = (y + j) - centerY;
        let rotX = dx * Math.cos(angle) - dy * Math.sin(angle) + centerX;
        let rotY = dx * Math.sin(angle) + dy * Math.cos(angle) + centerY;
        const u = i / w;
        const v = j / h;
        const char = (this.registers.SAMPLER_MODE === 1) 
          ? this._sampleTexture(u, v) 
          : 35;
        this._drawWithDepth(rotX + this.registers.OFFSET_X, rotY + this.registers.OFFSET_Y, char, depth);
      }
    }
  }

  render() {
    let screen = ""; 
    for (let i = 0; i < this.frontBuffer.length; i++) {
      screen += String.fromCharCode(this.frontBuffer[i]);
      if ((i + 1) % this.width === 0) screen += "\n";
    }
    if (this.displayElement) {
        this.displayElement.textContent = screen;
    } else if (typeof process !== 'undefined' && process.stdout) {
        process.stdout.write("\x1B[H" + screen);
    }
  }
}

// UNIVERSAL EXPORT BRIDGE
if (typeof exports !== 'undefined') { module.exports = NanoGPU_v8; } 
else { window.NanoGPU_v8 = NanoGPU_v8; }
