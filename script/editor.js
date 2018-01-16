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

class Palette {
    constructor() {
        this.id = ''
        this.name = ''
        this.colors = []
    }

    static parse(lines) {
        const palette = new Palette()
        lines.forEach(line => {
            if (line.startsWith('PAL ')) {
                palette.id = line.replace('PAL ', '')
            }
            else if (line.startsWith('NAME ')) {
                palette.name = line.replace('NAME ', '')
            }
            else {
                const colorParts = line.split(',')
                if (colorParts.length === 3) {
                    const r = colorParts[0]
                    const g = colorParts[1]
                    const b = colorParts[2]
                    palette.colors.push({ r, g, b })
                }
            }
        })
        return palette
    }
}

class Room {
    constructor() {
        this.id = ''
        this.name = ''
        this.paletteId = 0
        this.data = []
        this.items = []
        this.endings = []
        this.exits = []
    }

    static parse(lines) {
        const room = new Room()
        lines.forEach(line => {
            if (line.startsWith('ROOM ')) {
                room.id = line.replace('ROOM ', '')
            }
            else if (line.startsWith('NAME ')) {
                room.name = line.replace('NAME ', '')
            }
            else if (line.startsWith('PAL ')) {
                room.paletteId = line.replace('PAL ', '')
            }
            else if (line.startsWith('ITM ')) {
                const itemParts = line.replace('ITM ', '').split(' ')
                if (itemParts.length < 2) return
                const id = itemParts[0]
                const position = Utility.parsePosition(itemParts[1])
                room.items.push({ id, position })
            }
            else if (line.startsWith('END ')) {
                const endingParts = line.replace('END ', '').split(' ')
                if (endingParts.length < 2) return
                const endingId = endingParts[0]
                const position = Utility.parsePosition(endingParts[1])
                room.endings.push({ endingId, position })
            }
            else if (line.startsWith('EXT ')) {
                const exitParts = line.replace('EXT ', '').split(' ')
                if (exitParts.length < 3) return
                const position = Utility.parsePosition(exitParts[0])
                const roomId = exitParts[1]
                const enterPosition = Utility.parsePosition(exitParts[2])
                room.exits.push({ roomId, position, enterPosition })
            }
            else {
                room.data.push(line.split(','))
            }
        })
        return room
    }
}

class Tile {
    constructor() {
        this.id = ''
        this.frame1 = []
        this.frame2 = []
        this.isAnimated = false
        this.isWall = false
    }

    static parse(lines) {
        const tile = new Tile()
        let onFirstFrame = true
        lines.forEach(line => {
            if (line.startsWith('TIL ')) {
                tile.id = line.replace('TIL ', '')
            }
            else if (line.startsWith('WAL ')) {
                tile.isWall = (line.replace('WAL ', '') === 'true')
            }
            else if (line.startsWith('>')) {
                onFirstFrame = false
                tile.isAnimated = true
            }
            else {
                if (onFirstFrame) {
                    tile.frame1.push(line.split(''))
                } else {
                    tile.frame2.push(line.split(''))
                }
            }
        })
        return tile
    }
}

class Sprite {
    constructor() {
        this.id = ''
        this.frame1 = []
        this.frame2 = []
        this.isAnimated = false
        this.roomId = ''
        this.position = []
        this.dialogId = ''
    }

    static parse(lines) {
        const sprite = new Sprite()
        let onFirstFrame = true
        lines.forEach(line => {
            if (line.startsWith('SPR ')) {
                sprite.id = line.replace('SPR ', '')
            }
            else if (line.startsWith('POS ')) {
                const lineParts = line.replace('POS ', '').split(' ')
                if (lineParts.length < 2) return
                sprite.roomId = lineParts[0]
                sprite.position = Utility.parsePosition(lineParts[1])
            }
            else if (line.startsWith('DLG ')) {
                sprite.dialogId = line.replace('DLG ', '')
            }
            else if (line.startsWith('>')) {
                onFirstFrame = false
                sprite.isAnimated = true
            }
            else {
                if (onFirstFrame) {
                    sprite.frame1.push(line.split(''))
                } else {
                    sprite.frame2.push(line.split(''))
                }
            }
        })
        return sprite
    }
}

class Item {
    constructor() {
        this.id = ''
        this.name = ''
        this.data = []
        this.dialogId = ''
    }

    static parse(lines) {
        const item = new Item()
        lines.forEach(line => {
            if (line.startsWith('ITM ')) {
                item.id = line.replace('ITM ', '')
            }
            else if (line.startsWith('NAME ')) {
                item.name = line.replace('NAME ', '')
            }
            else if (line.startsWith('DLG ')) {
                item.dialogId = line.replace('DLG ', '')
            }
            else {
                item.data.push(line.split(''))
            }
        })
        return item
    }
}

class Dialog {
    constructor() {
        this.id = ''
        this.text = ''
    }

    static parse(lines) {
        const dialog = new Dialog()
        lines.forEach(line => {
            if (line.startsWith('DLG ')) {
                dialog.id = line.replace('DLG ', '')
            }
            else {
                if (dialog.text) {
                    dialog.text += '\n' + line
                } else {
                    dialog.text = line
                }
            }
        })
        return dialog
    }
}

class Ending {
    constructor() {
        this.id = ''
        this.text = ''
    }

    static parse(lines) {
        const ending = new Ending()
        lines.forEach(line => {
            if (line.startsWith('END ')) {
                ending.id = line.replace('END ', '')
            }
            else {
                if (ending.text) {
                    ending.text += '\n' + line
                } else {
                    ending.text = line
                }
            }
        })
        return ending
    }
}

class Variable {
    constructor() {
        this.id = ''
        this.value = ''
    }

    static parse(lines) {
        const variable = new Variable()
        lines.forEach(line => {
            if (line.startsWith('VAR ')) {
                variable.id = line.replace('VAR ', '')
            }
            else {
                variable.value = line
            }
        })
        return variable
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
                    Palette.parse(lines)
                )
            }
            else if (header.startsWith('ROOM ')) {
                world.rooms.push(
                    Room.parse(lines)
                )
            }
            else if (header.startsWith('TIL ')) {
                world.tiles.push(
                    Tile.parse(lines)
                )
            }
            else if (header.startsWith('SPR ')) {
                world.sprites.push(
                    Sprite.parse(lines)
                )
            }
            else if (header.startsWith('ITM ')) {
                world.items.push(
                    Item.parse(lines)
                )
            }
            else if (header.startsWith('DLG ')) {
                world.dialogs.push(
                    Dialog.parse(lines)
                )
            }
            else if (header.startsWith('END ')) {
                world.endings.push(
                    Ending.parse(lines)
                )
            }
            else if (header.startsWith('VAR ')) {
                world.variables.push(
                    Variable.parse(lines)
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
}