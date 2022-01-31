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

export async function exportImages (src, dst, emit = () => {}) {
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
          ops.fnArray[i] === OPS.paintJpegXObject ||
          ops.fnArray[i] === OPS.paintImageXObject ||
          ops.fnArray[i] === OPS.paintInlineImageXObject) {
          const name = ops.argsArray[i][0]
          const img = await page.objs.get(name)
          const { width, height, kind } = img
          const bytes = img.data.length
          const channels = bytes / width / height
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
