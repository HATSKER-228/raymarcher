const ShaderCommon = (() => {

    const VERT_SRC = `
        attribute vec2 a_position;

        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAG_HEADER = `        
        precision highp float;

        uniform vec2  u_resolution;
        uniform vec3  u_cam_pos;
        uniform float u_yaw;
        uniform float u_pitch;
        uniform bool  u_useColors;

        const float PI = 3.14159265359;
        vec3 g_orbitColor = vec3(1.0);
    `;

    const FRAG_FOOTER = `
        vec3 palette(float t) {
            vec3 a = vec3(0.5, 0.5, 0.5);
            vec3 b = vec3(0.5, 0.5, 0.5);
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec3 d = vec3(0.0, 0.33, 0.67);
            
            return normalize(a + b * cos(2.0*PI * (c*t + d)));
        }

        vec3 calcNormal(vec3 p) {
            const float e = 0.00001;
            const vec3 d1 = vec3(1, -1, -1);
            const vec3 d2 = vec3(-1, -1, 1);
            const vec3 d3 = vec3(-1, 1, -1);
            const vec3 d4 = vec3(1, 1, 1);

            return normalize(
                d1 * map(p + e*d1) +
                d2 * map(p + e*d2) + 
                d3 * map(p + e*d3) +
                d4 * map(p + e*d4)
            );
        }

        float raymarch(vec3 origin, vec3 direction) {
            float t = 0.0;

            for (int i = 0; i < 256; i++) {
                vec3 p = origin + t * direction;
                float d = map(p);

                if (d < 0.0006 * t) return t;
                if (t > 40.0) break;

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

            if (u_useColors) {
                map(p);         // setting g_orbitColor
            } else {
                g_orbitColor = vec3(1.0);
            }
            vec3 color = g_orbitColor;

            vec3 n = calcNormal(p);

            vec3 lightDir = normalize(vec3(0.5, -2.0, -1.0));
            float diffuse = max(dot(n, lightDir), 0.0);
            float ambient = 0.5;

            float brightness = ambient + diffuse;
            gl_FragColor = vec4(color*brightness, 1.0);
        }
    `;

    function build(sdfSrc) {
        return FRAG_HEADER + '\n' + sdfSrc + '\n' + FRAG_FOOTER;
    }

    return { VERT_SRC, build };

})();