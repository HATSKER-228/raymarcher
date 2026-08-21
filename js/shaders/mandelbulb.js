MandelbulbShader = `
    float map(vec3 p) {
        const float SIZE = 4.0;
        const int ITERATIONS = 32;
        
        const float POWER = 8.0;
        const float BAILOUT = 2.0;

        p /= SIZE;

        vec3 z = p;
        float dr = 1.0;
        float r  = 0.0;

        for (int i=0; i < ITERATIONS; i++) {
            r = length(z);
            if (r > BAILOUT) break;

            dr = pow(r, POWER - 1.0) * POWER * dr + 1.0;
            
            float theta = acos(z.z / r);
            float phi   = atan(z.y, z.x);

            r = pow(r, POWER);
            theta *= POWER;
            phi   *= POWER;

            float coord_x = r * sin(theta) * cos(phi);
            float coord_y = r * sin(theta) * sin(phi);
            float coord_z = r * cos(theta);

            z = vec3(coord_x, coord_y, coord_z) + p;
        }

        return 0.5 * log(r) * r / dr * SIZE;
    }
`;