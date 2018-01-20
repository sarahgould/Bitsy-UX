class Svg {
    static rect(x, y, w, h, color) {
        const colorCode = `rgb(${color.r}, ${color.g}, ${color.b})`
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colorCode}" stroke="${colorCode}" stroke-width="0.01" />`
    }

    static pixel(x, y, color) {
        return this.rect(x, y, 1, 1, color)
    }

    static element(width, height, content) {
        return `<svg width="100%" viewBox="0 0 ${width} ${height}">${content}</svg>`
    }
}