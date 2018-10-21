
function sprite (options) {
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    that.loop = options.loop;

    that.render = function (x, y) {
		// Clear the canvas
		that.context.clearRect(0, 0, that.width, that.height);

        // Draw the animation
        that.context.drawImage(
           that.image,
           frameIndex * that.width,
           0,
           that.width,
           that.height,
           x ? x - that.width / 2 : 0,
           y ? y - that.height / 2 : 0,
           that.width,
           that.height);
    };   

    that.update = function () {

        tickCount += 1;

        if (tickCount > ticksPerFrame) {
            tickCount = 0;

            // If the current frame index is in range
            if (frameIndex < numberOfFrames - 1) {	
                // Go to the next frame
                frameIndex += 1;
            } else if (that.loop) {
                frameIndex = 0;
            }
        }
    };

    return that;
}
