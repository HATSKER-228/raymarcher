const FractalShaders = (() => {

    const registry = {
        0: MengerShader,
        // 1: MandelbulbShader,  //TODO
        2: MandelboxShader,
        3: SierpinskiShader
    };

    function get(fractalId) {
        return registry[fractalId] || registry[0];
    }

    return { get };
    
})();