const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    referer: 'https://www.cruisemapper.com/ships/MSC-Bellissima-1359'
  });

  const response = await page.goto('https://www.cruisemapper.com/ships/cruise.json?id=4026182', {
    waitUntil: 'networkidle2',
    timeout: 15000
  });

  const body = await response.text();
  console.log(body);

  await browser.close();
})();
