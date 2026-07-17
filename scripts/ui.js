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

    // Fractal selector
    document.querySelectorAll('.fractal-item:not(.locked)').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.fractal-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.fractal-tag').textContent = 'SOON';
            });
            item.classList.add('active');
            item.querySelector('.fractal-tag').textContent = 'ACTIVE';
            activeFractal = item.dataset.fractal;
        });
    });

    // FPS display
    function setFPS(fps) {
        fpsCounter.textContent = fps + ' FPS';
    }

    // Public API
    function getActiveFractalId() {
        return FRACTAL_IDS[activeFractal] ?? 0;
    }

    return { setFPS, getActiveFractalId };

})();
