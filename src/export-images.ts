import EventEmitter from 'node:events'
import Path from 'node:path'
import { getDocument, OPS, type PDFDocumentProxy } from 'pdfjs-dist'
import sharp from 'sharp'

export interface Image {
  name: string
  kind: string
  width: number
  height: number
  channels: number
  bytes: number
  file: string
}

export interface ExportImagesEvent {
  done: Image[][]
  error: any
  load: any
  image: Image[]
}

export function exportImagesEvents (src: string, dst: string) {
  const ee = new EventEmitter<ExportImagesEvent>()
  getDocument(src).promise
    .then(doc => processDoc(doc, dst, ee))
    .catch(error => ee.emit('error', error))
  return ee
}

export async function exportImages (src: string, dst: string) {
  return new Promise((resolve, reject) => {
    exportImagesEvents (src, dst)
      .on('done', resolve)
      .on('error', reject)
  })
}

async function processDoc (doc: PDFDocumentProxy, dst: string, ee: EventEmitter<ExportImagesEvent>) {
  const pageCount = doc._pdfInfo.numPages
  ee.emit('load', { pageCount })
  const images = []
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p)
    // console.log('page:', page)
    const viewport = page.getViewport({ scale: 1 })
    
    const ops = await page.getOperatorList()
    // console.log('ops::', ops)

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
          const event: Image = { name, kind, width, height, channels, bytes, file }
          ee.emit('image', event)
          images.push(event)
        }
      } catch (error) {
        ee.emit('error', error)
      }
    }
  }
  ee.emit('done', images)
}
