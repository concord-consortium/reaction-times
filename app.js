(function() {
  window.App = machina.Fsm.extend({
    _timeout: null,
    _startTime: 0,
    _clickTime: 0,
    _audioCtx: null,
    mode: 'light',
    initialize: function() {
      var contextClass = (window.AudioContext || window.webkitAudioContext);
      if (contextClass) {
        this._audioCtx = new contextClass();
      }
    },
    initialState: 'start',
    states: {
      start: {
        _onEnter: function() {
          $('.results-text').hide();
          $('.content').css({backgroundColor: 'grey'});
          $('.instructions-text').text('Click to start');
        },
        click: function() {
          this.transition('wait');
        }
      },
      wait: {
        _onEnter: function() {
          $('.results-text').hide();
          if (this.mode === 'light') {
            $('.content').css({backgroundColor: 'red'});
            $('.instructions-text').text('Wait for green...');
          } else {
            $('.instructions-text').text('Click when you hear the sound...');
          }
          this._timeout = setTimeout(function() {
            this.transition('waitReady');
          }.bind(this), Math.random() * 6000 + 1000);
        },
        click: function() {
          clearTimeout(this._timeout);
          this.transition('tooSoon');
        }
      },
      waitReady: {
        _onEnter: function() {
          if (this.mode === 'light') {
            $('.content').css({backgroundColor: 'green'});
            $('.instructions-text').text('Click here...');
          } else {
            this._playSound();
          }
          this._startTime = Date.now();
        },
        audioNotSupported: function() {
          alert("Your browser doesn't support HTML5 audio. You won't be able to use this interactive.");
        },
        click: function() {
          this._clickTime = Date.now();
          this.transition('results');
        }
      },
      tooSoon: {
        _onEnter: function() {
          $('.content').css({backgroundColor: 'grey'});
          if (this.mode === 'light') {
            $('.instructions-text').text('Please wait for the green before clicking');
          } else {
            $('.instructions-text').text('Please wait for the sound before clicking');
          }
          setTimeout(function() {
            this.transition('wait');
          }.bind(this), 3000);
        },
        click: function() {}
      },
      results: {
        _onEnter: function() {
          $('.content').css({backgroundColor: 'grey'});
          $('.instructions-text').text('Click to try again');
          $('.reaction-time').text((this._clickTime - this._startTime) + ' ms');
          $('.results-text').show();
        },
        click: function() {
            this.transition('wait');
        }
      },
    },

    _playSound: function() {
      if (this._audioCtx === null) {
        this.handle('audioNotSupported');
        return;
      }

      var oscillator = this._audioCtx.createOscillator();
      oscillator.frequency.value = 330;
      oscillator.connect(this._audioCtx.destination);

      oscillator.start();
      setTimeout(function() {
        oscillator.stop();
      }.bind(this), 1000);
    },

    click: function() {
      this.handle('click');
    }
  });

})();