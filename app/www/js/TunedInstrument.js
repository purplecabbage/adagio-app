

(function(exports){

    var NumNotes = 128; // 128 midi notes from 0-127
    var notes;

    var AudioCtx = null;


    try {

      AudioCtx =  'webkitAudioContext' in window ? webkitAudioContext :
                  ( 'AudioContext' in window ? AudioContext : null );

      var audioContext = new AudioCtx();
      audioContext = null;
    }
    catch(e) {
      alert('Web Audio API is not supported in this browser ' + e.message);
    }


// Initialize note pitches using equal temperament (12-TET)
    notes = [];
    for (var i = 0; i < NumNotes; i++)
    {
        notes[i] = {
            pitch:440 * Math.pow(2, (i - 69)/12.0), // A4 = MIDI key 69
        };
        //console.log(i + ":" + notes[i].pitch);
    }



// define exportable interface

    var TunedInstrument = function(){
        this.audioContext = new AudioCtx();
    };

    TunedInstrument.prototype = {
        voiceBuffer:null,
        audioContext:null,
        polyphony:1,
        bufferSources:[],
        loadVoice:function(path,noteNum) {

            var request = new XMLHttpRequest();

            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            var self = this;

            // Decode asynchronously
            request.onload = function() {
                self.audioContext.decodeAudioData(request.response,
                    function(buffer) {
                      console.log("Buffer ready for :: " + noteNum);
                      self.voiceBuffer = buffer;
                    },function(err){
                        console.log("Error :: " + err);
                    });
            };
            request.send();
        },
        noteOn:function(noteNum){
            var source = this.audioContext.createBufferSource(); // creates a sound source
            source.buffer = this.voiceBuffer;  // todo: multiple buffers for pitch ranges
            source.playbackRate.value = notes[noteNum].pitch / notes[48].pitch;
            source.connect(this.audioContext.destination);
            this.bufferSources.push(source);
            if(this.bufferSources.length > this.polyphony) {
                var src = this.bufferSources.shift();
                //console.log("stopping src " + src);
                if(src) {
                    src.stop();
                }
            }
            var self = this;
            source.onended = function() {
                var index = self.bufferSources.indexOf(source);
                //console.log("onended " + index)
                if(index > -1) {
                    self.bufferSources.splice(index,1);
                }
            };
            source.start();
        },
        noteOff:function(noteNum){

        }

    };

    exports.TunedInstrument = TunedInstrument;


})(window);