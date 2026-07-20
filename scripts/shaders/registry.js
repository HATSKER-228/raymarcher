const FractalShaders = (() => {

    const registry = {
        0: MengerShader,
        // 1: MandelbulbShader,  //TODO
        // 2: MandelboxShader,   //TODO
        // 3: JuliaShader        //TODO
    };

    function get(fractalId) {
        return registry[fractalId] || registry[0];
    }

    return { get };
    
})();