const TEST_ROOM = `a,a,a,c,a,c,a,a,a,a,c,a,c,a,a,a
a,a,a,b,a,b,a,a,a,a,b,a,b,a,a,a
a,a,o,j,o,j,o,o,o,o,j,o,j,o,a,a
a,a,0,0,0,0,0,0,0,12,10,1j,17,1a,a,a
a,a,0,0,1d,0,0,0,0,13,11,16,18,19,a,a
a,a,0,0,1f,0,12,10,15,0,0,0,0,0,a,a
a,a,0,0,1f,0,13,11,16,0,0,0,u,v,a,a
a,a,0,0,1g,0,0,0,0,0,1b,0,y,w,a,a
a,a,0,0,1i,0,0,0,0,0,1c,0,z,w,a,a
a,a,0,0,1h,0,0,15,17,1a,0,0,t,x,a,a
a,a,0,0,1f,0,0,16,18,19,0,0,0,0,a,a
a,a,0,0,1e,0,0,0,0,0,0,0,0,0,a,a
a,a,0,0,0,0,0,0,0,12,10,1k,17,1a,a,a
a,a,0,0,0,0,0,0,0,13,11,16,18,19,a,a
a,a,a,c,a,c,a,e,g,a,c,a,c,a,a,a
a,a,a,b,a,b,a,d,f,a,b,a,b,a,a,a`

const TEST_DRAWING = `00000000
11110000
00001000
11110100
00001100
00000100
00000100
00000100`

class Utility {
    static parsePosition(line) {
        const parts = line.split(',').map(part => parseInt(part))
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return
        return parts
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
        this.data = []
        this.isWall = false
    }

    static parse(lines) {
        const tile = new Tile()
        lines.forEach(line => {
            if (line.startsWith('TIL ')) {
                tile.id = line.replace('TIL ', '')
            }
            else if (line.startsWith('WAL ')) {
                tile.isWall = (line.replace('WAL ', '') === 'true')
            }
            else {
                tile.data.push(line.split(''))
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

// class Ending extends Dialog {
//     constructor() {
//         super()
//     }

//     static parse(lines) {
//         const dialog = new Dialog()
//         lines.forEach(line => {
//             if (line.startsWith('DLG ')) {
//                 dialog.id = line.replace('DLG ', '')
//             }
//             else {
//                 if (dialog.text) {
//                     dialog.text += '\n' + line
//                 } else {
//                     dialog.text = line
//                 }
//             }
//         })
//         return dialog
//     }
// }

// class Variable {
//     constructor() {
//         this.id = ''
//         this.text = ''
//     }

//     static parse(lines) {
//         const dialog = new Dialog()
//         lines.forEach(line => {
//             if (line.startsWith('DLG ')) {
//                 dialog.id = line.replace('DLG ', '')
//             }
//             else {
//                 if (dialog.text) {
//                     dialog.text += '\n' + line
//                 } else {
//                     dialog.text = line
//                 }
//             }
//         })
//         return dialog
//     }
// }

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
            const lines = chunk.split('\n')
            if (chunk.startsWith('PAL ')) {
                world.palettes.push(
                    Palette.parse(lines)
                )
            }
            else if (chunk.startsWith('ROOM ')) {
                world.rooms.push(
                    Room.parse(lines)
                )
            }
            else if (chunk.startsWith('TIL ')) {
                world.tiles.push(
                    Tile.parse(lines)
                )
            }
            else if (chunk.startsWith('SPR ')) {
                world.sprites.push(
                    Sprite.parse(lines)
                )
            }
            else if (chunk.startsWith('ITM ')) {
                world.items.push(
                    Item.parse(lines)
                )
            }
            // else if (chunk.startsWith('DLG ')) {
            //     world.dialogs.push(
            //         Dialog.parse(lines)
            //     )
            // }
            // else if (chunk.startsWith('END ')) {
            //     world.endings.push(
            //         Ending.parse(lines)
            //     )
            // }
            // else if (chunk.startsWith('VAR ')) {
            //     world.variables.push(
            //         Variable.parse(lines)
            //     )
            // }
        })
        return world
    }
}



const parseRoom = (roomData) => {
    const rows = roomData.split('\n')
    const grid = rows.map(row => row.split(','))
    return grid
}

const parseDrawing = (drawingData) => {
    const rows = drawingData.split('\n')
    const grid = rows.map(row => row.split(''))
    return grid
}

const svgRect = (x, y) => {
    return `<rect x=${x} y=${y} width="1" height="1" stroke="#000" stroke-width="0.01" />`
}

const drawingToSvg = (drawingGrid, x=0, y=0) => {
    let elements = ''
    drawingGrid.forEach((row, localY) => {
        row.forEach((cell, localX) => {
            if (cell === '1') elements += svgRect(x+localX, y+localY)
        })
    })
    const group = `<g>${elements}</g>`
    return group
}

const roomToSvg = (roomGrid, drawingGrid) => {
    let elements = ''
    roomGrid.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell !== '0') elements += drawingToSvg(drawingGrid, x*8, y*8) // svgRect(x, y)
        })
    })
    const group = `<g>${elements}</g>`
    return group
}

const room = document.getElementById('room-svg')
const drawingGrid = parseDrawing(TEST_DRAWING)
const roomGrid = parseRoom(TEST_ROOM)
room.innerHTML = roomToSvg(roomGrid, drawingGrid)