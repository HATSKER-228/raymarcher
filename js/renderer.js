const Renderer = (() => {

    let gl = null;
    let canvas = null;
    let vbo = null;

    let currentProgram = null;   // { program, aPosition, uResolution, uCamPos, uYaw, uPitch }
    let currentFractalId = null;
    const programCache = {};

    const QUAD = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ]);

    function compileShader(type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('[Shader error]', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(vertSrc, fragSrc) {
        const vert = compileShader(gl.VERTEX_SHADER, vertSrc);
        const frag = compileShader(gl.FRAGMENT_SHADER, fragSrc);
        if (!vert || !frag) return null;

        const prog = gl.createProgram();
        gl.attachShader(prog, vert);
        gl.attachShader(prog, frag);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('[Program error]', gl.getProgramInfoLog(prog));
            return null;
        }
        return prog;
    }

    function buildProgramFor(fractalId) {
        const fractalDef = FractalShaders.get(fractalId);
        const fragSrc = ShaderCommon.build(fractalDef.shader);
        const program = createProgram(ShaderCommon.VERT_SRC, fragSrc);
        if (!program) return null;
        
        let uniformLocations = {};
        for (const param of fractalDef.params) {
            uniformLocations[param.key] = gl.getUniformLocation(program, param.uniform);
        }

        return {
            program,
            aPosition:      gl.getAttribLocation(program, 'a_position'),
            uResolution:    gl.getUniformLocation(program, 'u_resolution'),
            uCamPos:        gl.getUniformLocation(program, 'u_cam_pos'),
            uYaw:           gl.getUniformLocation(program, 'u_yaw'),
            uPitch:         gl.getUniformLocation(program, 'u_pitch'),
            uUseColors:     gl.getUniformLocation(program, 'u_useColors'),
            paramLocations: uniformLocations,
            params:         fractalDef.params
        };
    }

    function useFractal(fractalId) {
        if (fractalId === currentFractalId && currentProgram) return;

        if (!programCache[fractalId]) {
            const built = buildProgramFor(fractalId);
            if (!built) {
                console.error('[Renderer] не вдалось скомпілювати шейдер для фрактала', fractalId);
                return;
            }
            programCache[fractalId] = built;
        }

        currentProgram = programCache[fractalId];
        currentFractalId = fractalId;

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(currentProgram.aPosition);
        gl.vertexAttribPointer(currentProgram.aPosition, 2, gl.FLOAT, false, 0, 0);
    }

    function init() {
        canvas = document.getElementById('glCanvas');
        gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            alert('WebGL is not supported in your browser.');
            return false;
        }

        resize();
        window.addEventListener('resize', resize);

        vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

        useFractal(0); // Menger за замовчуванням
        if (!currentProgram) return false;

        gl.clearColor(0.02, 0.03, 0.05, 1.0);

        console.log('[Renderer] WebGL context ready.');
        return true;
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(camPos, camYaw, camPitch, fractalId, paramValues, useColors) {
        if (!gl) return;

        useFractal(fractalId);
        if (!currentProgram) return;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(currentProgram.program);

        gl.uniform2f(currentProgram.uResolution, canvas.width, canvas.height);
        gl.uniform3fv(currentProgram.uCamPos, camPos);
        gl.uniform1f(currentProgram.uYaw, camYaw);
        gl.uniform1f(currentProgram.uPitch, camPitch);
        gl.uniform1i(currentProgram.uUseColors, useColors);
        
        for (const param of currentProgram.params) {
            const loc   = currentProgram.paramLocations[param.key];
            const value = paramValues[param.key];
            gl.uniform1f(loc, value);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return { init, draw };

})();