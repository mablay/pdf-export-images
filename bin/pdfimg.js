#!/usr/bin/env node
import { extractImagesEvents } from '../index.js'
const args = process.argv.slice(2)
const [file, dir = '.'] = args

const help = `Usage: pdfimg <file> [dir]

Extracts all images from a PDF file and writes them to disk.

Arguments:
  file        path to PDF file
  dir         image destination directory (default: ".")

Options:
  -h, --help  display help for command`

if (args.includes('-h') || args.includes('--help')) {
  console.log(help)
} else if (!file) {
  console.warn('Missing PDF source path argument!')
  console.log(help)
} else {
  extractImagesEvents(file, dir)
    .on('load', event => console.log('Extracting images from', event.pageCount, 'pages...'))
    .on('image', ({ file, width, height }) => console.log(file, `(${width}x${height})`))
    .on('done', images => console.log(images.length, 'images extracted'))
    .catch(console.error)
}
