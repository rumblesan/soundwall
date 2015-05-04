
var Thicket = require('thicket');
var Synths = require('./synths');

var Audio = {};
var internal = {};

Audio.createContext = function (w) {
    var context;
    try {
        // Fix up for prefixing
        w.AudioContext = w.AudioContext||w.webkitAudioContext;
        context = new w.AudioContext();
    } catch(e) {
        throw Error.create("WebAudio API not available");
    }
    return context;
};

var config = {
    intensityDecr: 0.99,
    intensityIncr: 0.1,
    intensityIncrDiff: 0.4,
    dropVoices: 6,
    frequencies: [
        440, 493.883, 523.251, 587.330, 659.255, 698.456, 783.991, 880
    ]
};

internal.getNote = function () {
    var n = Math.floor(Math.random() * config.frequencies.length);
    return config.frequencies[n];
};

Audio.create = function (audioCtx) {

    var system = {};

    var thicket = Thicket.createSystem(audioCtx);


    var state = {
        intensity: 0,
        lastClickTime: 0,
        lastClickDiff: audioCtx.currentTime,
        x: 0,
        y: 0,
        synthVoices: [],
        voiceNumber: 0
    };

    var i;
    for (i = 0; i < config.dropVoices; i += 1) {
        state.synthVoices.push(thicket.Synth.create(Synths.drop));
    }

    system.click = function (xVal, yVal) {

        thicket.Synth.play(
            state.synthVoices[state.voiceNumber],
            1,
            ['freq', internal.getNote()]
        );
        state.voiceNumber += 1;
        if (state.voiceNumber >= config.dropVoices) {
            state.voiceNumber = 0;
        }

        state.x = xVal;
        state.y = yVal;

        state.lastClickDiff = audioCtx.currentTime - state.lastClickTime;
        if (state.lastClickDiff < config.intensityIncrDiff) {
            state.intensity += config.intensityIncr;
        }
        state.lastClickTime = audioCtx.currentTime;

        console.log(state);

    };

    system.delta = function () {
        state.intensity = state.intensity * config.intensityDecr;
    };

    return system;
};

module.exports = Audio;
