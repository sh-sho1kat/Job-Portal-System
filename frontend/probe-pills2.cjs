/* Probe: change month via the calendar's own select; light theme. */
const puppeteer = require('puppeteer-core')
const { execSync } = require('child_process')
const CHROME = execSync(
  "ls /usr/bin/google-chrome /usr/bin/chromium /usr/bin/chromium-browser /opt/google/chrome/chrome 2>/dev/null | head -1",
  { encoding: 'utf8' },
).trim()
;(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'true', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:5199/resumes', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  await page.evaluate(() => {
    ;[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'View').click()
  })
  const pickerTrigger = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('button')].some(
        (b) => (b.getAttribute('aria-label') || '').startsWith('Date of birth:'),
      ),
    )
  for (let i = 0; i < 20 && !(await pickerTrigger()); i++) {
    await page.evaluate(() => {
      const edit = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Edit')
      if (edit) edit.click()
    })
    await new Promise((r) => setTimeout(r, 200))
  }
  if (!(await pickerTrigger())) throw new Error('edit form never opened')
  await new Promise((r) => setTimeout(r, 200))
  await page.evaluate(() => {
    ;[...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').startsWith('Date of birth:')).click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: '/tmp/opencode/pills-light.png' })

  // change the month INSIDE the calendar only
  const monthChanged = await page.evaluate(() => {
    const cal = document.querySelector('[data-slot="calendar"]')
    const month = [...cal.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Choose the Month')
    const year = [...cal.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Choose the Year')
    const setVal = (sel, v) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      setter.call(sel, v)
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const before = cal.querySelector('.dropdown_root span').textContent.trim()
    setVal(month, '4')
    setVal(year, '2000')
    return { before }
  })
  await new Promise((r) => setTimeout(r, 350))
  const after = await page.evaluate(() => {
    const cal = document.querySelector('[data-slot="calendar"]')
    return [...cal.querySelectorAll('.dropdown_root span')].map((s) => s.textContent.trim())
  })
  console.log('before:', JSON.stringify(monthChanged), 'labels after:', JSON.stringify(after))
  await page.screenshot({ path: '/tmp/opencode/pills-light-changed.png' })
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error('FAIL', e); process.exit(1) })
