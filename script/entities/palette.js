class Palette extends Entity {
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