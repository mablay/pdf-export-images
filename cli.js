#!/usr/bin/env node
import { exportImagesEvents } from './index.js'
const args = process.argv.slice(2)
const [file, dir = '.'] = args

const help = `Usage: pdf-export-images <file> [dir]

Exports images from a PDF file to disk.

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
  exportImagesEvents(file, dir)
    .on('load', event => console.log('Exporting images from', event.pageCount, 'pages...'))
    .on('image', ({ file, width, height }) => console.log(file, `(${width}x${height})`))
    .on('done', images => console.log(images.length, 'images exported'))
    .catch(console.error)
}
