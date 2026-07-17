const Renderer = (() => {

    let gl       = null;
    let canvas   = null;
    let program  = null;

    let aPosition;
    let uResolution, uCamPos, uYaw, uPitch;

    // Shaders
    const VERT_SRC = `
        attribute vec2 a_position;

        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAG_SRC = `
        precision mediump float;

        uniform vec2 u_resolution;
        uniform vec3 u_cam_pos;
        uniform float u_yaw;
        uniform float u_pitch;

        float mengerSDF(vec3 p) {
            float d = max(max(abs(p.x) - 1.0,
                              abs(p.y) - 1.0),
                              abs(p.z) - 1.0);
            float scale = 1.0;

            for (int i = 0; i < 5; i++) {
                vec3 p = mod(p * scale, 2.0) - 1.0;
                p = abs(1.0 - 3.0 * abs(p));
                scale *= 3.0;

                float cx = max(abs(p.y), abs(p.z));
                float cy = max(abs(p.x), abs(p.z));
                float cz = max(abs(p.x), abs(p.y));

                float crossDist = min(min(cx, cy), cz) - 1.0;
                crossDist = crossDist / scale;

                d = max(d, crossDist);
            }
            
            return d;
        }

        vec3 calcNormal(vec3 p) {
            float e = 0.001;
            return normalize(vec3(
                mengerSDF(p + vec3(e, 0, 0)) - mengerSDF(p - vec3(e, 0, 0)),
                mengerSDF(p + vec3(0, e, 0)) - mengerSDF(p - vec3(0, e, 0)),
                mengerSDF(p + vec3(0, 0, e)) - mengerSDF(p - vec3(0, 0, e))
            ));
        }

        float raymarch(vec3 origin, vec3 direction) {
            float t = 0.0;

            for (int i = 0; i < 128; i++) {
                vec3 p = origin + t * direction;
                float d = mengerSDF(p);

                if (d < 0.001) return t;
                if (t > 100.0) break;

                t += d;
            }

            return -1.0;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
            uv.x *= u_resolution.x / u_resolution.y;

            vec3 forward = normalize(vec3(
                sin(u_yaw) * cos(u_pitch),
                sin(u_pitch),
                cos(u_yaw) * cos(u_pitch)
            ));

            vec3 right = normalize(vec3(
                cos(u_yaw),
                0.0,
                -sin(u_yaw)
            ));

            vec3 up = cross(right, forward);

            vec3 origin = u_cam_pos;
            vec3 direction = normalize(forward + uv.x * right + uv.y * up);

            float t = raymarch(origin, direction);
            if (t < 0.0) {
                gl_FragColor = vec4(0.02, 0.03, 0.05, 1.0);
                return;
            }
            
            vec3 p = origin + t * direction;
            vec3 n = calcNormal(p);

            vec3 lightDir = normalize(vec3(1.0, -2.0, 1.0));
            float diffuse = max(dot(n, lightDir), 0.0);
            float ambient = 0.25;

            float brightness = ambient + diffuse;
            gl_FragColor = vec4(vec3(brightness), 1.0);
        }
    `;

    const QUAD  = new Float32Array([
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

        if (!gl) {
            alert('WebGL is not supported in your browser.');
            return false;
        }

        resize();
        window.addEventListener('resize', resize);

        program = createProgram(VERT_SRC, FRAG_SRC);
        if (!program) return false;

        aPosition   = gl.getAttribLocation( program, 'a_position');
        uResolution = gl.getUniformLocation(program, 'u_resolution');
        uCamPos     = gl.getUniformLocation(program, 'u_cam_pos');
        uYaw        = gl.getUniformLocation(program, 'u_yaw');
        uPitch      = gl.getUniformLocation(program, 'u_pitch');

        // LOad data into GPU (VBO)
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.clearColor(0.02, 0.03, 0.05, 1.0);
        gl.enable(gl.DEPTH_TEST);

        console.log('[Renderer] WebGL context ready. Shader stub active.');
        return true;
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // called every frame from main.js
    function draw(camPos, camYaw, camPitch, fractalId) {
        if (!gl) return;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform3fv(uCamPos, camPos);
        gl.uniform1f(uYaw, camYaw);
        gl.uniform1f(uPitch, camPitch);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return { init, draw };

})();
