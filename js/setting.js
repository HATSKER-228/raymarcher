const Settings = (() => {
    // DOM refs
    const mouseSensSlider = document.getElementById('mouse-sens-slider');
    const mouseSensSpan   = document.getElementById('mouse-sens-span');
    const moveSpeedSlider = document.getElementById('move-speed-slider');
    const moveSpeedSpan   = document.getElementById('move-speed-span');
    const hudToggle       = document.getElementById('hud-toggle');
    const HUD             = document.getElementById('HUD');
    let curCap;

    // mouse sens slider
    mouseSensSlider.addEventListener('input', () => {
        const v = parseFloat(mouseSensSlider.value);
        Camera.setMouseSens(v);
        mouseSensSpan.textContent = v.toFixed(4);
    });

    // move speed slider
    moveSpeedSlider.addEventListener('input', () => {
        const v = parseFloat(moveSpeedSlider.value);
        Camera.setMoveSpeed(v);
        moveSpeedSpan.textContent = v.toFixed(2);
    });

    // HUD toggle
    hudToggle.addEventListener('change', () => {
        if (hudToggle.checked)
            HUD.classList.remove('hidden');
        else 
            HUD.classList.add('hidden');
    });

    function selectFpsCap(cap) {
        document.querySelectorAll('.fps-cap-btn').forEach(btn => { btn.classList.remove('active')});
        const btn = document.querySelector(`.fps-cap-btn[data-fps="${cap}"]`);
        if (!btn) return false;
        btn.classList.add('active');
        
        cap = parseFloat(cap);
        if (!cap) curCap = null;
        else curCap = cap;
        return true;
    }
    
    // FPS Cap Selector
    document.querySelectorAll('.fps-cap-btn').forEach(btn => {
        btn.addEventListener('click', () => selectFpsCap(btn.dataset.fps));
    });

    selectFpsCap(document.querySelector('.fps-cap-btn.active').dataset.fps);

    function getFpsCap() {
        return curCap;
    }

    return { getFpsCap };

})();