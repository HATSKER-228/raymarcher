const SierpinskiShader = `
    uniform float u_scale;

    float map(vec3 p) {
        const float SQRT3 = sqrt(3.0);
        const float SIZE = 4.0;
        const int ITERATIONS = 15;

        mat3 R = mat3(
            (3.0-SQRT3)/6.0,    -SQRT3/3.0,   -(SQRT3+3.0)/6.0,
            SQRT3/3.0,          -SQRT3/3.0,   SQRT3/3.0,
            -(SQRT3+3.0)/6.0,   -SQRT3/3.0,   (3.0-SQRT3)/6.0
        );

        p /= SIZE;
        p *= R;

        float scale = 1.0;
        vec3 v1 = vec3(1.0, 1.0, 1.0);
        vec3 v2 = vec3(-1.0, -1.0, 1.0);
        vec3 v3 = vec3(1.0, -1.0, -1.0);
        vec3 v4 = vec3(-1.0, 1.0, -1.0);

        vec3 c1 = vec3(1.0, 0.0, 0.0);
        vec3 c2 = vec3(0.0, 1.0, 0.0);
        vec3 c3 = vec3(0.0, 0.0, 1.0);
        vec3 c4 = vec3(1.0, 1.0, 0.0);
        
        float d1 = 1.0/pow(distance(p, v1), 1.5);
        float d2 = 1.0/pow(distance(p, v2), 1.5);
        float d3 = 1.0/pow(distance(p, v3), 1.5);
        float d4 = 1.0/pow(distance(p, v4), 1.5);

        float sumd = d1 + d2 + d3 + d4;

        float w1 = d1 / sumd;
        float w2 = d2 / sumd;
        float w3 = d3 / sumd;
        float w4 = d4 / sumd;

        g_orbitColor = c1*w1 + c2*w2 + c3*w3 + c4*w4;
        

        for (int i=0; i < ITERATIONS; i++) {
            if (p.x + p.y < 0.0) p.xy = -p.yx;
            if (p.x + p.z < 0.0) p.xz = -p.zx;
            if (p.y + p.z < 0.0) p.yz = -p.zy;

            p = p * u_scale - v1 * (u_scale - 1.0);
            scale *= u_scale;
        }

        float d = (max(max(-dot(p, v1), -dot(p, v2)), max(-dot(p, v3), -dot(p, v4))) - 1.0) / sqrt(3.0);

        return d / scale * SIZE;
    }
`;

const SierpinskiParams = [
    {key: 'scale', uniform: 'u_scale', min: 1.5, max: 4.0, default: 2.0}
];