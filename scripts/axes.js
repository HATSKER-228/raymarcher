const Renderer = (() => {

    let gl      = null;
    let canvas  = null;
    let program = null;

    let aPosition, aColor;
    let uMVP;

    // Shaders
    const VERT_SRC = `
        attribute vec3 a_position;
        attribute vec3 a_color;
        uniform mat4 u_mvp;
        varying vec3 v_color;

        void main() {
            gl_Position = u_mvp * vec4(a_position, 1.0);
            v_color = a_color;
        }
    `;

    const FRAG_SRC = `
        precision mediump float;
        varying vec3 v_color;

        void main() {
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    const AXES_VERTICES = new Float32Array([
    //   x     y     z     r     g     b
        0.0,  0.0,  0.0,  1.0,  0.0,  0.0,   // X-axis start
        1.0,  0.0,  0.0,  1.0,  0.0,  0.0,   // X-axis end
        0.0,  0.0,  0.0,  0.0,  1.0,  0.0,   // Y-axis start
        0.0,  1.0,  0.0,  0.0,  1.0,  0.0,   // Y-axis end
        0.0,  0.0,  0.0,  0.0,  0.0,  1.0,   // Z-axis start
        0.0,  0.0,  1.0,  0.0,  0.0,  1.0,   // Z-axis end
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
        const vert = compileShader(gl.VERTEX_SHADER,   vertSrc);
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

    function init() {
        canvas = document.getElementById('glCanvas');
        gl     = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) { alert('WebGL не підтримується.'); return false; }

        resize();
        window.addEventListener('resize', resize);

        // Complile shader and linking
        program = createProgram(VERT_SRC, FRAG_SRC);
        if (!program) return false;

        aPosition = gl.getAttribLocation(program,  'a_position');
        aColor    = gl.getAttribLocation(program,  'a_color');
        uMVP      = gl.getUniformLocation(program, 'u_mvp');

        // LOad data into GPU (VBO)
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, AXES_VERTICES, gl.STATIC_DRAW);

        // structure of data in VBO
        const FLOAT = 4;           // size of float in bytes
        const STRIDE = 6 * FLOAT;  // distance between vertices

        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, STRIDE, 0);

        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 3 * FLOAT);

        gl.clearColor(0.02, 0.03, 0.05, 1.0);
        gl.enable(gl.DEPTH_TEST);

        console.log('[Renderer] ініціалізовано');
        return true;
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(camPos, camYaw, camPitch, fractalId) {
        if (!gl) return;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        const mvp = buildMVP(camPos, camYaw, camPitch);
        gl.uniformMatrix4fv(uMVP, false, mvp);

        gl.drawArrays(gl.LINES, 0, 6);
    }


    function buildMVP(camPos, yaw, pitch) {
        const view = buildView(camPos, yaw, pitch);
        const proj = buildProjection(75, canvas.width / canvas.height, 0.01, 100.0);
        return mat4Multiply(proj, view);  // Model = identity, skip
    }

    function buildView(pos, yaw, pitch) {
        // forward vector
        const fx = Math.sin(yaw) * Math.cos(pitch);
        const fy = Math.sin(pitch);
        const fz = Math.cos(yaw) * Math.cos(pitch);

        // right vector
        const rx =  Math.cos(yaw);
        const ry =  0;
        const rz = -Math.sin(yaw);

        // up vector = cross product of forward and right
        const ux = ry * fz - rz * fy;
        const uy = rz * fx - rx * fz;
        const uz = rx * fy - ry * fx;

        const [ex, ey, ez] = pos;

        return new Float32Array([
            rx,                ux,                -fx,               0,
            ry,                uy,                -fy,               0,
            rz,                uz,                -fz,               0,
            -(rx*ex+ry*ey+rz*ez), -(ux*ex+uy*ey+uz*ez), (fx*ex+fy*ey+fz*ez), 1,
        ]);
    }

    // perspective projection
    function buildProjection(fovDeg, aspect, near, far) {
        const f = 1.0 / Math.tan(fovDeg * Math.PI / 360);
        const d = far - near;
        return new Float32Array([
            f / aspect, 0,  0,                     0,
            0,          f,  0,                     0,
            0,          0, -(far + near) / d,      -1,
            0,          0, -(2 * far * near) / d,   0,
        ]);
    }

    // matrices multiplication
    function mat4Multiply(a, b) {
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row] * b[col * 4 + k];
                }
                out[col * 4 + row] = sum;
            }
        }
        return out;
    }

    return { init, draw };

})();