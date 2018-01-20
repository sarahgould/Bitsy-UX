class Variable extends Entity {
    setup() {
        return {
            'VAR': value => { this.id = value }
        }
    }

    parseData(lines) {
        this.value = lines.length > 0 ? lines[0] : ''
    }
}