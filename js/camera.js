const Camera = (() => {

    const position = { x: 0, y: 0, z: -6 };
    let yaw   = 0;   // radians
    let pitch = 0;   // radians

    let moveSpeed   = 0.825;  // units per second
    let mouseSens   = 0.001;  // radians per pixel
    const PITCH_LIMIT  = Math.PI / 2 - 0.01;

    const keys = {};

    function normalizeAngle(a) {
        a %= 2 * Math.PI;
        if (a > Math.PI)  a -= 2 * Math.PI;
        if (a < -Math.PI) a += 2 * Math.PI;
        return a;
    }

    document.addEventListener('keydown', e => { keys[e.code] = true;  });
    document.addEventListener('keyup',   e => { keys[e.code] = false; });

    document.addEventListener('mousemove', e => {
        if (!isLocked()) return;
        yaw   += e.movementX * mouseSens;
        yaw = normalizeAngle(yaw);
        pitch += e.movementY * mouseSens;
        pitch  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
    });

    function isLocked() {
        return document.pointerLockElement === document.getElementById('glCanvas');
    }

    // called once per frame from main.js
    // dt — time elapsed since previous frame, in seconds
    function update(dt) {
        if (!isLocked()) return;

        const step = moveSpeed * dt;

        // Horizontal movement
        const forward = {
            x:  Math.sin(yaw),
            y:  0,
            z:  Math.cos(yaw),
        };
        const right = {
            x:  Math.cos(yaw),
            y:  0,
            z: -Math.sin(yaw),
        };

        if (keys['KeyW']) {
            position.x += forward.x * step;
            position.z += forward.z * step;
        }
        if (keys['KeyS']) {
            position.x -= forward.x * step;
            position.z -= forward.z * step;
        }
        if (keys['KeyD']) {
            position.x += right.x * step;
            position.z += right.z * step;
        }
        if (keys['KeyA']) {
            position.x -= right.x * step;
            position.z -= right.z * step;
        }

        // Vertical movement
        if (keys['Space'])      position.y -= step;
        if (keys['ShiftLeft'])  position.y += step;
        if (keys['ShiftRight']) position.y += step;
    }

    // Public getters (renderer reads these as uniform values)
    function getPosition()  { return [position.x, position.y, position.z]; }
    function getYaw()       { return yaw;   }
    function getPitch()     { return pitch; }

    function setPosition(x, y, z) {
        position.x = x;
        position.y = y;
        position.z = z;
    }

    function setYaw(v)   { yaw = normalizeAngle(v); }
    function setPitch(v) { pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v)); }
    
    function setMouseSens(v) { mouseSens = v; }
    function setMoveSpeed(v) { moveSpeed = v; }

    return { update, getPosition, getYaw, getPitch, setPosition, setYaw, setPitch, setMouseSens, setMoveSpeed};

})();
