class Dialog extends Entity {
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