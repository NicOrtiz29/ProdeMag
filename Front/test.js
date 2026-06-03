import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await browser.close();
})();
