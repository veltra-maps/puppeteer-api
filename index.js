const express = require('express');
const puppeteer = require('puppeteer');

// 明示的にChromeの実行パスを直接記述（Fly.io 用パス）
const executablePath = '/app/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome';
console.log('Puppeteer executable path:', executablePath);

const app = express();
const PORT = process.env.PORT || 8080; // Fly.io 推奨ポート

let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    executablePath: executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  });
  console.log('✅ Puppeteer browser launched');
})();

app.get('/scrape', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url= parameter.');
  }

  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded', // 軽量な読み込み完了条件
      timeout: 45000                  // タイムアウトも調整済み
    });
    const content = await page.content();
    await page.close();
    res.send(content);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
