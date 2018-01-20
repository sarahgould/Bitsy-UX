class Entity {
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

    parsePosition(line) {
        const parts = line.split(',').map(part => parseInt(part))
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return
        return parts
    }

    init(props) {
        return
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