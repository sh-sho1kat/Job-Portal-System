import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
const page = await browser.newPage()
await page.evaluateOnNewDocument(() => localStorage.setItem('job-portal-theme', 'light'))
await page.setViewport({ width: 1440, height: 1000 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto('http://localhost:5199/jobs/ambertech-qa', { waitUntil: 'networkidle0', timeout: 20000 })
await page.screenshot({ path: '/tmp/opencode/detail-2col.png', fullPage: true })

const clickAnalyze = () => page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Analyze')
  btn.click()
})
const bandText = () => page.evaluate(() => document.querySelector('[aria-label="AI skills gap analysis"]').textContent)

const sel = 'select[aria-label="Select a resume to analyze"]'
await page.select(sel, 'resume-frontend')
await clickAnalyze()
await new Promise((r) => setTimeout(r, 700))
const t1 = await bandText()
console.log('resume-frontend: has result', /Skill match/.test(t1), '| score', (t1.match(/(\d+)%/) || [])[1])

await page.select(sel, 'resume-marketing')
const cleared = await bandText()
await clickAnalyze()
await new Promise((r) => setTimeout(r, 700))
const t2 = await bandText()
console.log('result cleared on resume change:', !/Skill match/.test(cleared), '| resume-marketing score', (t2.match(/(\d+)%/) || [])[1])

await page.$eval('[aria-label="AI skills gap analysis"]', (el) => el.scrollIntoView({ block: 'center' }))
await new Promise((r) => setTimeout(r, 300))
const rect = await page.$eval('[aria-label="AI skills gap analysis"]', (el) => {
  const r = el.getBoundingClientRect()
  return { x: 0, y: Math.max(0, r.top + scrollY - 20), width: 1440, height: Math.ceil(r.height) + 60 }
})
await page.screenshot({ path: '/tmp/opencode/ai-match.png', clip: rect })

await page.click('button[aria-label="Copy link to this job"]')
console.log('copied state:', await page.$eval('button[aria-label="Link copied"]', () => true).catch(() => false))
console.log('clipboard:', await page.evaluate(() => navigator.clipboard.readText().catch(() => 'denied')))

await page.setViewport({ width: 390, height: 844 })
await page.goto('http://localhost:5199/jobs/ambertech-qa', { waitUntil: 'networkidle0' })
console.log('mobile scrollWidth:', await page.evaluate(() => document.documentElement.scrollWidth))
console.log('console errors:', JSON.stringify(errors))
await browser.close()
