import pdfjs from 'pdfjs-dist/legacy/build/pdf.js'
import sharp from 'sharp'
import Path from 'path'

const { getDocument, OPS } = pdfjs

export async function extract (src, dst) {
  const doc = await getDocument(src).promise
  const pageCount = doc._pdfInfo.numPages
  console.log({ pageCount })
  const images = []
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p)
    const ops = await page.getOperatorList()

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (
        ops.fnArray[i] === OPS.paintJpegXObject ||
        ops.fnArray[i] === OPS.paintImageXObject ||
        ops.fnArray[i] === OPS.paintInlineImageXObject) {
        const name = ops.argsArray[i][0]
        const img = await page.objs.get(name)
        const { width, height, kind } = img
        const bytes = img.data.length
        const channels = bytes / width / height
        const file = Path.join(dst, `${name}.jpg`)
        await sharp(img.data, {
          raw: { width, height, channels }
        }).toFile(file)
        images.push({ name, kind, width, height, channels, bytes, file })
      }
    }
  }
  console.log('images count:', images.length)
}
