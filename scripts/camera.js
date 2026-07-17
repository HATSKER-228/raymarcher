const Camera = (() => {

    const position = { x: 0, y: 0, z: -3 };
    let yaw   = 0;   // radians
    let pitch = 0;   // radians

    const MOVE_SPEED   = 0.005;   // units per frame
    const MOUSE_SENS   = 0.001;  // radians per pixel
    const PITCH_LIMIT  = Math.PI / 2 - 0.01;

    const keys = {};

    document.addEventListener('keydown', e => { keys[e.code] = true;  });
    document.addEventListener('keyup',   e => { keys[e.code] = false; });

    document.addEventListener('mousemove', e => {
        if (!isLocked()) return;
        yaw   += e.movementX * MOUSE_SENS;
        pitch += e.movementY * MOUSE_SENS;
        pitch  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
    });

    function isLocked() {
        return document.pointerLockElement === document.getElementById('glCanvas');
    }

    // called once per frame from main.js
    function update() {
        if (!isLocked()) return;

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
            position.x += forward.x * MOVE_SPEED;
            position.z += forward.z * MOVE_SPEED;
        }
        if (keys['KeyS']) {
            position.x -= forward.x * MOVE_SPEED;
            position.z -= forward.z * MOVE_SPEED;
        }
        if (keys['KeyD']) {
            position.x += right.x * MOVE_SPEED;
            position.z += right.z * MOVE_SPEED;
        }
        if (keys['KeyA']) {
            position.x -= right.x * MOVE_SPEED;
            position.z -= right.z * MOVE_SPEED;
        }

        // Vertical movement
        if (keys['Space'])      position.y -= MOVE_SPEED;
        if (keys['ShiftLeft'])  position.y += MOVE_SPEED;
        if (keys['ShiftRight']) position.y += MOVE_SPEED;
    }

    // Public getters (renderer reads these as uniform values)
    function getPosition()  { return [position.x, position.y, position.z]; }
    function getYaw()       { return yaw;   }
    function getPitch()     { return pitch; }

    return { update, getPosition, getYaw, getPitch };

})();
