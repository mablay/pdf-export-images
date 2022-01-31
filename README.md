# PDF Export Images
Exports images in their native resolution from a PDF file to disk.

## Use via CLI
```
Usage: npx pdfimg <file> [dir]

Arguments:
  file        path to PDF file
  dir         image destination directory (default: ".")
```
You can also install the package globally via `npm i -g pdfimg` to run the command without `npx`

## Programatic use
install
```sh
npm i pdfimg
```

`script.js`
```js
import { extractImages } from 'pdfimg'
extractImages('file.pdf', 'output/dir')
  .then(images => console.log('Extracted', images.length, 'images'))
  .catch(console.error)
```

See: [bin/pdfimg.js](bin/pdfimg.js) for progress details during extraction.