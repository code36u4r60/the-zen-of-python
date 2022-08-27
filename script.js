var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var rid = null;
var frames = 0;
var index = 0;
var fontSize = 40;

var lines = [];
var points = [];

var speed = 15;

var ctx = canvas.getContext("2d");
var btx = buffer.getContext("2d");

var bw = (buffer.width = fontSize);
var bh = (buffer.height = fontSize);
var cw = canvas.width;
var ch = canvas.height;
btx.fillStyle = ctx.fillStyle = "#fff";
btx.font = ctx.font = fontSize + "px Courier New";

var text = [
  "Beautiful is better than ugly.",
  "Explicit is better than implicit.",
  "Simple is better than complex.",
  "Complex is better than complicated.",
  "Flat is better than nested.",
  "Sparse is better than dense.",
  "Readability counts.",
  "Special cases aren't special enough to break the rules.",
  "Although practicality beats purity.",
  "Errors should never pass silently.",
  "Unless explicitly silenced.",
  "In the face of ambiguity, refuse the temptation to guess.",
  "There should be one-- and preferably only one --obvious way to do it.",
  "Although that way may not be obvious at first unless you're Dutch.",
  "Now is better than never.",
  "Although never is often better than *right* now.",
  "If the implementation is hard to explain, it's a bad idea.",
  "If the implementation is easy to explain, it may be a good idea.",
  "Namespaces are one honking great idea -- let's do more of those!",
];

text.map(function (t, i) {
  text[i] = t.toUpperCase();
});

var Line = (function () {
  function Line(text) {
    _classCallCheck(this, Line);

    this.text = text;
    this.width = ctx.measureText(this.text).width;
    this.startingPoint = -this.width / 2;
    this.letters = [];

    this.lettersRy();
  }

  _createClass(Line, [
    {
      key: "lettersRy",
      value: function lettersRy() {
        for (var i = 0; i < this.text.length; i++) {
          var letter = this.text[i];
          var _start =
            this.startingPoint +
            ctx.measureText(this.text.substring(0, i)).width;
          var pos = { x: _start, y: (ch - fontSize) / 2 };
          this.letters.push(new Letter(i, pos, letter));
        }
      },
    },
  ]);

  return Line;
})();

var Letter = (function () {
  function Letter(i, pos, letter) {
    _classCallCheck(this, Letter);

    this.index = index;
    this.letter = letter;
    this.pos = pos;
    this.points = [];
    this.addToPointsRy();
  }

  _createClass(Letter, [
    {
      key: "addToPointsRy",
      value: function addToPointsRy() {
        btx.clearRect(0, 0, bw, bh);
        btx.fillText(this.letter, 2, bh - 2);
        var imgData = btx.getImageData(0, 0, bw, bh);
        var pixels = imgData.data;

        for (var i = 0; i < pixels.length; i += 4) {
          if (pixels[i] == 255) {
            var x = (0.25 * i) % bw;
            var y = ~~((0.25 * i) / bw);
            this.points.push(new Particle(x + this.pos.x, y + this.pos.y));
          }
        }
      },
    },
  ]);

  return Letter;
})();

var Particle = (function () {
  function Particle(x, y) {
    _classCallCheck(this, Particle);

    this.x = x;
    this.y = y;
    this.pos = { x: x, y: y };
    this.pn = {
      // positive or negative
      x: Math.random() > 0.2 ? 1 : -1,
      y: Math.random() > 0.2 ? -1 : 1,
    };
    this.vel = {
      x: (this.pn.x * (this.pn.x + Math.random() * 10)) / 90,
      y: (this.pn.y * (this.pn.y + Math.random() * 10)) / 90,
      alp: (0.1 + Math.random()) / 60,
    };
    this.alp = 1;
  }

  _createClass(Particle, [
    {
      key: "draw",
      value: function draw() {
        ctx.fillStyle = "rgba(255, 255, 255" + this.alp + ")";
        ctx.beginPath();
        ctx.fillRect(this.pos.x, this.pos.y, 1, 1);
      },
    },
    {
      key: "update",
      value: function update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.alp -= this.vel.alp;
      },
    },
  ]);

  return Particle;
})();

for (var i = 0; i < text.length; i++) {
  lines.push(new Line(text[i]));
}

var numLine = 0;
var line = lines[numLine];

ctx.translate(cw / 2, 0);
function Frame() {
  rid = window.requestAnimationFrame(Frame);

  ctx.clearRect(-cw, -ch, 2 * cw, 2 * ch);
  points.map(function (p, i) {
    p.update();
    p.draw();
    if (p.alp <= 0) {
      points.splice(i, 1);
    }
  });

  if (frames % speed == 0) {
    line.letters[index].points.map(function (p) {
      p.pos = { x: p.x, y: p.y };
      p.alp = 1;
    });
    points = points.concat(line.letters[index].points);
    index++;
  }

  if (index == line.letters.length) {
    numLine++;
    line = lines[numLine % text.length];
    index = 0;
    frames = 0;
  }
  frames++;
}

function Init() {
  cw = canvas.width = window.innerWidth;
  ctx.translate(cw / 2, 0);
  if (rid) {
    window.cancelAnimationFrame(rid);
    rid = null;
  }
  Frame();
}

setTimeout(function () {
  Init();
  window.addEventListener("resize", Init, false);
}, 15);
