const ROOM_WIDTH = 16
const ROOM_HEIGHT = 16
const SQUARE_WIDTH = 8
const SQUARE_HEIGHT = 8

class Room extends Entity {
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
            position: this.parsePosition(item[1])
        }))
    }

    setEndings(endings) {
        return endings.map(ending => ({
            endingId: ending[0],
            position: this.parsePosition(ending[1])
        }))
    }

    setExits(exits) {
        return exits.map(exit => ({
            position: this.parsePosition(exit[0]),
            roomId: exit[1],
            enterPosition: this.parsePosition(exit[2])
        }))
    }

    parseData(lines) {
        this.data = lines.map(line => line.split(','))
    }

    draw(world) {
        const palette = world.palettes.find(p => p.id === this.paletteId)

        let contents = ''
        this.data.forEach((row, y) => {
            row.forEach((cell, x) => {
                contents += this.drawSquare(x, y, palette, world)
            })
        })
        return contents
    }

    drawSquare(x, y, palette, world) {
        const { tile, sprite, item } = this.getTile(x, y, world)
        const thingToDraw = sprite || item || tile

        const backgroundColor = palette.colors[0]
        const foregroundColor = sprite || item ? palette.colors[2] : palette.colors[1]

        let contents = ''

        const background = Svg.rect(0, 0, SQUARE_WIDTH, SQUARE_HEIGHT, backgroundColor)
        contents += background

        if (thingToDraw) contents += thingToDraw.draw(foregroundColor)

        const group = `<g transform="translate(${x * SQUARE_WIDTH}, ${y * SQUARE_HEIGHT})">${contents}</g>`
        return group
    }

    getTile(x, y, world) {
        const tileId = this.data[y][x]
        const tile = world.tiles.find(tile => tile.id === tileId)

        const sprite = world.sprites.find(sprite => sprite.roomId === this.id && sprite.position[0] === x && sprite.position[1] === y)

        const itemId = this.items.find(item => item.position[0] === x && item.position[1] === y)
        const item = itemId ? world.items.find(item => item.id === itemId) : null

        return {
            tile,
            sprite,
            item
        }
    }
}