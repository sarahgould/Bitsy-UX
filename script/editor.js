class Utility {
    static parsePosition(line) {
        const parts = line.split(',').map(part => parseInt(part))
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return
        return parts
    }

    static svgRect(x, y) {
        return `<rect x=${x} y=${y} width="1" height="1" stroke="#000" stroke-width="0.01" />`
    }

    static drawingToSvg(drawing, x = 0, y = 0) {
        let elements = ''
        const data = drawing.frame1 || drawing.data
        data.forEach((row, localY) => {
            row.forEach((cell, localX) => {
                if (cell === '1') elements += Utility.svgRect(x + localX, y + localY)
            })
        })
        const group = `<g>${elements}</g>`
        return group
    }

    static roomToSvg(room, tiles) {
        let elements = ''
        const tileCache = {}
        room.data.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === '0') return
                if (!tileCache[cell]) {
                    const tile = tiles.find(t => t.id === cell)
                    if (!tile) return
                    tileCache[tile.id] = tile
                }
                elements += Utility.drawingToSvg(tileCache[cell], x * 8, y * 8)
            })
        })
        const group = `<g>${elements}</g>`
        return group
    }

    static setSvg(id, content) {
        const svgEl = document.getElementById(id)
        if (!svgEl) return
        svgEl.innerHTML = content
    }

    static createSvg(parentId, id, className, width, height, content) {
        const parentEl = document.getElementById(parentId)
        if (!parentEl) return
        const container = document.createElement('div')
        container.id = id
        container.className = className
        if (content) container.innerHTML = `<svg width="100%" viewBox="0 0 ${width} ${height}">${content}</svg>`
        parentEl.appendChild(container)
    }

    static createSvgRooms(parentId, rooms, tiles) {
        rooms.forEach(room => {
            const content = Utility.roomToSvg(room, tiles)
            Utility.createSvg(parentId, `room-${room.id}`, 'room', 128, 128, content)
        })
    }

    static createSvgTiles(parentId, tiles) {
        tiles.forEach(tile => {
            const content = Utility.drawingToSvg(tile)
            Utility.createSvg(parentId, `tile-${tile.id}`, 'tile', 8, 8, content)
        })
    }

    static createSvgSprites(parentId, sprites) {
        sprites.forEach(sprite => {
            const content = Utility.drawingToSvg(sprite)
            Utility.createSvg(parentId, `sprite-${sprite.id}`, 'sprite', 8, 8, content)
        })
    }

    static createSvgItems(parentId, items) {
        items.forEach(item => {
            const content = Utility.drawingToSvg(item)
            Utility.createSvg(parentId, `item-${item.id}`, 'item', 8, 8, content)
        })
    }
}

class Properties {
    constructor() {
        this.properties = {}
    }

    set(key, value) {
        if (!this.properties[key]) this.properties[key] = []
        this.properties[key].push(value)
    }

    getFirst(key) {
        if (!this.properties[key] || !this.properties[key][0]) return null
        return this.properties[key][0]
    }

    getAll(key) {
        return this.properties[key] || []
    }

    doesExist(key) {
        return (this.properties[key] != null)
    }
}

class GameEntity {
    constructor(lines) {
        if (lines) this.parse(lines)
    }

    parse(lines) {
        const props = new Properties()
        const setupFunctions = this.setup()
        const keys = Object.getOwnPropertyNames(setupFunctions)

        lines.forEach((line, i) => {
            const { header, value } = this.parseLine(line)
            if (keys.includes(header)) {
                props.set(header, value)
            } else {
                props.set('_DATA', line)
            }
        })

        keys.forEach(key => {
            setupFunctions[key](props.getFirst(key), props.getAll(key))
        })

        this.parseData(props.getAll('_DATA'))
    }

    parseLine(line) {
        let header, value, values
        const lineParts = line.split(' ')
        if (lineParts.length > 1) {
            header = lineParts[0]
            values = lineParts.slice(1)
        }
        else {
            header = '_DATA'
            values = lineParts
        }
        value = values.length > 1 ? values : values[0]
        return { header, value }
    }

    parseData(lines) {
        return
    }

    init(props) {
        return
    }
}

class Palette extends GameEntity {
    setup() {
        return {
            'PAL': value => { this.id = value },
            'NAME': value => { this.name = value }
        }
    }

    parseData(lines) {
        this.colors = []
        lines.forEach(line => {
            const colorParts = line.split(',')
            if (colorParts.length === 3) {
                const r = colorParts[0]
                const g = colorParts[1]
                const b = colorParts[2]
                this.colors.push({ r, g, b })
            }
        })
    }
}

class Room extends GameEntity {
    setup() {
        return {
            'ROOM': value => { this.id = value },
            'NAME': value => { this.name = value },
            'PAL': value => { this.paletteId = value },
            'ITM': (_, values) => { this.items = this.setItems(values) },
            'END': (_, values) => { this.endings = this.setEndings(values) },
            'EXT': (_, values) => { this.exits = this.setExits(values) }
        }
    }

    setItems(items) {
        return items.map(item => ({
            id: item[0],
            position: Utility.parsePosition(item[1])
        }))
    }

    setEndings(endings) {
        return endings.map(ending => ({
            endingId: ending[0],
            position: Utility.parsePosition(ending[1])
        }))
    }

    setExits(exits) {
        return exits.map(exit => ({
            position: Utility.parsePosition(exit[0]),
            roomId: exit[1],
            enterPosition: Utility.parsePosition(exit[2])
        }))
    }

    parseData(lines) {
        this.data = lines.map(line => line.split(','))
    }
}

class Drawing extends GameEntity {
    parseData(lines) {
        const frameSeparator = lines.findIndex(line => line === '>')
        this.isAnimated = (frameSeparator >= 0)
        const frame1Lines = this.isAnimated ? lines.slice(0, frameSeparator) : lines
        const frame2Lines = this.isAnimated ? lines.slice(frameSeparator + 1) : []
        this.frame1 = frame1Lines.map(line => line.split(''))
        this.frame2 = frame2Lines.map(line => line.split(''))
    }
}

class Tile extends Drawing {
    setup() {
        return {
            'TIL': value => { this.id = value },
            'WAL': value => { this.isWall = (value === 'true') }
        }
    }
}

class Sprite extends Drawing {
    setup() {
        return {
            'SPR': value => { this.id = value },
            'DLG': value => { this.dialogId = value },
            'POS': value => { if (value) this.setPosition(value) }
        }
    }

    setPosition(position) {
        this.roomId = position[0]
        this.position = Utility.parsePosition(position[1])
    }
}

class Item extends Drawing {
    setup() {
        return {
            'ITM': value => { this.id = value },
            'DLG': value => { this.dialogId = value },
            'NAME': value => { this.name = value }
        }
    }
}

class Dialog extends GameEntity {
    setup() {
        return {
            'DLG': value => { this.id = value }
        }
    }

    parseData(lines) {
        if (lines.length === 0) this.text = ''
        if (lines.length === 1) this.text = lines[0]
        if (lines.length > 1) this.text = lines
    }
}

class Ending extends GameEntity {
    setup() {
        return {
            'END': value => { this.id = value }
        }
    }

    parseData(lines) {
        if (lines.length === 0) this.text = ''
        if (lines.length === 1) this.text = lines[0]
        if (lines.length > 1) this.text = lines
    }
}

class Variable extends GameEntity {
    setup() {
        return {
            'VAR': value => { this.id = value }
        }
    }

    parseData(lines) {
        this.value = lines.length > 0 ? lines[0] : ''
    }
}

class World {
    constructor() {
        this.palettes = []
        this.rooms = []
        this.tiles = []
        this.sprites = []
        this.items = []
        this.dialogs = []
        this.endings = []
        this.variables = []
    }

    static parse(data) {
        const world = new World()
        const chunks = data.split('\n\n')
        chunks.forEach(chunk => {
            const lines = chunk
                .split('\n')
                .map(line => line.trim())
                .filter(line => !!line)
            const header = lines[0]

            if (header.startsWith('PAL ')) {
                world.palettes.push(
                    new Palette(lines)
                )
            }
            else if (header.startsWith('ROOM ')) {
                world.rooms.push(
                    new Room(lines)
                )
            }
            else if (header.startsWith('TIL ')) {
                world.tiles.push(
                    new Tile(lines)
                )
            }
            else if (header.startsWith('SPR ')) {
                world.sprites.push(
                    new Sprite(lines)
                )
            }
            else if (header.startsWith('ITM ')) {
                world.items.push(
                    new Item(lines)
                )
            }
            else if (header.startsWith('DLG ')) {
                world.dialogs.push(
                    new Dialog(lines)
                )
            }
            else if (header.startsWith('END ')) {
                world.endings.push(
                    new Ending(lines)
                )
            }
            else if (header.startsWith('VAR ')) {
                world.variables.push(
                    new Variable(lines)
                )
            }
        })
        return world
    }
}

window.onload = () => {
    const world = World.parse(TEST_GAME)
    console.log('>> world:', world)
    Utility.createSvgRooms('rooms', world.rooms, world.tiles)
    Utility.createSvgTiles('tiles', world.tiles)
    Utility.createSvgSprites('sprites', world.sprites)
    Utility.createSvgItems('items', world.items)

    const items = document.getElementsByClassName('items')[0].children
    const targets = document.getElementsByClassName('targets')[0].children
    Draggable.setup(items, targets,
        (el, target, draggable) => {
            target.className += ' filled'
            target.style.background = el.style.background
            draggable.disable()
        }
    )
}