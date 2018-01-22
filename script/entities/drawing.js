class Drawing extends Entity {
    parseData(lines) {
        const frameSeparator = lines.findIndex(line => line === '>')
        this.isAnimated = (frameSeparator >= 0)
        const frame1Lines = this.isAnimated ? lines.slice(0, frameSeparator) : lines
        const frame2Lines = this.isAnimated ? lines.slice(frameSeparator + 1) : []
        this.frame1 = frame1Lines.map(line => line.split(''))
        this.frame2 = frame2Lines.map(line => line.split(''))
    }

    draw(color) {
        const openTag = `<g fill="${Svg.colorCode(color)}">`
        const closeTag = '</g>'

        let contents = ''
        this.frame1.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (this.isAnimated && cell !== this.frame2[y][x]) {
                    if (cell === '1') contents += Svg.pixel(x, y, 1)
                    if (this.frame2[y][x] === '1') contents += Svg.pixel(x, y, 2)
                }
                else {
                    if (cell === '1') contents += Svg.pixel(x, y)
                }
            })
        })

        return (openTag + contents + closeTag)
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
        this.position = this.parsePosition(position[1])
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