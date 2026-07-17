(function () {
    const ok = Renderer.init();
    if (!ok) return;   // WebGL not available, Renderer already alerted the user

    // FPS
    let lastTime    = performance.now();
    let frameCount  = 0;
    let fpsTimer    = 0;       // accumulates ms since last FPS update
    const FPS_INTERVAL = 500;  // update FPS display every 500ms

    function loop(now) {
        const dt = now - lastTime;
        lastTime = now;

        Camera.update();

        Renderer.draw(
            Camera.getPosition(),
            Camera.getYaw(),
            Camera.getPitch(),
            UI.getActiveFractalId()
        );

        frameCount++;
        fpsTimer += dt;
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
