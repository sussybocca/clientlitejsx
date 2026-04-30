// ==================== CLJ MULTI-OS NETLIFY ENGINE (STABLE) ====================
const fs = require('fs');
const path = require('path');

class CLJNetlifyEngine {
    async start() {
        console.log('🖥️ Initializing High-Compatibility Multi-OS Engine...');

        // PATHS
        const v86Path = path.dirname(require.resolve('v86/package.json'));
        const buildPath = path.join(v86Path, 'build');
        const destPath = path.join(process.cwd(), 'public', 'v86-assets');
        
        // SOURCE PATH FOR YOUR LOCAL IMAGES (Adjust if your local repo is elsewhere)
        const localSourcePath = path.join(process.cwd(), 'public', 'v86-assets');

        if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });

        // 1. Sync v86 engine core files from node_modules
        console.log('📦 Syncing v86 engine files...');
        fs.copyFileSync(path.join(buildPath, 'libv86.js'), path.join(destPath, 'libv86.js'));
        fs.copyFileSync(path.join(buildPath, 'v86.wasm'), path.join(destPath, 'v86.wasm'));

        // 2. Sync OS Assets (ISOs and IMGs)
        // This ensures the files in your D:\ path are copied to the build destination
        const assetsToSync = [
            'seabios.bin', 
            'vgabios.bin', 
            'kolibri.img', 
            'Core-17.0.iso', 
            'windows101.img', 
            'slitaz-rolling-core-5in1.iso'
        ];

        console.log('📂 Syncing OS Assets to public folder...');
        assetsToSync.forEach(file => {
            const src = path.join(localSourcePath, file);
            const dest = path.join(destPath, file);
            
            if (fs.existsSync(src)) {
                if (src !== dest) { // Avoid copying to itself if already there
                    fs.copyFileSync(src, dest);
                    console.log(`✅ Synced: ${file}`);
                }
            } else {
                console.log(`❌ Source Missing: ${file} (Expected at ${src})`);
            }
        });

        // 3. Generate index.html
        fs.writeFileSync(path.join(process.cwd(), 'public', 'index.html'), this.generateHTML());

        // 4. Generate Netlify Configuration
        const netlifyConfig = `
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
    Access-Control-Allow-Origin = "*"
    Accept-Ranges = "bytes"
`;
        fs.writeFileSync('netlify.toml', netlifyConfig);

        console.log('🚀 Build Complete. Assets mapped and HTML generated.');
    }

    generateHTML() {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CLJ Multi-OS Power Bootloader</title>
    <style>
        body { background: #0b0e14; color: #e0e0e0; margin: 0; display: flex; flex-direction: column; align-items: center; font-family: 'Segoe UI', system-ui, sans-serif; height: 100vh; }
        .boot-panel { margin-top: 20px; background: #1c212c; padding: 15px 25px; border-radius: 8px; display: flex; gap: 15px; align-items: center; border-bottom: 3px solid #0078d7; z-index: 100; }
        select { background: #000; color: #00ff00; padding: 8px; border: 1px solid #333; font-family: monospace; border-radius: 4px; }
        button { padding: 8px 20px; cursor: pointer; background: #0078d7; color: white; border: none; border-radius: 4px; font-weight: bold; }
        #screen { width: 1024px; height: 768px; background: #000; margin-top: 15px; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
        .runtime-controls { display: none; margin-top: 10px; gap: 10px; }
        .btn-alt { background: #444; font-size: 12px; padding: 5px 10px; color: white; border: none; border-radius: 3px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="boot-panel" id="ui-panel">
        <strong style="color:#0078d7">CLJ Engine v2</strong>
        <select id="os-selector">
            <option value="kolibri">KolibriOS (Assembly GUI)</option>
            <option value="core">Tiny Core Linux 17 (Network Enabled)</option>
            <option value="slitaz">SliTaz 5-in-1 (Web Ready)</option>
            <option value="win101">Windows 1.01 (Legacy PIT-Sync)</option>
        </select>
        <button onclick="bootSystem()">POWER ON</button>
    </div>
    <div id="screen"></div>
    <div class="runtime-controls" id="runtime-ui">
        <button class="btn-alt" onclick="saveState()">Save Snapshot</button>
        <button class="btn-alt" onclick="emulator.restart()">Reset</button>
        <button class="btn-alt" onclick="emulator.screen_go_fullscreen()">Fullscreen</button>
    </div>
    <script src="/v86-assets/libv86.js"></script>
    <script>
        let emulator = null;

        async function saveState() {
            const state = await emulator.save_state();
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([state]));
            a.download = "v86_state.bin";
            a.click();
        }

        function bootSystem() {
            const os = document.getElementById('os-selector').value;
            const container = document.getElementById('screen');
            const constructor = typeof V86 === 'function' ? V86 : V86.V86Starter;

            const settings = {
                screen_container: container,
                bios: { url: '/v86-assets/seabios.bin' },
                vga_bios: { url: '/v86-assets/vgabios.bin' },
                wasm_path: '/v86-assets/v86.wasm',
                autostart: true,
                network_relay_url: "wss://relay.widgetry.org/",
            };

            switch(os) {
                case 'kolibri':
                    settings.fda = { url: '/v86-assets/kolibri.img' };
                    settings.memory_size = 256 * 1024 * 1024;
                    break;
                case 'core':
                    settings.cdrom = { url: '/v86-assets/Core-17.0.iso' };
                    settings.memory_size = 1024 * 1024 * 1024;
                    settings.vga_memory_size = 32 * 1024 * 1024;
                    settings.acpi = true;
                    break;
                case 'slitaz':
                    settings.cdrom = { url: '/v86-assets/slitaz-rolling-core-5in1.iso' };
                    settings.memory_size = 512 * 1024 * 1024;
                    settings.vga_memory_size = 16 * 1024 * 1024;
                    settings.acpi = true;
                    break;
                case 'win101':
                    settings.fda = { url: '/v86-assets/windows101.img' };
                    settings.memory_size = 8 * 1024 * 1024;
                    settings.pit_mode = 1;
                    settings.vga_memory_size = 2 * 1024 * 1024;
                    break;
            }

            try {
                emulator = new constructor(settings);
                document.getElementById('ui-panel').style.display = 'none';
                document.getElementById('runtime-ui').style.display = 'flex';
            } catch (err) {
                console.error("BOOT FAILURE:", err);
            }
        }
    </script>
</body>
</html>`;
    }
}

const engine = new CLJNetlifyEngine();
engine.start().catch(console.error);
