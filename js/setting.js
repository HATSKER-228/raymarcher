const Settings = (() => {
    // DOM refs
    const mouseSensSlider  = document.getElementById('mouse-sens-slider');
    const mouseSensSpan    = document.getElementById('mouse-sens-span');
    const moveSpeedSlider  = document.getElementById('move-speed-slider');
    const moveSpeedSpan    = document.getElementById('move-speed-span');
    const hudToggle        = document.getElementById('hud-toggle');
    const HUD              = document.getElementById('HUD');
    const useColorsToggle  = document.getElementById("use-colors-toggle");
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

    function getUseColors() {
        return useColorsToggle.checked;
    }
    
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

    // fractals' uniform params

    let fractalParamValues = {};
    for (let id = 0; id < 4; id++) {
        const params = FractalShaders.get(id).params;
        const values = {};
        params.forEach(param => { values[param.key] = param.default; });
        fractalParamValues[id] = values;
    }

    showFractalParams(0); // menger by default

    function getFractalParams(id) {
        return fractalParamValues[id] || {};
    }

    function setFractalParam(id, key, value) {
        fractalParamValues[id][key] = value;

        const slider = document.querySelector(`.fractal-params-block[data-fractal="${id}"] input[data-key="${key}"]`);
        const span   = document.querySelector(`.fractal-params-block[data-fractal="${id}"] span[data-key="${key}"]`);
        if (slider) slider.value = value;
        if (span) span.textContent = value.toFixed(2);
    }

    // update value in storage based on slider
    document.querySelectorAll('.fractal-param-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            const key = slider.dataset.key;
            const block = slider.closest('.fractal-params-block');
            const id = parseInt(block.dataset.fractal);
            const value = parseFloat(slider.value);
            setFractalParam(id, key, value);
        });
    });

    function showFractalParams(id) {
        const subtitle = document.querySelector('#fractal-params-subtitle');
        document.querySelectorAll('.fractal-params-block').forEach(block => { block.classList.add('hidden'); });
        const target = document.querySelector(`.fractal-params-block[data-fractal="${id}"]`);
        if (target) target.classList.remove('hidden');
        
        if (id == 0)
                subtitle.classList.add('hidden');
            else
                subtitle.classList.remove('hidden');
    }

    function getFpsCap() {
        return curCap;
    }

    return { getFpsCap, getFractalParams, setFractalParam, showFractalParams, getUseColors };

})();