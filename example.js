const { createWriteStream } = require('fs')
const { join } = require('path')

const FaceGenerator = require('./generate')

const face = new FaceGenerator({
    pixelSize: 10
})

const canvas = face.generate()

const out = createWriteStream(join(__dirname, 'face.png'))
canvas.createPNGStream().pipe(out)
