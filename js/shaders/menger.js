const MengerShader = `
    float map(vec3 p) {
        const float SIZE = 4.0;
        p /= SIZE;

        float d = max(max(abs(p.x) - 1.0,
                            abs(p.y) - 1.0),
                            abs(p.z) - 1.0);
        float scale = 1.0;
        
        vec3 v1 = vec3(1.0, 1.0, 1.0);
        vec3 v2 = vec3(-1.0, -1.0, 1.0);
        vec3 v3 = vec3(1.0, -1.0, -1.0);
        vec3 v4 = vec3(-1.0, 1.0, -1.0);

        vec3 c1 = vec3(1.0, 0.0, 0.0);
        vec3 c2 = vec3(0.0, 1.0, 0.0);
        vec3 c3 = vec3(0.0, 0.0, 1.0);
        vec3 c4 = vec3(1.0, 1.0, 0.0);
        
        float d1 = 1.0/pow(distance(p, v1), 2.0);
        float d2 = 1.0/pow(distance(p, v2), 2.0);
        float d3 = 1.0/pow(distance(p, v3), 2.0);
        float d4 = 1.0/pow(distance(p, v4), 2.0);

        float sumd = d1 + d2 + d3 + d4;

        float w1 = d1 / sumd;
        float w2 = d2 / sumd;
        float w3 = d3 / sumd;
        float w4 = d4 / sumd;

        g_orbitColor = c1*w1 + c2*w2 + c3*w3 + c4*w4;

        for (int i = 0; i < 10; i++) {
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
        
        return d * SIZE;
    }
`;

const MengerParams = []; // empty b/c no uniform variables
