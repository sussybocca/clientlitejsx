class NanoGPU_v7 {
  constructor(displayId = null, width = 60, height = 20) {
    this.width = width;
    this.height = height;
    this.displayElement = typeof document !== 'undefined' ? document.getElementById(displayId) : null;
    
    // VRAM & Z-BUFFER
    this.bufferA = new Uint8Array(width * height).fill(32);
    this.bufferB = new Uint8Array(width * height).fill(32);
    this.zBuffer = new Uint8Array(width * height).fill(0);
    this.backBuffer = this.bufferA;
    this.frontBuffer = this.bufferB;

    // --- NEW: TEXTURE RAM (TRAM) ---
    // Stores a 8x8 pattern that can be mapped onto any object
    this.textureRAM = new Uint8Array(8 * 8).fill(46); // Default to '.'
    
    this.registers = {
      STATUS: 0x00,
      ROTATION: 0,
      OFFSET_X: 0,
      OFFSET_Y: 0,
      SAMPLER_MODE: 0 // 0: Solid, 1: Textured
    };

    this.commandQueue = [];
    this.frame = 0;
  }

  sendData(buffer) {
    this.commandQueue.push(...buffer);
  }

  cycle() {
    this.frame++;
    this.registers.STATUS = 0x01;

    while (this.commandQueue.length > 0) {
      const opcode = this.commandQueue.shift();

      switch (opcode) {
        case 0xA1: this.registers.ROTATION = this.commandQueue.shift(); break;
        case 0xA3: this.registers.OFFSET_X = this.commandQueue.shift(); break;
        case 0xA6: this.registers.SAMPLER_MODE = this.commandQueue.shift(); break;
        
        case 0xB0: // LOAD_TEXTURE: [64 bytes of data]
          for(let i=0; i<64; i++) this.textureRAM[i] = this.commandQueue.shift();
          break;

        case 0x40: // DRAW_TEXTURED_RECT: [X, Y, W, H, Depth]
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
      }
    }
    this.registers.STATUS = 0x00;
  }

  _swapBuffers() { [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer]; }

  // THE TEXTURE SAMPLER: Maps coordinate (u, v) to a TRAM value
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

        // Calculate UV coordinates (0.0 to 1.0) for the sampler
        const u = i / w;
        const v = j / h;
        
        const char = (this.registers.SAMPLER_MODE === 1) 
          ? this._sampleTexture(u, v) 
          : 35; // '#'

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
if (typeof exports !== 'undefined') { module.exports = NanoGPU_v7; } 
else { window.NanoGPU_v7 = NanoGPU_v7; }

// Standalone Node.js Test Mode (Updated for Texturing)
if (typeof require !== 'undefined' && require.main === module) {
    const gpu = new NanoGPU_v7();
    let angle = 0;
    // Create a smiley face texture pattern in ASCII
    const faceTex = new Array(64).fill(32);
    [10, 13, 18, 21, 41, 46, 49, 50, 51, 52, 53, 54].forEach(i => faceTex[i] = 79); // 'O'
    
    setInterval(() => {
        angle = (angle + 5) % 360;
        gpu.sendData([0x20, 0xB0, ...faceTex, 0xA1, angle, 0xA6, 1, 0x40, 25, 5, 12, 10, 50, 0x30]);
        gpu.cycle(); 
        gpu.render();
    }, 50);
}
