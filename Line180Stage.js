var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var Line180Stage = (function () {
    function Line180Stage() {
        this.canvas = document.createElement('canvas');
        this.ll180 = new LinkedLine180();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    Line180Stage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    Line180Stage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.ll180.draw(this.context);
    };
    Line180Stage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.ll180.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.ll180.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    Line180Stage.init = function () {
        var stage = new Line180Stage();
    };
    return Line180Stage;
})();
var State = (function () {
    function State() {
        this.prevScale = 0;
        this.scale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += this.dir * 0.1;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var Line180Node = (function () {
    function Line180Node(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    Line180Node.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new Line180Node(this.i + 1);
            this.next.prev = this;
        }
    };
    Line180Node.prototype.update = function (cb) {
        this.state.update(cb);
    };
    Line180Node.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    Line180Node.prototype.draw = function (context) {
        var index = this.i % 2;
        var factor = 1 - 2 * index;
        var gap = h / nodes;
        context.save();
        context.translate(w / 2, gap * (this.i + 1));
        context.rotate(Math.PI * this.state.scale * factor);
        context.fillStyle = '#FF5722';
        context.fillRect(-gap / 5, -gap, 2 * gap / 5, gap);
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    Line180Node.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        if (cb) {
            cb();
        }
        return this;
    };
    return Line180Node;
})();
var LinkedLine180 = (function () {
    function LinkedLine180() {
        this.curr = new Line180Node(0);
        this.dir = 1;
    }
    LinkedLine180.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedLine180.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedLine180.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedLine180;
})();
