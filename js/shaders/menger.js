const MengerShader = `
    float map(vec3 p) {
        const float SIZE = 4.0;
        p /= SIZE;

        float d = max(max(abs(p.x) - 1.0,
                            abs(p.y) - 1.0),
                            abs(p.z) - 1.0);
        float scale = 1.0;

        for (int i = 0; i < 8; i++) {
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
