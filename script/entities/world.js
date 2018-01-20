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