const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5

class Line180Stage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Line180Stage = new Line180Stage()
    }
}

class State {
    prevScale : number = 0
    scale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class Line180Node {
    prev : Line180Node
    next : Line180Node
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new Line180Node(this.i + 1)
            this.next.prev = this
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    draw(context : CanvasRenderingContext2D) {
        const index : number = this.i % 2
        const factor : number = 1 - 2 * index
        const gap : number = h / nodes
        context.save()
        context.translate(w / 2, h * (this.i + 1))
        context.rotate(Math.PI * this.state.scale * factor)
        context.fillStyle = '#FF5722'
        context.fillRect(-gap/5, -gap, 2 * gap / 5, gap)
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    getNext(dir : number, cb : Function) : Line180Node {
        var curr : Line180Node = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        if (cb) {
            cb()
        }
        return this
    }
}

class LinkedLine180 {
    curr : Line180Node = new Line180Node(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
