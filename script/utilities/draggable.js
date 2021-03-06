class Draggable {
    constructor(el, targets, onDrop) {
        this.el = el
        this.targets = targets.length ? Array.prototype.slice.call(targets) : [targets]
        this.onDrop = onDrop

        this.mousedown = this.mousedown.bind(this)
        this.mousemove = this.mousemove.bind(this)
        this.mouseup = this.mouseup.bind(this)

        this.touchstart = this.touchstart.bind(this)
        this.touchmove = this.touchmove.bind(this)
        this.touchstop = this.touchstop.bind(this)

        this.el.className += ' draggable'
        this.el.addEventListener('mousedown', this.mousedown)
        this.el.addEventListener('touchstart', this.touchstart)
    }

    static setup(el, targets, onDrop) {
        if (el.length) {
            const els = Array.prototype.slice.call(el)
            return els.map(el => new Draggable(el, targets, onDrop))
        }
        else {
            return (new Draggable(el, targets, onDrop))
        }
    }

    disable() {
        this.el.className = this.el.className.replace(' draggable', '')
        this.el.removeEventListener('mousedown', this.mousedown)
        this.el.removeEventListener('touchstart', this.touchstart)
    }

    // --------------
    // GENERIC EVENTS
    // --------------

    start(x, y) {
        this.addDup()

        this.el.style.opacity = 0.5

        this.xOffset = x - this.el.offsetLeft
        this.yOffset = y - this.el.offsetTop
    }

    move(x, y, event) {
        const adjustedX = x - this.xOffset
        const adjustedY = y - this.yOffset
        this.moveDup(adjustedX, adjustedY)
        event.preventDefault()
    }

    stop(x, y) {
        this.removeDup()

        this.el.style.opacity = 1

        const dropTarget = this.targets.find(target => {
            const targetX = target.offsetLeft
            const targetY = target.offsetTop
            const targetW = target.offsetWidth
            const targetH = target.offsetHeight
            return (
                x >= targetX &&
                x <= targetX + targetW &&
                y >= targetY &&
                y <= targetY + targetH
            )
        })

        if (dropTarget && this.onDrop) {
            this.onDrop(this.el, dropTarget, x, y, this)
        }
    }

    // ------------
    // MOUSE EVENTS
    // ------------

    mousedown(event) {
        this.start(event.clientX, event.clientY)

        document.addEventListener('mousemove', this.mousemove)
        document.addEventListener('mouseup', this.mouseup)
    }

    mousemove(event) {
        this.move(event.clientX, event.clientY, event)
    }

    mouseup(event) {
        this.stop(event.clientX, event.clientY)

        document.removeEventListener('mouseup', this.mouseup)
        document.removeEventListener('mousemove', this.mousemove)
    }

    // ------------
    // TOUCH EVENTS
    // ------------

    touchstart(event) {
        const touch = event.targetTouches[0]
        this.start(touch.clientX, touch.clientY)

        document.addEventListener('touchmove', this.touchmove)
        document.addEventListener('touchend', this.touchstop)
        document.addEventListener('touchcancel', this.touchstop)
    }

    touchmove(event) {
        const touch = event.changedTouches[0]
        this.move(touch.clientX, touch.clientY, event)
    }

    touchstop(event) {
        const touch = event.changedTouches[0]
        this.stop(touch.clientX, touch.clientY)

        document.removeEventListener('touchmove', this.touchmove)
        document.removeEventListener('touchend', this.touchstop)
        document.removeEventListener('touchcancel', this.touchstop)
    }

    // ------------------------------------------
    // DUPLICATE ELEMENT THAT GETS DRAGGED AROUND
    // ------------------------------------------

    addDup() {
        this.dup = this.el.cloneNode(true)
        this.dup.id = 'dragDropDup'
        this.dup.style.position = 'absolute'
        this.dup.style.left = this.el.offsetLeft + 'px'
        this.dup.style.top = this.el.offsetTop + 'px'
        this.el.parentElement.appendChild(this.dup)
    }

    moveDup(x, y) {
        window.requestAnimationFrame(() => {
            this.dup.style.left = x + 'px'
            this.dup.style.top = y + 'px'
        })
    }

    removeDup() {
        if (!this.dup || !this.dup.parentElement) return
        this.dup.parentElement.removeChild(this.dup)
    }
}