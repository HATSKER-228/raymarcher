const MandelboxShader = `
    uniform float u_scale;

    float map(vec3 point) {
        const int ITERATIONS = 12;

        const float MIN_RADIUS2  = 0.25;   // minRadius^2  (minRadius = 0.5)
        const float FIXED_RADIUS2 = 1.0;   // fixedRadius^2 (fixedRadius = 1.0)

        vec3  p  = point;
        float dr = 1.0;

        for (int i = 0; i < ITERATIONS; i++) {
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

        return length(p) / abs(dr);
    }
`;

const MandelboxParams = [
    {key: 'scale', uniform: 'u_scale', min: -6.0, max: 6.0, default: 3.0}
];