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

```sh
# Install
npm i pdf-export-images
```

```js
import { exportImages, exportImagesEvents } from 'pdf-export-images'

// Export via promise
exportImages('file.pdf', 'output/dir')
  .then(images => console.log('Exported', images.length, 'images'))
  .catch(console.error)

// Export via EventEmitter
exportImagesEvents('file.pdf', 'output/dir')
  .on('load', event => console.log('Exporting images from', event.pageCount, 'pages...'))
  .on('image', ({ file, width, height }) => console.log(file, `(${width}x${height})`))
  .on('error', console.error)
  .on('done', images => console.log(images.length, 'images exported'))
```

See: [cli.js](https://github.com/mablay/pdf-export-images/blob/main/cli.js#L23) for progress details during export.

## Change Notes

* v1.2.0 added typescript support
* v1.1.0 improved image extraction