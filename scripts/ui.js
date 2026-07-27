const UI = (() => {
    const FRACTAL_IDS = {
        menger:     0,
        mandelbulb: 1,
        mandelbox:  2,
        julia:      3,
    };

    let activeFractal = 'menger';  // default

    // DOM refs
    const overlay      = document.getElementById('start-overlay');
    const startBtn     = document.getElementById('start-btn');
    const panel        = document.getElementById('ui-panel');
    const canvas       = document.getElementById('glCanvas');
    const fpsCounter   = document.getElementById('fps-counter');
    const clickHint    = document.getElementById('click-hint');
    const posLine      = document.getElementById('pos-line');
    const angLine      = document.getElementById('ang-line');
    const copyLocBtn   = document.getElementById('copy-loc-btn');
    const locInput     = document.getElementById('loc-input');
    const gotoLocBtn   = document.getElementById('goto-loc-btn');

    // Pointer lock
    startBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        panel.classList.remove('hidden');
        clickHint.classList.remove('hidden');
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            // Cursor locked: fly mode
            panel.classList.add('hidden');
            clickHint.classList.add('hidden');
        } else {
            // Cursor released: show UI
            panel.classList.remove('hidden');
            clickHint.classList.remove('hidden');
        }
    });

    // Click canvas while unlocked, re-lock
    canvas.addEventListener('click', () => {
        if (overlay.classList.contains('hidden')) {
            canvas.requestPointerLock();
        }
    });

    // Esc is handled automatically by the browser

    function selectFractal(name) {
        document.querySelectorAll('.fractal-item:not(.locked)').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.fractal-tag').textContent = '';
        });
        const item = document.querySelector(`.fractal-item[data-fractal="${name}"]:not(.locked)`);
        if (!item) return false;
        item.classList.add('active');
        item.querySelector('.fractal-tag').textContent = 'ACTIVE';
        activeFractal = name;
        return true;
    }

    document.querySelectorAll('.fractal-item:not(.locked)').forEach(item => {
        item.addEventListener('click', () => selectFractal(item.dataset.fractal));
    });

    function setDisplayedFPS(fps) {
        fpsCounter.textContent = fps + ' FPS';
    }

    function setStats(camPos, yaw, pitch) {
        const [x, y, z] = camPos;
        posLine.textContent = `XYZ: ${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}`;
        const yawDeg   = (yaw   * 180 / Math.PI).toFixed(1);
        const pitchDeg = (pitch * 180 / Math.PI).toFixed(1);
        angLine.textContent = `YAW: ${yawDeg}°  PITCH: ${pitchDeg}°`;
    }

    function encodeLocation() {
        const [x, y, z] = Camera.getPosition();
        const yaw   = Camera.getYaw();
        const pitch = Camera.getPitch();
        return `${activeFractal}:${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)},${yaw.toFixed(4)},${pitch.toFixed(4)}`;
    }

    function applyLocation(str) {
        const match = str.trim().match(
            /^(\w+):(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)$/
        );
        if (!match) {
            console.warn('[UI] invalid location string:', str);
            return false;
        }
        const [, fractalName, x, y, z, yaw, pitch] = match;

        if (FRACTAL_IDS[fractalName] !== undefined)
            selectFractal(fractalName);

        Camera.setPosition(parseFloat(x), parseFloat(y), parseFloat(z));
        Camera.setYaw(parseFloat(yaw));
        Camera.setPitch(parseFloat(pitch));
        return true;
    }

    copyLocBtn.addEventListener('click', () => {
        const loc = encodeLocation();
        navigator.clipboard.writeText(loc).then(() => {
            copyLocBtn.classList.add('copied');
            const original = copyLocBtn.textContent;
            copyLocBtn.textContent = 'COPIED!';
            setTimeout(() => {
                copyLocBtn.classList.remove('copied');
                copyLocBtn.textContent = original;
            }, 1200);
        }).catch(err => console.error('[UI] can\'t copy', err));
    });

    gotoLocBtn.addEventListener('click', () => {
        applyLocation(locInput.value);
    });
    locInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') applyLocation(locInput.value);
    });

    function getActiveFractalId() {
        return FRACTAL_IDS[activeFractal] ?? 0;
    }

    return { setDisplayedFPS, setStats, getActiveFractalId };

})();
