(function () {
    const ok = Renderer.init();
    if (!ok) return;   // WebGL not available, Renderer already alerted the user

    // FPS
    const FPS_CAPS = [30, 60, 90, 120, null];
    let curCap = 90;
    let renderInterval = curCap ? 1000 / curCap : 0;
    let renderTimer = 0;

    let frameCount = 0;
    let fpsUpdateTimer = 0;            // accumulates ms since last FPS update
    const FPS_UPDATE_INTERVAL = 500;

    let last = performance.now();

    function loop(now) {
        const dtMs = now - last;
        const dt = dtMs / 1000; // seconds — used for frame-rate independent movement
        last = now;
        
        renderTimer += dtMs;
        fpsUpdateTimer += dtMs;

        Camera.update(dt);

        if (renderTimer >= renderInterval || curCap === null) {
            const camPos = Camera.getPosition();
            const camYaw = Camera.getYaw();
            const camPitch = Camera.getPitch();

            Renderer.draw(camPos, camYaw, camPitch, UI.getActiveFractalId());
            UI.setStats(camPos, camYaw, camPitch);

            renderTimer -= renderInterval;
            frameCount++;
        }

        if (fpsUpdateTimer >= FPS_UPDATE_INTERVAL) {
            const fps = Math.round(frameCount / (fpsUpdateTimer / 1000));
            UI.setDisplayedFPS(fps);
            frameCount = 0;
            fpsUpdateTimer = 0;
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

})();
