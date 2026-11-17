/* Probe: date input styling on the edit form, light + dark. */
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
  const info = await page.evaluate(() => {
    const input = document.querySelector('input[type="date"]')
    if (!input) return { found: false }
    const cs = getComputedStyle(input)
    const indicator = getComputedStyle(input, '::-webkit-calendar-picker-indicator')
    return {
      found: true,
      bg: cs.backgroundColor,
      color: cs.color,
      scheme: cs.colorScheme,
      indicatorOpacity: indicator.opacity,
      indicatorFilter: indicator.filter,
      inputCls: input.className,
    }
  })
  console.log('light:', JSON.stringify(info, null, 1))
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('input[type="date"]')][0]
    el.closest('form, div')?.scrollIntoView({ block: 'center' })
  })
  await new Promise((r) => setTimeout(r, 200))
  await page.screenshot({ path: '/tmp/opencode/dob-light.png' })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await new Promise((r) => setTimeout(r, 300))
  const dark = await page.evaluate(() => {
    const input = document.querySelector('input[type="date"]')
    const cs = getComputedStyle(input)
    return { bg: cs.backgroundColor, color: cs.color, scheme: cs.colorScheme }
  })
  console.log('dark:', JSON.stringify(dark))
  await page.screenshot({ path: '/tmp/opencode/dob-dark.png' })
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error('FAIL', e); process.exit(1) })
