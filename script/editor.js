window.onload = () => {
    const world = World.parse(TEST_GAME)
    console.log('>> world:', world)

    world.rooms.forEach(room => {
        const roomSvg = room.draw(world)

        const roomEl = document.createElement('div')
        roomEl.className = 'room'
        roomEl.innerHTML = Svg.element(ROOM_WIDTH * SQUARE_WIDTH, ROOM_HEIGHT * SQUARE_HEIGHT, roomSvg)

        const roomsList = document.getElementById('rooms')
        roomsList.appendChild(roomEl)
    })

    const items = document.getElementsByClassName('items')[0].children
    const targets = document.getElementsByClassName('targets')[0].children
    Draggable.setup(items, targets,
        (el, target, x, y, draggable) => {
            target.className += ' filled'
            target.style.background = el.style.background
            draggable.disable()
        }
    )
}