const fs       = require('fs')
const request  = require('request')
const cheerio  = require('cheerio')

const settings = require('./settings')

// Settings
const idFile   = settings.idFile
const username = settings.username

// Helpers
const galleryUrl = (username, page = 1) =>
  `https://www.fotoblur.com/people/${username}/gallery?page=${page}`

// Scrapers
const scrapeImageIdsFromGalleryPage = (galleryPageUrl, cb) => {
  console.log('Attemping to scrape', galleryPageUrl)

  request(galleryPageUrl, (error, response, html) => {
    if (error) return cb(error)

    let items = []
    const $ = cheerio.load(html)

    $('#divImages .overlay').each((idx, a) => {
      const id    = +$(a).attr('href').replace('/images/', '')
      const title = $(a).children('.t').text()

      if (id) {
        items.push({
          id: id,
          title: title
        })
      }
    })

    console.log('- Found ' + items.length + ' image items', items)

    cb(null, items)
  })
}

const scrapeAllImageIds = (username, progressFn) => {
  const next = (page) => () => {
    scrapeImageIdsFromGalleryPage(galleryUrl(username, page), (error, newItems) => {
      if (error)
        return console.warn(error)

      if (!newItems || newItems.length < 1)
        return

      progressFn(next(page + 1), newItems)
    })
  }

  next(1)()
}

// Start
scrapeAllImageIds(username, (next, items) => {
  let txt = ''

  items.forEach((item) => {
    txt += item.id + ',' + item.title.trim() + "\n"
  })

  fs.appendFile(idFile, txt, (error) => {
    if (error)
      return console.warn(error)

    next()
  })
})