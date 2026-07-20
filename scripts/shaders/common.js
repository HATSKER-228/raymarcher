const ShaderCommon = (() => {

    const VERT_SRC = `
        attribute vec2 a_position;

        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAG_HEADER = `        
        precision mediump float;

        uniform vec2 u_resolution;
        uniform vec3 u_cam_pos;
        uniform float u_yaw;
        uniform float u_pitch;
    `;

    const FRAG_FOOTER = `
        vec3 calcNormal(vec3 p) {
            float e = 0.001;
            return normalize(vec3(
                map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
                map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
                map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
            ));
        }

        float raymarch(vec3 origin, vec3 direction) {
            float t = 0.0;

            for (int i = 0; i < 128; i++) {
                vec3 p = origin + t * direction;
                float d = map(p);

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

    function build(sdfSrc) {
        return FRAG_HEADER + '\n' + sdfSrc + '\n' + FRAG_FOOTER;
    }

    return { VERT_SRC, build };

})();