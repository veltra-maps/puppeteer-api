const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('https://www.cruisemapper.com/ships/MSC-Bellissima-1359', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // JS描画を待つために5秒間遅延を入れる
  await new Promise(resolve => setTimeout(resolve, 5000));

  await page.waitForSelector('tr.cruiseRow', { timeout: 10000 });

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
          departure: cells[4]?.innerText.trim()
        };
      })
    );

    const outputDir = path.join(__dirname, 'crawler_files');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `results-${timestamp}.json`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(itinerary, null, 2));
    console.log(`✅ Saved to ${filePath}`);
  } else {
    console.log('No cruise rows found.');
  }

  await browser.close();
})();
