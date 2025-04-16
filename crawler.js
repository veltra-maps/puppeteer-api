const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/app/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.cruisemapper.com/ships/MSC-Bellissima-1359', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // 最初のクルーズ行をクリック
  const firstRow = await page.$('tr.cruiseRow');
  if (firstRow) {
    await firstRow.click();
    await page.waitForSelector('tr.cruiseExpandRow .cruiseExpand', { timeout: 5000 });

    const itinerary = await page.$$eval('tr.cruiseExpandRow .cruiseExpand tbody tr', rows =>
      rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          day: cells[0]?.innerText.trim(),
          date: cells[1]?.innerText.trim(),
          port: cells[2]?.innerText.trim(),
          arrival: cells[3]?.innerText.trim(),
          departure: cells[4]?.innerText.trim(),
        };
      })
    );

    console.log(JSON.stringify(itinerary, null, 2));
  } else {
    console.log('No cruise rows found.');
  }

  await browser.close();
})();

