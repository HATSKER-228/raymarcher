const Settings = (() => {
    
    // DOM refs
    const mouseSensSlider = document.getElementById('mouse-sens-slider');
    const mouseSensSpan   = document.getElementById('mouse-sens-span');
    const moveSpeedSlider = document.getElementById('move-speed-slider');
    const moveSpeedSpan   = document.getElementById('move-speed-span');
    const hudToggle       = document.getElementById('hud-toggle');
    const HUD             = document.getElementById('HUD');
    // mouse sens slider
    mouseSensSlider.addEventListener('input', () => {
        v = parseFloat(mouseSensSlider.value);
        Camera.setMouseSens(v);
        mouseSensSpan.textContent = v.toFixed(4);
    });

    // move speed slider
    moveSpeedSlider.addEventListener('input', () => {
        v = parseFloat(moveSpeedSlider.value);
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

})();