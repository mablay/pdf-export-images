import { extract } from '../index.js'
const [src, dst = '.'] = process.argv.slice(2)

extract(src, dst)
