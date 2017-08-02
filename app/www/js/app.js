

var speakerOnPath = "M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z M18.806,11.219c-0.393-0.389-1.024-0.389-1.415,0.002c-0.39,0.391-0.39,1.024,0.002,1.416v-0.002c0.863,0.864,1.395,2.049,1.395,3.366c0,1.316-0.531,2.497-1.393,3.361c-0.394,0.389-0.394,1.022-0.002,1.415c0.195,0.195,0.451,0.293,0.707,0.293c0.257,0,0.513-0.098,0.708-0.293c1.222-1.22,1.98-2.915,1.979-4.776C20.788,14.136,20.027,12.439,18.806,11.219z M21.101,8.925c-0.393-0.391-1.024-0.391-1.413,0c-0.392,0.391-0.392,1.025,0,1.414c1.45,1.451,2.344,3.447,2.344,5.661c0,2.212-0.894,4.207-2.342,5.659c-0.392,0.39-0.392,1.023,0,1.414c0.195,0.195,0.451,0.293,0.708,0.293c0.256,0,0.512-0.098,0.707-0.293c1.808-1.809,2.929-4.315,2.927-7.073C24.033,13.24,22.912,10.732,21.101,8.925z M23.28,6.746c-0.393-0.391-1.025-0.389-1.414,0.002c-0.391,0.389-0.391,1.023,0.002,1.413h-0.002c2.009,2.009,3.248,4.773,3.248,7.839c0,3.063-1.239,5.828-3.246,7.838c-0.391,0.39-0.391,1.023,0.002,1.415c0.194,0.194,0.45,0.291,0.706,0.291s0.513-0.098,0.708-0.293c2.363-2.366,3.831-5.643,3.829-9.251C27.115,12.389,25.647,9.111,23.28,6.746z";
var speakerOffPath = "M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z";
var playIconPath = "M6.684,25.682L24.316,15.5L6.684,5.318V25.682z";
var swapViewIconPath = "M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z";

var tempoDownArrowPath = "M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z";
var tempoUpArrowPath = "M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z";

var inputEvent = "click";
var tactBeginEvent = "touchstart";
var tactMoveEvent = "touchmove";
var tactEndEvent = "touchend";

var playBtn;

var animStage = 3;
// var tempoSlider; // dom elem

var MaxTempo = 220;
var MinTempo = 30;

var sndTic;
var sndToc;

document.addEventListener("touchmove", function(e){e.preventDefault();}, false);
window.addEventListener("resize", onResize.debounce(300));

function onResize() {
    //window.location.reload();
    console.log("resize :: " + window.innerHeight);

}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        init();
    }, 300);
});

var currentTempo = parseFloat(localStorage.lastTempo || 66); // Adagio!!
localStorage.lastTempo = currentTempo;

// bpm
var interval;

var soundsOn = localStorage.soundsOn == "true";
var isRunning = false;

var paperWidth = Math.min(window.innerWidth, 700);

var halfWidth = paperWidth / 2;
var paperMargin = 40;

var circRad = 16;
var circ2;
var newCirc;
var beatText;

var anim;

// transform:"r120 240 120",

var animPoints = [{ transform:"", cx: halfWidth, cy: paperWidth - paperMargin, callback: animateCirc },
                    { transform:"",cx: paperMargin , cy: halfWidth , callback: animateCirc },
                    // { transform:"t0,-120r90t0,120", cx: paperMargin, cy: halfWidth, easing: "linear", callback: animateCirc },
                    { transform:"", cx: paperWidth - paperMargin, cy: halfWidth,  callback: animateCirc},
                    { transform:"", cx: halfWidth, cy: paperMargin, callback: animateCirc }
                    ];
var ptColors = [ "#2EB7ED","#EAE851", "#228723", "#D21951" ];


var conductorView = true;

var pointsSet;

var lastTapTime;
var lastTapX;
var beatView,controlView;
var tempoText;

function makeViewButton(pp) {
    var lines = pp.set();

    lines.push(pp.path("M24 0L24 48").attr({
        fill: "#FFF",
        stroke: ptColors[3],
        "stroke-width":3
    }));

    lines.push(pp.path("M24 48L0 24").attr({
        fill: "#FFF",
        stroke: ptColors[0] ,
        "stroke-width":3
    }));
    lines.push(pp.path("M0 24L48 24").attr({
        fill: "#FFF",
        stroke:ptColors[1] ,
        "stroke-width":3
    }));
    lines.push(pp.path("M48 24L24 0").attr({
        fill: "#FFF",
        stroke: ptColors[2],
        "stroke-width":3
    }));

    return lines;
}


function onTempoSlider(e) {
    var x = e.offsetX;
    var sliderWidth = parseInt(tempoSlider.offsetWidth);

    currentTempo = MinTempo + Math.floor(x / sliderWidth * (MaxTempo-MinTempo));
    currentTempo = Math.min(MaxTempo, currentTempo);
    currentTempo = Math.max(MinTempo, currentTempo);
    //console.log("newTempo " + currentTempo);
    tempoText.attr("text", currentTempo + " bpm\n" + getTempoName(currentTempo));
    localStorage.lastTempo = currentTempo;
    updateTempoSliderThumb();
}

function updateTempoSliderThumb() {
    var sliderWidth = parseInt(tempoSlider.offsetWidth);
    thumbGrip.style.width = Math.floor( currentTempo / MaxTempo  * sliderWidth) + "px";
}


function init() {
    document.addEventListener("pause", onPause);

    tempoSlider.style.visibility = "visible";

    var isMobile = (navigator.userAgent.match(/iPad|iPhone/i) != null);
    if (!isMobile) {
        if (window.navigator.msPointerEnabled) {
            tactBeginEvent = "MSPointerDown";
            tactMoveEvent = "MSPointerMove";
            tactEndEvent = "MSPointerUp";
        }
        else {
            tactBeginEvent = "mousedown";
            tactMoveEvent = "mousemove";
            tactEndEvent = "mouseup";
        }
    }

    initView();

    initAudio();
    updateTempoSliderThumb();

}

var onSliderMoveEnd = function () {
    window.removeEventListener(tactMoveEvent, onTempoSlider);
    window.removeEventListener(tactEndEvent, onSliderMoveEnd);
};

var onSliderMoveStart = function () {
    window.addEventListener(tactMoveEvent, onTempoSlider);
    window.addEventListener(tactEndEvent, onSliderMoveEnd);
};

function initView() {


    tempoSlider.addEventListener(tactBeginEvent, onSliderMoveStart);


    var wrapDiv = $(".wrap");
    var wrapTop = Math.floor((window.innerHeight - paperWidth) / 3) + "px";
    wrapDiv.style.marginTop = "0px";//wrapTop;

    beatView = Raphael("canvasHolder", paperWidth, paperWidth);
    controlView = Raphael("controlDiv", paperWidth,120);

    //circ2 = beatView.circle(halfWidth, halfWidth, circRad).attr({ stroke: "#711A73", "stroke-width": 4 });
    newCirc = beatView.circle(halfWidth, halfWidth, circRad).attr({ stroke: "#711A73", "stroke-width": 4 });

    initPoints();

    interval = 60 / currentTempo * 1000;

    var speakerBtn = controlView.rect(8,8,48,48,8);
    speakerBtn.attr({
        fill: "#000",
        stroke: ptColors[0],
        "stroke-width":3
    });

    var speakerIcon = controlView.path(speakerOffPath);
    speakerIcon.attr({ fill: "#000",
                       stroke: ptColors[0],
                       "stroke-width":3
                    });
    speakerIcon.translate(circRad * 2 - 16, 16);
    speakerIcon.scale(1.5,1.5);

    var speakerClick = function() {

        speakerIcon.remove();
        soundsOn = !soundsOn;

        localStorage.soundsOn = soundsOn;

        if (soundsOn) {
            speakerIcon = controlView.path(speakerOnPath);
            speakerIcon.attr({
                fill: ptColors[0],
                stroke: "none",
                "stroke-width":3
            });
        }
        else {
            speakerIcon = controlView.path(speakerOffPath);
            speakerIcon.attr({
                fill: "#000",
                stroke: ptColors[0],
                "stroke-width":3
            });
        }
        speakerIcon.translate(circRad * 2 - 16, 16);
        speakerIcon.scale(1.5,1.5);
        speakerIcon.node.onclick = speakerClick;

    };

    // dumb logic to force the UI to update when we initialize, easier than fixing it. -jm
    if(soundsOn) {
        soundsOn = !soundsOn;
        speakerClick();
    }

    speakerBtn.node.onclick = speakerClick;
    speakerIcon.node.onclick = speakerClick;

    // Player button
    playBtn = controlView.rect(paperWidth - 58, 8,48,48,8);
    playBtn.attr( { fill: "#000",
                    stroke: ptColors[2],
                    "stroke-width":3 });

    var playIcon = controlView.path(playIconPath);
    playIcon.attr({
        fill: "#000",
        stroke: ptColors[2],"stroke-width":3
    });

    playIcon.translate(paperWidth - 48 ,16);
    playIcon.scale(1.5,1.5);

    var onPlayIcon = function() {
        playIcon.remove();
        isRunning = !isRunning;
        justStarted = true;
        playIcon = controlView.path(playIconPath);
        playIcon.translate(paperWidth - 48 ,16);
        playIcon.scale(1.5,1.5);
        if (isRunning) {
            playIcon.attr({ fill: ptColors[2], stroke: "none","stroke-width":3 });
            animateCirc();
            startLowLevelAnimation();
        }
        else {
            playIcon.attr({
                fill: "#000",
                stroke: ptColors[2],"stroke-width":3
            });
            animStage = 3;
        }
        playIcon.node.onclick = onPlayIcon;
    };

    playBtn.node.onclick = onPlayIcon;
    playIcon.node.onclick = onPlayIcon;

    beatText = beatView.text(halfWidth, halfWidth, "");
    beatText.attr({
        "font-size": 128,
        "fill": "#333",
        "fill-opacity": 0.5,
        "font-weight": "bold",
        "stroke": ptColors[0],
        "stroke-width": 4,
        "stroke-opacity": 0.2
    });

    tempoText = beatView.text(halfWidth, 80, currentTempo + " bpm\n" + getTempoName(currentTempo));
    tempoText.attr({
        "font-size":24,
        "fill":"#888",
        "font-weight": "bold"
    });

    var tapText = beatView.text(halfWidth,paperWidth - 90,"Tap Tempo");
    tapText.attr({
        "font-size": 32,
        "fill": "#888",
        "fill-opacity": 0.7,
        "font-weight": "bold"
    });

    var tapTempoBtn = beatView.rect(8,8,paperWidth-16, paperWidth-16, 8);
    tapTempoBtn.attr({"stroke":"#222",
                        "stroke-width": 2,
                        "fill":"#000",
                        "fill-opacity": 0});

    tapTempoBtn.node.addEventListener(tactBeginEvent, onTap.bind(this));

    var swapIcon = makeViewButton(controlView);
    swapIcon.translate(96, 8);
    swapIcon.scale(0.75, 0.75);

    var swapViewBtn = controlView.rect(96, 8, 48, 48, 8);

    swapViewBtn.attr({
        fill: "rgba(0,0,0,0.1)",
        stroke: "#711A73",
        "stroke-width": 3
    });

    var tempToggle = function() {
        conductorView = !conductorView;

        pointsSet[1].animate({cx:animPoints[2].cx, cy:animPoints[2].cy},1000,"bounce");
        pointsSet[2].animate({cx:animPoints[1].cx, cy:animPoints[1].cy},1000,"bounce");

        var temp = animPoints[1];
        animPoints[1] = animPoints[2];
        animPoints[2] = temp;

        if(conductorView) {
            swapIcon.attr({"stroke-opacity":1.0});
        }
        else {
            swapIcon.attr({ "stroke-opacity": 0.5 });
        }

    };

    swapViewBtn.node.onclick = tempToggle;
}

function initAudio() {

    sndClick = new TunedInstrument();
    sndClick.polyphony = 1;
    sndClick.loadVoice("sounds/click1.wav",48);

    sndClack = new TunedInstrument();
    sndClack.polyphony = 1;
    sndClack.loadVoice("sounds/click2.wav",48);

    try {

        //tick.msAudioCategory = "SoundEffects";
        //tock.msAudioCategory = "SoundEffects";
        //tick.volume = 0.9;

        //tock.volume = 0.5;
        //tick.src = "Sounds/METROMN1.wav";
        //tock.src = "Sounds/METROMN2.wav";
    }
    catch (ex) {
        alert("exceptional :: " + ex);
    }
}

// reset and stop ...
function onPause() {
    isRunning = true; // the onclick handler will toggle this for us
    playBtn.node.onclick();
}

function fade(id) {
    pointsSet[id].attr({ fill: "#000", r: 32 }).animate({ fill: "#000", r: 8 }, interval);
}



function onTap(e) {
    var now = new Date().getTime();
    lastTapX = e.pageX;
    if (lastTapTime != null) {
        var elapsed = now - lastTapTime;
        // 2 seconds to tap again ( min tempo is 30 )
        if (elapsed < 2000) {
            currentTempo = Math.round(10 * (currentTempo + 60000 / elapsed) / 2) / 10;
            currentTempo = Math.min(MaxTempo, currentTempo);
            currentTempo = Math.max(MinTempo, currentTempo);
            //console.log("newTempo " + currentTempo);
            tempoText.attr("text", currentTempo + " bpm\n" + getTempoName(currentTempo));

            localStorage.lastTempo = currentTempo;
            updateTempoSliderThumb();

        }
    }
    lastTapTime = now;
}

function initPoints() {
    pointsSet = beatView.set();
    for (var n = 0; n < animPoints.length; n++) {
        pointsSet.push(beatView.circle(animPoints[n].cx, animPoints[n].cy, circRad / 2).attr({
            stroke: ptColors[n],
            "stroke-width": 4
        }));
    }
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {

    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 30);
            };
})();

var lastPos =  { cx: halfWidth, cy: halfWidth },
    nextPos, lastTime;

var didTrigger = false;
var justStarted = false;


function startLowLevelAnimation(tElapsed) {

    tElapsed = tElapsed || 0;
    if (isRunning) {

        //console.log("tElapsed = " + tElapsed);
        if (lastTime == null) {
            lastTime = tElapsed;
            var index = (animStage + 4) % 4;

            if(nextPos != null) {
                lastPos = animPoints[(index + 3) % 4];
            }
            nextPos = animPoints[index];
        }

        var interval = 60 / currentTempo * 1000;    //  tempo could have changed

        var elapsed = tElapsed - lastTime;
        var dT = elapsed / interval;


        var newX = noEase(elapsed, lastPos.cx, nextPos.cx - lastPos.cx, interval);
        var newY = noEase(elapsed,lastPos.cy,nextPos.cy - lastPos.cy,interval);
        newCirc.attr({ cx: newX, cy: newY });
        requestAnimFrame(startLowLevelAnimation);


        if (elapsed > interval) {
            //console.log("elapsed > interval = " + dT);
            // advance to next beat
            fade(animStage);
            animStage++;
            animStage %= 4;
            lastTime = null;
            if (!didTrigger) {
                //console.log("timeout triggering manually");
                triggerSound((animStage == 0) ? 0 : 1,0); // still possible it was not triggered
            }
            didTrigger = false;

        }
        else if (!didTrigger) {

            var nextClick = Math.floor(interval - elapsed);
            //console.log("elapsed = " + elapsed + " interval = " + interval + " nextClick = " + nextClick);
            if (nextClick < 100) { // in the next 100 msec we will trigger now
                //console.log("triggering in " + nextClick);
                didTrigger = true;
                triggerSound((animStage == 0) ? 0 : 1, nextClick);
            }
        }
    }
    else {
        var centerPos = { cx: halfWidth, cy: halfWidth };
        lastPos = centerPos;
        nextPos = null;
        lastTime = null;
        newCirc.animate(centerPos, 1000, "elastic");
    }

    updateBeatText();
}

function updateBeatText() {

    if (isRunning) {

        var color = ptColors[(ptColors.length + animStage - 1) % 4];
        beatText.attr({
            "text": animStage == 0 ? 4: animStage,
            "stroke": color,
            "fill": color
        });
    }
    else {
        beatText.attr({"text": ""});
    }
}

function noEase(t,b,c,d) {
    return b + (c * t / d );
}

// t: current time, b: begInnIng value, c: change In value, d: duration
function easeInOutCubic(t, b, c, d) {
    if ((t/=d/2) < 1) {
        return c/2*t*t + b;
    }
    else {
        return c/2*((t-=2)*t*t + 2) + b;
    }

}
function easeInOutCirc(t, b, c, d) {
    if ((t/=d/2) < 1) {
        return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    }
    else {
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    }
}

function animateCirc() {
    updateBeatText();
}

function triggerSound(index,offset) {
    // todo: use offset
    if (soundsOn && !justStarted) {
        if(index > 0) {
            sndClack.noteOn(42,offset / 1000);
        }
        else {
            sndClick.noteOn(42,offset / 1000);
        }
    }
    justStarted = false;
}

