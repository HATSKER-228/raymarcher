const UI = (() => {
    let activeFractal = 0;  // default

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

    function selectFractal(id) {
        document.querySelectorAll('.fractal-item:not(.locked)').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.fractal-tag').textContent = '';
        });
        const item = document.querySelector(`.fractal-item[data-fractal="${id}"]:not(.locked)`);
        if (!item) return false;
        item.classList.add('active');
        item.querySelector('.fractal-tag').textContent = 'ACTIVE';
        activeFractal = id;
        Settings.showFractalParams(id);
        return true;
    }

    document.querySelectorAll('.fractal-item:not(.locked)').forEach(item => {
        item.addEventListener('click', () => selectFractal(item.dataset.fractal));
    });


    function selectTab(name) {
        document.querySelectorAll('.tab-btn').forEach(i => { i.classList.remove('active'); });
        document.querySelectorAll('.tab').forEach(i => { i.classList.add('hidden'); });

        const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
        if (!btn) return false;
        btn.classList.add('active');

        const tab = document.querySelector(`.tab[data-tab="${name}"]`);
        if (!tab) return false;
        tab.classList.remove('hidden');
    }

    document.querySelectorAll('.tab-btn').forEach(item => {
        item.addEventListener('click', () => selectTab(item.dataset.tab));
    });

    // setting HUD

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

    // copy/paste location

    function encodeLocation() {
        const [x, y, z] = Camera.getPosition();
        const yaw   = Camera.getYaw();
        const pitch = Camera.getPitch();
        const params = FractalShaders.get(activeFractal).params;
        const values = Settings.getFractalParams(activeFractal);

        const baseStrings = [x, y, z, yaw, pitch].map(n => n.toFixed(4));
        const paramStrings = params.map(param => values[param.key].toFixed(4));
        const allValues = baseStrings.concat(paramStrings);

        return `${activeFractal}:${allValues.join(',')}`;
    }

    function applyLocation(str) {
        const [idPart, valuesPart] = str.trim().split(':');

        if (!valuesPart) {
            console.warn('[UI] invalid location string:', str);
            return false;
        }

        const fractalId = parseInt(idPart);
        const nums = valuesPart.split(',').map(parseFloat);

        if (isNaN(fractalId) || nums.length < 5 || nums.slice(0, 5).some(isNaN)) {
            console.warn('[UI] invalid location string:', str);
            return false;
        }

        if (selectFractal(fractalId)) {
            Camera.setPosition(nums[0], nums[1], nums[2]);
            Camera.setYaw(nums[3]);
            Camera.setPitch(nums[4]);

            const params = FractalShaders.get(fractalId).params;
            params.forEach((param, i) => {
                let value = nums.slice(5)[i];
                if (value === undefined || isNaN(value)) {
                    value = param.default;
                } else {
                    value = Math.min(Math.max(param.min, value), param.max);
                }

                Settings.setFractalParam(fractalId, param.key, value);
            });
        }
        
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
        return activeFractal;
    }

    return { setDisplayedFPS, setStats, getActiveFractalId };

})();
