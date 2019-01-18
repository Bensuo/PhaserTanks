
var tickLength = 1000 / 1;

var previousTick = Date.now();

var numTicks = 0;

exports.run = function () {
    var now = Date.now();

    numTicks++;
    if (previousTick + tickLength <= now) {
        var delta = (now - previousTick) / 1000;
        previousTick = now;

        exports.update(delta);
        console.log('delta', delta, '(target: ' + tickLength +' ms)', 'node ticks', numTicks)
        numTicks = 0;
    }

    if(Date.now() - previousTick < tickLength - 16){
        setTimeout(exports.run);
    }
    else{
        setImmediate(exports.run);
    }
};

