const FractalShaders = (() => {
    const registry = {
        0: {shader: MengerShader,     params: MengerParams},
        1: {shader: MandelbulbShader, params: MandelbulbParams},
        2: {shader: MandelboxShader,  params: MandelboxParams},
        3: {shader: SierpinskiShader, params: SierpinskiParams}
    };

    function get(fractalId) {
        return registry[fractalId] || registry[0];
    }

    return { get };
    
})();