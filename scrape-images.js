const fs       = require('fs')
const path     = require('path')
const request  = require('request')
const sanitize = require('sanitize-filename')
const mkdirp   = require('mkdirp')

const settings = require('./settings')

// Settings
const username     = settings.username
const idFile       = settings.idFile
const imageFolder  = settings.imageFolder
const sleep        = 1000

// Helpers
const imageUrl = (imageId, maxW = 9999, maxH = 9999) =>
  `https://www.fotoblur.com/api/resize?width=${maxW}&height=${maxH}&v=0&id=${imageId}`

const download = (uri, filePath, cb) => {
  request(uri).pipe(fs.createWriteStream(filePath)).on('close', cb)
}

const getImageData = (idFile, cb) => {
  fs.readFile(idFile, 'utf-8', (error, data) => {
    if (error)
      return cb(error)

    cb(null, data)
  })
}

const downloadImages = (items, imageFolder, progressFn) => {
  const next = (index) => () => {
    if (index >= items.length)
      return console.log('Finished downloading images')

    const item  = items[index].trim().split(',')
    const id    = item[0]
    const title = item.length >= 2 && item[1] ? item.slice(1).join(',') : 'untitled'

    if (!id)
      return console.warn('Failed to parse item at index', index, items[index])

    const sanitizedTitle = sanitize(title)
    const fileName       = `${id} - ${sanitizedTitle}.jpg`
    const filePath       = path.resolve(imageFolder, fileName)

    if (fs.existsSync(filePath)) {
      console.log('Image already downloaded skipping', fileName)
      return progressFn(null, next(index + 1), { id, title })
    }

    download(imageUrl(id), filePath, (error) => {
      if (error)
        return progressFn(error)

      progressFn(null, next(index + 1), { id, title })
    })
  }

  next(0)()
}

// Start
getImageData(idFile, (error, data) => {
  if (error)
    return console.warn('Failed to load image data file', idFile, error)

  const items = data.trim().split("\n")

  if (!items || !items.length) {
    return console.warn('Image data file empty', idFile)
  }

  mkdirp(imageFolder, (error) => {
    if (error)
      return console.warn(error)

    downloadImages(items, imageFolder, (err, next, item) => {
      if (err)
        return console.warn(err)

      console.log('Image successfully downloaded', item)

      setTimeout(() => {
        next()
      }, sleep)
    })
  })
})