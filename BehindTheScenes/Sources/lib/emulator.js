// ==================== CLJ EMULATION ENGINE ====================
const fs = require('fs');
const http = require('http');

class CLJEmulationEngine {
    constructor() { this.port = 3000; }

    async start() {
        console.log('🖥️ Initializing CLJ Emulation Mode...');
        if (!fs.existsSync('public/v86-assets')) fs.mkdirSync('public/v86-assets', { recursive: true });
        fs.writeFileSync('public/v86-assets/emulator.html', this.generateHTML());
        this.runServer();
    }

    runServer() {
        http.createServer((req, res) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            res.setHeader('Accept-Ranges', 'bytes'); // Tell v86 we can send pieces

            let url = req.url;
            if (url === '/' || url === '/emulator.html') url = '/v86-assets/emulator.html';
            let directPath = 'public' + url;

            if (!fs.existsSync(directPath)) {
                res.writeHead(404);
                res.end("404: Not Found - " + directPath);
                return;
            }

            const stat = fs.statSync(directPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                // HANDLE RANGE REQUESTS FOR THE 20GB IMAGE
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(directPath, {start, end});
                
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Content-Length': chunksize,
                    'Content-Type': 'application/octet-stream',
                });
                file.pipe(res);
            } else {
                // NORMAL LOAD
                if (directPath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
                if (directPath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
                res.writeHead(200, { 'Content-Length': fileSize });
                fs.createReadStream(directPath).pipe(res);
            }
        }).listen(this.port);
        console.log(`🚀 Emulator live at http://localhost:${this.port}`);
    }

    generateHTML() {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CLJ Windows 8 Mode</title>
            <style>
                body { background: #111; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; margin: 0; }
                #screen { background: #000; border: 1px solid #333; margin-top: 20px; width: 1024px; height: 768px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h2>CLJ Emulation Mode</h2>
            <div id="screen"></div>
            <script src="/v86-assets/libv86.js"></script>
            <script>
                window.onload = () => {
                    const constructor = typeof V86 === 'function' ? V86 : V86.V86Starter;
                    new constructor({
                        screen_container: document.getElementById('screen'),
                        bios: { url: '/v86-assets/seabios.bin' },
                        vga_bios: { url: '/v86-assets/vgabios.bin' },
                        hda: { url: '/v86-assets/windows8.img', async: true },
                        wasm_path: '/v86-assets/v86.wasm',
                        memory_size: 1024 * 1024 * 1024,
                        autostart: true
                    });
                };
            </script>
        </body>
        </html>`;
    }
}

const engine = new CLJEmulationEngine();
engine.start().catch(err => console.error(err));
