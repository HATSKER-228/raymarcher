const SierpinskiShader = {
    name: 'sierpinski',
    sdf: `
        float map(vec3 p) {
            const float SQRT3 = sqrt(3.0);
            const float SIZE = 4.0;

            mat3 R = mat3(
                (3.0-SQRT3)/6.0,    -SQRT3/3.0,   -(SQRT3+3.0)/6.0,
                SQRT3/3.0,          -SQRT3/3.0,   SQRT3/3.0,
                -(SQRT3+3.0)/6.0,   -SQRT3/3.0,   (3.0-SQRT3)/6.0
            );

            const float SCALE = 2.0;
            const int ITERATIONS = 11;

            float scale = 1.0;
            vec3 v1 = vec3(1.0, 1.0, 1.0);
            vec3 v2 = vec3(-1.0, -1.0, 1.0);
            vec3 v3 = vec3(1.0, -1.0, -1.0);
            vec3 v4 = vec3(-1.0, 1.0, -1.0);

            p /= SIZE;
            p *= R;

            for (int i=0; i < ITERATIONS; i++) {
                if (p.x + p.y < 0.0) p.xy = -p.yx;
                if (p.x + p.z < 0.0) p.xz = -p.zx;
                if (p.y + p.z < 0.0) p.yz = -p.zy;

                p = p * SCALE - v1 * (SCALE - 1.0);
                scale *= SCALE;
            }

            float d = (max(max(-dot(p, v1), -dot(p, v2)), max(-dot(p, v3), -dot(p, v4))) - 1.0) / sqrt(3.0);

            return d / scale * SIZE;
        }
    `
};
