/* Probe: custom calendar button on the DOB field — light + dark. */
const puppeteer = require('puppeteer-core')
const { execSync } = require('child_process')
const CHROME = execSync(
  "ls /usr/bin/google-chrome /usr/bin/chromium /usr/bin/chromium-browser /opt/google/chrome/chrome 2>/dev/null | head -1",
  { encoding: 'utf8' },
).trim()
;(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'true', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:5199/resumes', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 400))
  const viewBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'View'))
  await viewBtn.asElement().click()
  await new Promise((r) => setTimeout(r, 500))
  const editBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Edit'))
  await editBtn.asElement().click()
  await new Promise((r) => setTimeout(r, 400))

  const probe = await page.evaluate(() => {
    const input = document.querySelector('input[type="date"]')
    const btn = input.parentElement.querySelector('button[aria-label="Open the date picker"]')
    input.scrollIntoView({ block: 'center' })
    const r = input.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    return {
      hasButton: Boolean(btn),
      iconInside: b.right <= r.right + 1 && b.top >= r.top && b.bottom <= r.bottom + 1,
      value: input.value,
    }
  })
  console.log('probe:', JSON.stringify(probe))

  // click the calendar button — showPicker must not throw
  await page.evaluate(() => {
    const input = document.querySelector('input[type="date"]')
    input.parentElement.querySelector('button').click()
  })
  await new Promise((r) => setTimeout(r, 200))

  // picker hidden (no native indicator visible)?  screenshot instead
  await page.screenshot({ path: '/tmp/opencode/cal-light.png' })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await new Promise((r) => setTimeout(r, 300))
  await page.screenshot({ path: '/tmp/opencode/cal-dark.png' })
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error('FAIL', e); process.exit(1) })
