(function () {
    const ok = Renderer.init();
    if (!ok) return;   // WebGL not available, Renderer already alerted the user

    // FPS
    let lastTime    = performance.now();
    let frameCount  = 0;
    let fpsTimer    = 0;       // accumulates ms since last FPS update
    const FPS_INTERVAL = 500;  // update FPS display every 500ms

    function loop(now) {
        const dtMs = now - lastTime;
        lastTime = now;
        const dt = dtMs / 1000; // seconds — used for frame-rate independent movement

        Camera.update(dt);

        const camPos = Camera.getPosition();
        const camYaw = Camera.getYaw();
        const camPitch = Camera.getPitch();

        Renderer.draw(camPos, camYaw, camPitch, UI.getActiveFractalId());
        UI.setStats(camPos, camYaw, camPitch);

        frameCount++;
        fpsTimer += dtMs;
        if (fpsTimer >= FPS_INTERVAL) {
            const fps = Math.round(frameCount / (fpsTimer / 1000));
            UI.setFPS(fps);
            frameCount = 0;
            fpsTimer   = 0;
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

})();
