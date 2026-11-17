/* Probe: month/year pills in the calendar popover. */
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

  const probe = await page.evaluate(() => {
    const roots = [...document.querySelectorAll('[data-slot="calendar"] select')]
    const selects = roots.map((s) => ({ label: s.getAttribute('aria-label'), options: s.options.length }))
    const pills = [...document.querySelectorAll('select')].map((s) => {
      const root = s.parentElement
      const cs = getComputedStyle(root)
      return { radius: cs.borderRadius, shadow: cs.boxShadow.slice(0, 30), h: root.getBoundingClientRect().height }
    })
    return { selects, pills }
  })
  console.log('probe:', JSON.stringify(probe, null, 1))
  await page.screenshot({ path: '/tmp/opencode/dp-pills.png' })

  // change month via the select and confirm the caption updates
  const changed = await page.evaluate(() => {
    const month = [...document.querySelectorAll('select')][0]
    const before = [...document.querySelectorAll('[data-slot="calendar"]')][0].textContent
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
    setter.call(month, '4') // May
    month.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  })
  await new Promise((r) => setTimeout(r, 300))
  const after = await page.evaluate(() =>
    [...document.querySelectorAll('select')].map((s) => s.parentElement.textContent.trim().slice(0, 10)),
  )
  console.log('changed:', changed, 'labels now:', JSON.stringify(after))
  await page.screenshot({ path: '/tmp/opencode/dp-pills2.png' })
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error('FAIL', e); process.exit(1) })
