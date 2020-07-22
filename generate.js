const { createCanvas } = require('canvas')

const { get, pos, or } = require('./utils')

const mouths = require('./parts/mouths.json')
const noses = require('./parts/noses.json')
const eyes = require('./parts/eyes.json')
const eyebrows = require('./parts/eyebrows.json')
const glasses = require('./parts/glasses.json')

const pixelSize = 16

const width = 20 * pixelSize
const height = 20 * pixelSize
const halfWidth = Math.round(width / 2)
const halfHeight = Math.round(height / 2)

const center = pos(halfWidth, halfHeight)

const defaultOptions = {
    pixelSize,
    width,
    height,
    pos: center,
    color: '#000',
    background: '#fff'
}

class FaceGenerator {
    constructor(options = {}) {
        const opts = { ...defaultOptions, ...options }

        if (options.pixelSize) {
            if (!options.width) {
                opts.width = options.pixelSize * 20
            }

            if (!options.height) {
                opts.height = options.pixelSize * 20
            }
        }

        if (!options.pos) {
            opts.pos = pos(Math.round(opts.width / 2), Math.round(opts.height / 2))
        }

        Object.assign(this, opts)

        this.canvas = createCanvas(this.width, this.height)
        this.ctx = this.canvas.getContext('2d')
    }

    fill(background) {
        const { width, height, ctx } = this

        ctx.fillStyle = background
        ctx.fillRect(0, 0, width, height)
    }

    generate(customPos) {
        const { pos: facePos, background } = this

        if (background) {
            this.fill(background)
        }

        const baseOffset = this.getBaseOffset(customPos || facePos)

        const { item: mouth, type: mouthType } = get(mouths)
        const { item: nose, type: noseType } = get(noses)
        const { item: eye, type: eyeType } = get(eyes)
        const { item: glass, type: glassType } = get(glasses)
        const { item: eyebrow, type: eyebrowType } = get(eyebrows)

        const mouthOffset = this.getPartOffset(mouth, baseOffset.mouth)
        const noseOffset = this.getPartOffset(nose, baseOffset.nose)
        const leftEyeOffset = this.getPartOffset(eye, baseOffset.leftEye)
        const rightEyeOffset = this.getPartOffset(eye, baseOffset.rightEye)
        const glassesOffset = this.getPartOffset(glass, baseOffset.glasses)
        const leftEyebrowOffset = this.getPartOffset(eyebrow, baseOffset.leftEyebrow)
        const rightEyebrowOffset = this.getPartOffset(eyebrow, baseOffset.rightEyebrow)

        leftEyeOffset.y = rightEyeOffset.y
        leftEyebrowOffset.y = rightEyebrowOffset.y
        leftEyebrowOffset.x = leftEyeOffset.x
        rightEyebrowOffset.x = rightEyeOffset.x

        this.drawPart(mouth, mouthOffset)
        this.drawPart(nose, noseOffset)

        if (eyebrow) {
            this.drawPart(eyebrow, leftEyebrowOffset)
            this.drawPart(eyebrow, rightEyebrowOffset)
        }

        if (glass) {
            this.drawPart(glass, glassesOffset)
        } else {
            this.drawPart(eye, leftEyeOffset)
            this.drawPart(eye, rightEyeOffset)
        }

        return this.canvas
    }

    drawPart(figure, offset = pos(0, 0)) {
        const { color: pixelColor, pixelSize, ctx } = this

        for (const coord of figure.path) {
            const [x, y, color] = coord.split(":").map(n => n.trim())

            if (color) {
                  ctx.fillStyle = color
            } else {
                  ctx.fillStyle = pixelColor
            }

            const posX = offset.x + parseInt(x, 10) * pixelSize
            const posY = offset.y + parseInt(y, 10) * pixelSize

            ctx.fillRect(posX, posY, pixelSize, pixelSize)
        }
    }

    getBaseOffset(center) {
        const { pixelSize } = this
        const halfPixel = pixelSize / 2

        return {
            mouth: pos(center.x, center.y + pixelSize * 4),
            nose: pos(center.x - halfPixel, center.y - pixelSize),
            leftEye: pos(center.x - pixelSize * 4, center.y - pixelSize * 5),
            rightEye: pos(center.x + pixelSize * 3, center.y - pixelSize * 5),
            leftEyebrow: pos(center.x - pixelSize * 3, center.y - pixelSize * 8),
            rightEyebrow: pos(center.x + pixelSize * 3, center.y - pixelSize * 8),
            glasses: pos(center.x, center.y - pixelSize * 6)
        }
    }

    getPartOffset(figure, baseOffset) {
        const { pixelSize } = this

        const offset = pos(baseOffset.x, baseOffset.y)

        if (!figure) {
          return offset
        }

        if (figure.offset) {
          offset.x = baseOffset.x + figure.offset[0] * pixelSize
          offset.y = baseOffset.y + figure.offset[1] * pixelSize
        }

        if (figure.random) {
          offset.x += Math.round(
            or(figure.random.x[0], figure.random.x[1]) * pixelSize
          )
          offset.y += Math.round(
            or(figure.random.y[0], figure.random.y[1]) * pixelSize
          )
        }

        return offset
    }
}

module.exports = FaceGenerator
