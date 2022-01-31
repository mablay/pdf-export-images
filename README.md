# PDF Export Images
Exports images in their native resolution from a PDF file to disk.

## Use via CLI
```
Usage: npx pdf-export-images <file> [dir]

Arguments:
  file        path to PDF file
  dir         image destination directory (default: ".")
```
You can also install the package globally via `npm i -g pdf-export-images` to run the command without `npx`

## Programatic use
install
```sh
npm i pdf-export-images
```

`script.js`
```js
import { exportImages } from 'pdf-export-images'
exportImages('file.pdf', 'output/dir')
  .then(images => console.log('Exported', images.length, 'images'))
  .catch(console.error)
```

See: [cli.js](https://github.com/mablay/pdf-export-images/blob/main/cli.js#L23) for progress details during export.