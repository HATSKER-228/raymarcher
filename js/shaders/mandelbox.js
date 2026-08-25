const MandelboxShader = `
    uniform float u_scale;

    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.33, 0.67) + vec3(0.85);
        
        return normalize(a + b * cos(2.0*PI * (c*t + d)));
    }

    float map(vec3 point) {
        const int ITERATIONS = 12;

        const float MIN_RADIUS2  = 0.25;   // minRadius^2  (minRadius = 0.5)
        const float FIXED_RADIUS2 = 1.0;   // fixedRadius^2 (fixedRadius = 1.0)

        vec3  p  = point;
        float dr = 1.0;
        float trap = 1000.0;

        for (int i = 0; i < ITERATIONS; i++) {
            trap = min(trap, length(p));
            p = clamp(p, -1.0, 1.0) * 2.0 - p;

            float r2 = dot(p, p);
            if (r2 < MIN_RADIUS2) {
                float factor = FIXED_RADIUS2 / MIN_RADIUS2;
                p  *= factor;
                dr *= factor;
            } else if (r2 < FIXED_RADIUS2) {
                float factor = FIXED_RADIUS2 / r2;
                p  *= factor;
                dr *= factor;
            }

            p  = p * u_scale + point;
            dr = dr * abs(u_scale) + 1.0;
        }
                    
        g_orbitColor = palette(log(dr)*2.0);

        return length(p) / abs(dr);
    }
`;

const MandelboxParams = [
    {key: 'scale', uniform: 'u_scale', min: -6.0, max: 6.0, default: 3.0}
];