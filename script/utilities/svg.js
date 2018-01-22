class Svg {
    static colorCode(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`
    }

    static animationTag(animationFrame) {
        const frameTime = 400
        const values = (animationFrame === 1) ? "inline;none" : "none;inline"
        const tag = `<animate attributeName="display" values="${values}" dur="${frameTime * 2}ms" repeatCount="indefinite" />`
        return tag
    }

    static rect(x, y, w, h, color, animationFrame) {
        const fill = color ? `fill="${this.colorCode(color)}"` : ''
        const openTag = `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${fill}>`
        const closeTag = `</rect>`
        const contents = animationFrame ? this.animationTag(animationFrame) : ''
        return (openTag + contents + closeTag)
    }

    static pixel(x, y, animationFrame) {
        return this.rect(x, y, 1, 1, null, animationFrame)
    }

    static element(width, height, content) {
        return `<svg width="100%" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${content}</svg>`
    }
}