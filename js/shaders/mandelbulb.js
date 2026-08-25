const MandelbulbShader = `
    uniform float u_power;

    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.33, 0.67);
        
        return normalize(a + b * cos(2.0*PI * (c*t + d)));
    }

    float map(vec3 p) {
        const float SIZE = 4.0;
        const int ITERATIONS = 32;
        const float BAILOUT = 2.0;

        p /= SIZE;

        vec3 z = p;
        float dr = 1.0;
        float r  = 0.0;
        float trap = 1000.0;

        for (int i = 0; i < ITERATIONS; i++) {
            trap = min(trap, length(z));
            r = length(z);
            if (r > BAILOUT) break;

            dr = pow(r, u_power - 1.0) * u_power * dr + 1.0;
            
            float theta = acos(z.z / r);
            float phi   = atan(z.y, z.x);

            r = pow(r, u_power);
            theta *= u_power;
            phi   *= u_power;

            float coord_x = r * sin(theta) * cos(phi);
            float coord_y = r * sin(theta) * sin(phi);
            float coord_z = r * cos(theta);

            z = vec3(coord_x, coord_y, coord_z) + p;
        }
        
        g_orbitColor = palette(trap*2.0);

        return 0.5 * log(r) * r / dr * SIZE;
    }
`;

const MandelbulbParams = [
    {key: 'power', uniform: 'u_power', min: 3.0, max: 14.0, default: 8.0}
];