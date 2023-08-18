import EventEmitter from 'events'
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
import sharp from 'sharp'
import Path from 'path'

const { getDocument, OPS } = pdfjs

export function exportImagesEvents (src, dst) {
  const ee = new EventEmitter()
  const promise = exportImages(src, dst, (name, event) => ee.emit(name, event))
  // The promise consumer can register event hanlders to
  // observe the promise progression details
  promise.on = (name, handler) => {
    ee.on(name, handler)
    return promise
  }
  return promise
}

export async function exportImages (src, dst, emit = (name, data) => {}) {
  const doc = await getDocument(src).promise
  const pageCount = doc._pdfInfo.numPages
  emit('load', { pageCount })
  const images = []
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p)
    const ops = await page.getOperatorList()

    for (let i = 0; i < ops.fnArray.length; i++) {
      try {
        if (
          ops.fnArray[i] === OPS.paintImageXObject ||
          ops.fnArray[i] === OPS.paintInlineImageXObject
        ) {
          const name = ops.argsArray[i][0]
          const common = await page.commonObjs.has(name)
          const img = await (common
            ? page.commonObjs.get(name)
            : page.objs.get(name)
          )
          const { width, height, kind } = img
          const bytes = img.data.length
          const channels = bytes / width / height
          if (!(channels === 1 || channels === 2 || channels === 3 || channels === 4)) {
            throw new Error(`Invalid image channel: ${channels} for image ${name} on page ${page}`)
          }
          const file = Path.join(dst, `${name}.png`)
          await sharp(img.data, {
            raw: { width, height, channels }
          }).toFile(file)
          const event = { name, kind, width, height, channels, bytes, file }
          emit('image', event)
          images.push(event)
        }
      } catch (error) {
        emit('error', error)
      }
    }
  }
  emit('done', images)
  return images
}
