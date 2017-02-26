# fotoblur-scraper
Downloads all images from a specific fotoblur account

# How to use

*Note this will only work if run before the fotoblur site showdown on 01-03-2017*

 - Install nodeJS from https://nodejs.org/en/
 - Open `settings.js` and edit with your account settings make sure you change the username setting
 - Open a terminal/cmd window in the installation directory
   - https://www.howtogeek.com/210147/how-to-open-terminal-in-the-current-os-x-finder-location/
 - Type `npm install` to install nodeJS dependancies
 - Once the previous command has finished type `node scrape-image-ids.js` this will create a csv file with all the image data
 - Once the previous command has finished type `node scrape-images.js` to download the images
