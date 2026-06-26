/**
 * Preview seed — populates a representative full site for 凝皓教育 (Defining
 * Education): the brand nav, a marketing home page, and every inner page linked
 * from the navigation (about / tutors / courses / news / student notice /
 * registration / contact / join us / locations), all assembled from the CMS
 * marketing blocks.
 *
 * Content is a best-effort *simulation* of the public site
 * (https://www.definingeducation.com.hk) — names, subjects, branches and
 * teaching modes mirror the real site; addresses, phone numbers and policy copy
 * are demo placeholders. Demo data only; safe to delete.
 *
 * Placeholder imagery is generated on the fly with sharp (brand-coloured SVG →
 * PNG) so the seed never depends on the network or real photos.
 *
 * Run: pnpm payload run scripts/seed-preview.ts
 */
import type { File } from 'payload'

import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '@payload-config'

// ── Lexical rich-text helpers ───────────────────────────────────────────────
type Node = { type: string; version: number; [k: string]: unknown }
const lex = (children: Node[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children,
  },
})
const text = (t: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})
const heading = (t: string, tag = 'h1'): Node => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(t)],
})
const para = (t: string): Node => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [text(t)],
})
const bullets = (items: string[]): Node => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((item, i) => ({
    type: 'listitem',
    value: i + 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [text(item)],
  })),
})

// ── Placeholder image generation (no real photos, no network) ──────────────
const svgToPng = async (name: string, svg: string): Promise<File> => {
  const data = await sharp(Buffer.from(svg)).png().toBuffer()
  return { name: `${name}.png`, data, mimetype: 'image/png', size: data.byteLength }
}

// Generic avatar silhouette on a brand-tinted background.
const avatarSvg = (bg: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <circle cx="300" cy="232" r="96" fill="#ffffff" fill-opacity="0.92"/>
  <path d="M300 352 C188 352 108 436 108 566 L108 600 L492 600 L492 566 C492 436 412 352 300 352 Z" fill="#ffffff" fill-opacity="0.92"/>
</svg>`

// Wide marketing banner (brand gradient + soft shapes) — used for the hero
// slider and as the background image behind every page's hero banner.
const bannerSvg = (from: string, via: string, to: string, accent: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="0.55" stop-color="${via}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#g)"/>
  <circle cx="1320" cy="140" r="280" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="240" cy="560" r="220" fill="#ffffff" fill-opacity="0.05"/>
  <circle cx="1180" cy="520" r="150" fill="${accent}" fill-opacity="0.16"/>
  <circle cx="120" cy="120" r="90" fill="${accent}" fill-opacity="0.12"/>
</svg>`

// 16:9 placeholder poster for a news post — brand gradient with a faint glyph.
const postSvg = (from: string, to: string, glyph: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <circle cx="660" cy="90" r="150" fill="#ffffff" fill-opacity="0.06"/>
  <text x="400" y="300" font-family="'PingFang HK','Noto Sans CJK TC',sans-serif" font-size="200" font-weight="700" fill="#ffffff" fill-opacity="0.16" text-anchor="middle">${glyph}</text>
</svg>`

const payload = await getPayload({ config })

// Clear previously-seeded demo content so re-runs stay idempotent (this seed is
// demo data only). Pages/posts are deleted before media to avoid dangling refs.
for (const collection of ['pages', 'posts', 'tutors', 'media'] as const) {
  await payload.delete({
    collection,
    where: { id: { exists: true } },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
}
console.log('✓ cleared previous demo pages / posts / media')

// Small helper: create a media doc from an SVG and return its id.
const makeMedia = async (name: string, svg: string, alt: string): Promise<number> => {
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt },
    file: await svgToPng(name, svg),
  })
  return doc.id as number
}

// Brand palettes cycled across page banners so each header feels distinct.
const bannerPalettes: [string, string, string, string][] = [
  ['#04312b', '#0f6e63', '#25d9c4', '#fae549'],
  ['#0b3a52', '#1f7a8c', '#25d9c4', '#fae549'],
  ['#13243b', '#0f6e63', '#2bb6a6', '#fae549'],
  ['#0f4f47', '#14857a', '#37c9b8', '#fae549'],
  ['#04312b', '#1aa897', '#25d9c4', '#fae549'],
]
let bannerIndex = 0
const makeBanner = async (slug: string, title: string): Promise<number> => {
  const p = bannerPalettes[bannerIndex % bannerPalettes.length]
  bannerIndex++
  return makeMedia(`banner-${slug}`, bannerSvg(p[0], p[1], p[2], p[3]), `${title}橫額（示範圖片）`)
}

// A heroBanner block: branded background + overlaid title/tagline.
const heroBanner = (media: number, title: string, tagline?: string) => ({
  blockType: 'heroBanner' as const,
  media,
  richText: lex(tagline ? [heading(title, 'h1'), para(tagline)] : [heading(title, 'h1')]),
  links: [],
})

// A single-column Content block from a list of lexical nodes.
const contentBlock = (nodes: Node[]) => ({
  blockType: 'content' as const,
  columns: [{ size: 'full' as const, richText: lex(nodes), enableLink: false }],
})

// A call-to-action band.
const cta = (
  nodes: Node[],
  links: { url: string; label: string; appearance?: 'default' | 'outline'; newTab?: boolean }[],
) => ({
  blockType: 'cta' as const,
  richText: lex(nodes),
  links: links.map((l) => ({
    link: {
      type: 'custom' as const,
      url: l.url,
      label: l.label,
      appearance: l.appearance ?? ('default' as const),
      newTab: l.newTab ?? false,
    },
  })),
})

// Upsert a published page by slug.
const upsertPage = async (
  slug: string,
  title: string,
  layout: unknown[],
  meta: { title: string; description: string; image: number },
) => {
  const data = {
    title,
    slug,
    _status: 'published' as const,
    layout,
    meta,
  }
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  const ctx = { disableRevalidate: true }
  if (existing.docs.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data: data as any, overrideAccess: true, context: ctx })
    console.log(`✓ page /${slug} (updated)`)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'pages', data: data as any, overrideAccess: true, context: ctx })
    console.log(`✓ page /${slug} (created)`)
  }
}

// ── Canonical site data (mirrors the public search-course filters) ──────────
const SUBJECTS: { label: string; q: string }[] = [
  { label: '中文', q: '中文' },
  { label: '英文', q: '英文' },
  { label: '數學', q: '數學' },
  { label: '公民與社會發展', q: '公民與社會發展' },
  { label: '經濟', q: '經濟' },
  { label: '地理', q: '地理' },
  { label: '歷史', q: '歷史' },
  { label: '化學', q: '化學' },
  { label: '生物', q: '生物' },
  { label: '物理', q: '物理' },
  { label: '企業、會計與財務概論', q: '企業、會計與財務概論' },
  { label: '旅遊與款待', q: '旅遊與款待' },
  { label: '科學（物理、化學、生物）', q: '科學' },
  { label: 'IELTS', q: 'IELTS' },
  { label: 'STEM', q: 'STEM' },
  { label: '樂理', q: '樂理' },
]

const BRANCHES: { name: string; address: string; phone: string; hours: string }[] = [
  { name: '太子分校', address: '九龍太子彌敦道794號嘉安大廈3樓（示範地址）', phone: '3618 7218', hours: '星期一至日 10:00 – 21:00' },
  { name: '太子第二分校（協成行）', address: '九龍太子彌敦道750號協成行太子中心10樓（示範地址）', phone: '3618 7228', hours: '星期一至日 10:00 – 21:00' },
  { name: '旺角（周大福）分校', address: '九龍旺角彌敦道625號雅蘭中心一期8樓（示範地址）', phone: '3618 7238', hours: '星期一至日 10:00 – 21:00' },
  { name: '九龍灣分校', address: '九龍九龍灣宏照道38號企業廣場五期12樓（示範地址）', phone: '3618 7248', hours: '星期一至日 10:00 – 21:00' },
  { name: '銅鑼灣分校', address: '香港銅鑼灣軒尼詩道500號希慎廣場15樓（示範地址）', phone: '3618 7258', hours: '星期一至日 10:00 – 21:00' },
  { name: '荃灣（海之戀）分校', address: '新界荃灣楊屋道1號海之戀商場2樓（示範地址）', phone: '3618 7268', hours: '星期一至日 10:00 – 21:00' },
  { name: '荃灣（海晴軒）分校', address: '新界荃灣青山公路荃灣段398號海晴軒地下（示範地址）', phone: '3618 7278', hours: '星期一至日 10:00 – 21:00' },
  { name: '屯門（安定）分校', address: '新界屯門安定邨安定商場1樓（示範地址）', phone: '3618 7288', hours: '星期一至日 10:00 – 21:00' },
  { name: '沙田分校', address: '新界沙田正街11號沙田廣場6樓（示範地址）', phone: '3618 7298', hours: '星期一至日 10:00 – 21:00' },
  { name: '網上課程', address: '凝皓教育網上教學平台（線上授課）', phone: '3618 7218', hours: '全天候線上學習' },
]

// Full tutor roster grouped by subject (mirrors the public 本校名師 page).
const ROSTER: { subject: string; people: { zh?: string; en: string }[] }[] = [
  { subject: '中文', people: [
    { zh: '林溢欣', en: 'YY Lam' },
    { zh: '劉愷欣', en: 'Winter Lau' },
    { zh: '謝廷樞', en: 'Terence Tse' },
    { zh: '吳家欣', en: 'Tiffany Ng' },
    { zh: '林雨欣', en: 'Ashley Lin' },
    { zh: '蔡心瑜', en: 'Denise Choi' },
    { zh: '李仕鸞', en: 'Sally Li' },
  ] },
  { subject: '英文', people: [
    { en: 'Bon Lam' },
    { en: 'Speech Jeh' },
    { en: 'Rita Tsang' },
    { en: 'Alex Leung' },
    { en: 'Calvin Sun' },
  ] },
  { subject: 'IELTS', people: [
    { en: 'Richie Pang' },
    { en: 'Ms. Danie' },
    { en: 'Andrew Sir' },
  ] },
  { subject: '數學', people: [
    { en: 'Dick Hui' },
    { zh: '力臻', en: 'MC Team' },
    { en: 'Leo Sir' },
    { en: 'Marco Chan' },
  ] },
  { subject: '經濟', people: [{ en: 'Ango Chung' }] },
  { subject: '公民與社會發展', people: [{ en: 'Woody Leung' }] },
  { subject: '化學', people: [{ en: 'Dr. Sally Wong' }, { en: 'K.C. Daniel' }] },
  { subject: '物理', people: [{ en: 'Roy Sir' }, { en: 'Dom Chan' }] },
  { subject: '生物', people: [{ en: 'JT' }, { en: 'Sabrina Chan' }] },
  { subject: '企業、會計與財務概論', people: [{ en: 'Suki Chui' }, { en: 'Ling Leung' }] },
  { subject: '地理', people: [{ en: 'H.H. Oscar' }] },
  { subject: '歷史', people: [{ en: 'JC' }] },
  { subject: '旅遊與款待', people: [{ en: 'Sean To' }] },
  { subject: '樂理', people: [{ zh: '顏學煊', en: 'Christine Ngan' }] },
  { subject: '小學課程', people: [{ en: 'Miss Amy' }, { en: 'Miss Kelsea' }, { en: 'Miss Apple' }] },
]

const tealPalette = ['#1aa897', '#25d9c4', '#0f6e63', '#2bb6a6', '#14857a', '#37c9b8', '#1f9d8e', '#128576']

// ── Header / footer globals ─────────────────────────────────────────────────
await payload.updateGlobal({
  slug: 'header',
  overrideAccess: true,
  context: { disableRevalidate: true },
  data: {
    navItems: [
      { link: { type: 'custom', url: '/about', label: '關於我們', newTab: false } },
      { link: { type: 'custom', url: '/courses', label: '報讀課程', newTab: false } },
      { link: { type: 'custom', url: '/tutors', label: '本校名師', newTab: false } },
      { link: { type: 'custom', url: '/news', label: '消息及優惠', newTab: false } },
      { link: { type: 'custom', url: '/student', label: '學生須知', newTab: false } },
      { link: { type: 'custom', url: '/register', label: '新生註冊', newTab: false } },
    ],
    subjectItems: ['中文', '英文', '數學', '公民與社會發展', '經濟', '化學', '物理', '生物', '企業、會計與財務概論', '地理', '歷史', 'IELTS'].map(
      (label) => ({
        link: { type: 'custom' as const, url: `/search?q=${encodeURIComponent(label)}`, label, newTab: false },
      }),
    ),
  },
})
console.log('✓ header nav + subjects')

await payload.updateGlobal({
  slug: 'footer',
  overrideAccess: true,
  context: { disableRevalidate: true },
  data: {
    navItems: [
      { link: { type: 'custom', url: '/contact', label: '聯絡我們', newTab: false } },
      { link: { type: 'custom', url: '/join', label: '加入我們', newTab: false } },
      { link: { type: 'custom', url: '/locations', label: '學校位置及開放時間', newTab: false } },
    ],
  },
})
console.log('✓ footer nav')

// ── Tutors collection (one doc + avatar per roster member) ──────────────────
type Tutor = { id: number; name: string; subjectLabel: string }
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const usedSlugs = new Set<string>()
const allTutors: Tutor[] = []
let avatarIndex = 0
for (const group of ROSTER) {
  for (const person of group.people) {
    const name = person.zh || person.en
    const nameEn = person.zh ? person.en : ''
    let slug = slugify(person.en) || `tutor-${avatarIndex + 1}`
    while (usedSlugs.has(slug)) slug = `${slug}-${avatarIndex + 1}`
    usedSlugs.add(slug)
    const photo = await makeMedia(
      `tutor-${avatarIndex + 1}`,
      avatarSvg(tealPalette[avatarIndex % tealPalette.length]),
      `${name}（示範相片）`,
    )
    const doc = await payload.create({
      collection: 'tutors',
      overrideAccess: true,
      context: { disableRevalidate: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        name,
        nameEn: nameEn || undefined,
        subject: group.subject,
        photo,
        slug,
        _status: 'published',
        bio: lex([
          para(`${name}${nameEn ? `（${nameEn}）` : ''}為凝皓教育${group.subject}科名師。`),
          para('教學經驗豐富，緊貼 DSE 考評重點，因材施教，深受學生歡迎。（示範簡介）'),
        ]),
      } as any,
    })
    allTutors.push({ id: doc.id as number, name, subjectLabel: group.subject })
    avatarIndex++
  }
}
console.log(`✓ ${allTutors.length} tutors`)

// Featured cross-section for the home page (one star tutor per key subject).
const FEATURED = ['林溢欣', 'Bon Lam', 'Dick Hui', 'Ango Chung', 'Dr. Sally Wong', 'Roy Sir', 'JT', 'Richie Pang']
const featuredTutorIds = FEATURED.map((n) => allTutors.find((t) => t.name === n)?.id).filter(
  (id): id is number => typeof id === 'number',
)

// ── Hero slider banners (home) ──────────────────────────────────────────────
const slideSeed: {
  name: string
  alt: string
  svg: string
  eyebrow: string
  heading: string
  subheading: string
  ctaLabel: string
  url: string
}[] = [
  {
    name: 'slide-summer',
    alt: '暑期星級銜接課程橫額（示範圖片）',
    svg: bannerSvg('#04312b', '#0f6e63', '#25d9c4', '#fae549'),
    eyebrow: '2026 – 2027 學年',
    heading: '暑期「星」級銜接課程',
    subheading: '把握暑假黃金期，引領新學年晉升之路。',
    ctaLabel: '立即報名',
    url: '/courses',
  },
  {
    name: 'slide-mock',
    alt: '全港最大型中文科模擬試橫額（示範圖片）',
    svg: bannerSvg('#0b3a52', '#1f7a8c', '#25d9c4', '#fae549'),
    eyebrow: '2026 DSE',
    heading: '全港最大型中文科模擬試',
    subheading: '緊貼考評重點，實戰演練，助你穩奪佳績。',
    ctaLabel: '了解詳情',
    url: '/news',
  },
  {
    name: 'slide-tutors',
    alt: 'DSE 名師團隊橫額（示範圖片）',
    svg: bannerSvg('#13243b', '#0f6e63', '#2bb6a6', '#fae549'),
    eyebrow: '本校名師',
    heading: 'DSE 各科名師親自任教',
    subheading: '經驗豐富的補習團隊，因材施教，全面提升成績。',
    ctaLabel: '認識名師',
    url: '/tutors',
  },
]

type Slide = {
  image: number
  eyebrow: string
  heading: string
  subheading: string
  ctaLabel: string
  link: { type: 'custom'; url: string; newTab: boolean; appearance: 'default' }
}
const slides: Slide[] = []
for (const s of slideSeed) {
  const image = await makeMedia(s.name, s.svg, s.alt)
  slides.push({
    image,
    eyebrow: s.eyebrow,
    heading: s.heading,
    subheading: s.subheading,
    ctaLabel: s.ctaLabel,
    link: { type: 'custom', url: s.url, newTab: false, appearance: 'default' },
  })
}
console.log(`✓ ${slides.length} slider banners`)

// ── News posts (最新推廣及情報) ──────────────────────────────────────────────
const postSeed: { title: string; slug: string; date: string; desc: string }[] = [
  { title: '【暑假試堂】ONE-DAY FREE COURSE 接受報名！', slug: 'one-day-free-course', date: '2026-06-12T10:00:00.000Z', desc: '一天免費試堂，親身體驗凝皓名師課堂，名額有限，立即報名。' },
  { title: 'ONE-DAY SPECIAL SECTION 特別環節！不同主題活動等你 JOIN！', slug: 'one-day-special-section', date: '2026-06-12T09:00:00.000Z', desc: '一連串主題活動及工作坊，與名師近距離互動，名額有限。' },
  { title: '2026 DSE 放榜打氣大會', slug: '2026-dse-results-rally', date: '2026-06-11T10:00:00.000Z', desc: '放榜在即，凝皓名師團隊為你打氣，分享升學選科策略。' },
  { title: '【6月資助】常規課程 X 中學學生會 資助升級！', slug: 'june-subsidy', date: '2026-05-31T10:00:00.000Z', desc: '六月限定資助，常規課程聯乘中學學生會，報讀更抵。' },
  { title: '【LEO SIR】新學年陪你「玩」贏數學（限時 $200 / 2 堂）', slug: 'leo-sir-maths-promo', date: '2026-05-30T10:00:00.000Z', desc: '限時優惠，$200 兩堂，跟 Leo Sir 由淺入深掌握數學 core。' },
  { title: '升中四選科指南', slug: 'subject-selection-guide', date: '2026-05-28T10:00:00.000Z', desc: '選科影響升學前路，一文看清各科出路與選科貼士。' },
  { title: '【分校時間表 – LIVE 班】暑期「星」級銜接課程', slug: 'summer-live-timetable', date: '2026-05-28T09:00:00.000Z', desc: '各分校 LIVE 班暑期銜接課程時間表一覽，立即查看。' },
  { title: '【額滿／學位緊張課程】暑期「星」級銜接課程', slug: 'summer-full-classes', date: '2026-05-28T08:00:00.000Z', desc: '部分課程已額滿或學位緊張，把握最後機會報讀。' },
  { title: '【2027 DSE】考試時間表', slug: '2027-dse-timetable', date: '2026-05-22T10:00:00.000Z', desc: '2027 DSE 各科考試日期一覽，及早規劃溫習進度。' },
  { title: '【眾裡尋她】文青女神 SALLY LI 李仕鸞 正式加盟任教中文科🎊', slug: 'sally-li-joins', date: '2026-05-20T10:00:00.000Z', desc: '中文科名師 Sally Li 李仕鸞正式加盟凝皓，帶來嶄新教學風格。' },
  { title: '【林溢欣】免費閱讀操卷工作坊（十）', slug: 'reading-workshop', date: '2026-05-17T10:00:00.000Z', desc: '林溢欣老師親授閱讀理解操卷技巧，免費參加，座位有限。' },
  { title: '【立即報名】暑期「星」級銜接課程｜把握暑假黃金期', slug: 'summer-course-enrol', date: '2026-05-08T10:00:00.000Z', desc: '把握暑假黃金期，引領新學年晉升之路，立即報名暑期課程。' },
]
const postPalette: [string, string, string][] = [
  ['#04312b', '#0f6e63', '試'],
  ['#0b3a52', '#1f7a8c', '動'],
  ['#14857a', '#37c9b8', '榜'],
  ['#13243b', '#2bb6a6', '助'],
  ['#0f4f47', '#1aa897', '數'],
  ['#04312b', '#25d9c4', '選'],
]
let firstPostImage = 0
for (let i = 0; i < postSeed.length; i++) {
  const p = postSeed[i]
  const [from, to, glyph] = postPalette[i % postPalette.length]
  const image = await makeMedia(`post-${i + 1}`, postSvg(from, to, glyph), `${p.title}（示範圖片）`)
  if (i === 0) firstPostImage = image
  const postData = {
    title: p.title,
    slug: p.slug,
    _status: 'published' as const,
    publishedAt: p.date,
    heroImage: image,
    content: lex([heading(p.title, 'h2'), para(p.desc)]),
    meta: { title: p.title, description: p.desc, image },
  }
  const existingPost = await payload.find({ collection: 'posts', where: { slug: { equals: p.slug } }, limit: 1, overrideAccess: true })
  if (existingPost.docs.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'posts', id: existingPost.docs[0].id, data: postData as any, overrideAccess: true, context: { disableRevalidate: true } })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({ collection: 'posts', data: postData as any, overrideAccess: true, context: { disableRevalidate: true } })
  }
}
console.log(`✓ ${postSeed.length} news posts`)

// Reusable subject tiles (link each subject to the search page).
const subjectTiles = SUBJECTS.map((s) => ({
  link: { type: 'custom' as const, url: `/search?q=${encodeURIComponent(s.q)}`, label: s.label, newTab: false },
}))

// Reusable branch list for the Locations block.
const branchRows = BRANCHES.map((b) => ({ name: b.name, address: b.address, phone: b.phone, hours: b.hours }))

// ════════════════════════════════════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════════════════════════════════════

// ── Home ────────────────────────────────────────────────────────────────────
await upsertPage(
  'home',
  '凝皓教育 Defining Education',
  [
    { blockType: 'heroSlider', autoplay: true, interval: 6, slides },
    {
      blockType: 'latestPosts',
      heading: '最新推廣及情報',
      intro: '緊貼凝皓教育最新課程、優惠及活動資訊。',
      limit: 6,
      link: { type: 'custom', url: '/news', label: '查看更多', newTab: false },
    },
    {
      blockType: 'tutorShowcase',
      heading: '本校名師',
      intro: '由經驗豐富的 DSE 名師團隊任教，緊貼考評重點，因材施教，全面提升學生成績。',
      showAll: false,
      tutors: featuredTutorIds,
    },
    {
      blockType: 'subjectsCta',
      heading: '報讀課程',
      description: '提供 DSE 各主要科目課程，點擊了解課程詳情及上課時間表。',
      subjects: subjectTiles,
    },
  ],
  { title: '凝皓教育 Defining Education', description: '凝皓教育（Defining Education）— DSE 各科名師補習課程，港九新界多區分校及網上平台。', image: slides[0].image },
)

// ── 關於我們 / about ──────────────────────────────────────────────────────────
const aboutBanner = await makeBanner('about', '關於我們')
await upsertPage(
  'about',
  '關於我們',
  [
    heroBanner(aboutBanner, '關於我們', '凝聚名師・成就學子 — 重新定義香港的教育。'),
    contentBlock([
      heading('凝皓教育 Defining Education', 'h2'),
      para('凝皓教育（Defining Education）是香港具規模的補習教育中心，集合各科 DSE 名師，為中小學生提供優質課堂及備考支援。我們深信「因材施教」，透過貼近考評的教材、系統化的操卷訓練及完善的網上平台，協助每位學生發揮潛能、考取佳績。'),
      para('我們的名師團隊涵蓋中文、英文、數學、公民與社會發展、經濟、化學、物理、生物等核心科目，並設有 IELTS、STEM 及小學課程，全面照顧不同階段的學習需要。'),
    ]),
    {
      blockType: 'featureGrid',
      heading: '為何選擇凝皓教育',
      intro: '由名師、教材到平台，全方位支援你的 DSE 之路。',
      columns: 3,
      items: [
        { icon: '🎓', title: '星級名師團隊', description: '各科 DSE 名師親自任教，緊貼考評重點與評卷準則。' },
        { icon: '📚', title: '全面 DSE 科目', description: '涵蓋中、英、數及各選修科共 16 個科目，一校報齊。' },
        { icon: '📍', title: '多區分校網絡', description: '港九新界共設 9 間實體分校，就近上課更方便。' },
        { icon: '💻', title: '靈活授課模式', description: '現場、視像、線上及混合模式任君選擇，遷就你的時間表。' },
        { icon: '📈', title: '數據化追蹤', description: '定期模擬試與成績分析，清晰掌握學習進度。' },
        { icon: '🤝', title: '貼心學生支援', description: '完善網上平台、補課及調堂安排，學習無後顧之憂。' },
      ],
    },
    {
      blockType: 'featureGrid',
      heading: undefined,
      columns: 4,
      items: [
        { icon: '16', title: 'DSE 科目', description: '核心及選修科目全面覆蓋。' },
        { icon: '9', title: '實體分校', description: '港九新界多區就近上課。' },
        { icon: '40+', title: '名師團隊', description: '各科經驗豐富的補習名師。' },
        { icon: '6', title: '授課模式', description: '現場 / 視像 / 線上 / 混合。' },
      ],
    },
    cta([heading('準備好提升成績了嗎？', 'h2'), para('立即報讀凝皓課程，與名師團隊一同迎戰 DSE。')], [
      { url: '/courses', label: '報讀課程', appearance: 'default' },
      { url: '/tutors', label: '認識名師', appearance: 'outline' },
    ]),
  ],
  { title: '關於我們', description: '認識凝皓教育（Defining Education）的教學理念、名師團隊與分校網絡。', image: aboutBanner },
)

// ── 本校名師 / tutors ─────────────────────────────────────────────────────────
const tutorsBanner = await makeBanner('tutors', '本校名師')
await upsertPage(
  'tutors',
  '本校名師',
  [
    heroBanner(tutorsBanner, '本校名師', '各科 DSE 名師親自任教，緊貼考評重點，因材施教。點擊名師了解詳情。'),
    {
      blockType: 'tutorShowcase',
      heading: '名師團隊',
      intro: '涵蓋中文、英文、數學、理科、商科、人文及小學課程，總有一位適合你。',
      showAll: true,
    },
    cta([heading('想了解名師的課程及時間表？', 'h2'), para('立即搜尋課程，或聯絡我們查詢報名詳情。')], [
      { url: '/courses', label: '搜尋課程', appearance: 'default' },
      { url: '/contact', label: '聯絡我們', appearance: 'outline' },
    ]),
  ],
  { title: '本校名師', description: '凝皓教育 DSE 各科名師團隊一覽 — 中文、英文、數學、理科、商科、人文及小學課程。', image: tutorsBanner },
)

// ── 報讀課程 / courses ────────────────────────────────────────────────────────
const coursesBanner = await makeBanner('courses', '報讀課程')
await upsertPage(
  'courses',
  '報讀課程',
  [
    heroBanner(coursesBanner, '報讀課程', '網上報名・搜尋課程 — 揀選導師、科目、分校及上課時間。'),
    contentBlock([
      heading('課程報名', 'h2'),
      para('凝皓教育提供 DSE 各科常規班、銜接班及專題課程。你可按導師、科目、年級、上課分校、上課形式及星期搜尋合適課程，並於網上即時報名。如有疑問，歡迎聯絡任何一間分校的職員協助。'),
    ]),
    {
      blockType: 'subjectsCta',
      heading: '報讀科目',
      description: '點擊科目搜尋相關課程及上課時間表。',
      subjects: subjectTiles,
    },
    {
      blockType: 'featureGrid',
      heading: '授課模式',
      intro: '不同課程採用不同授課模式，報名前請留意導師章程上的說明。',
      columns: 3,
      items: [
        { icon: 'L', title: '現場班', description: '由導師親身現場授課；若人數超過課室容量，將分配至其他課室。' },
        { icon: 'V', title: '視像班', description: '由導師預先錄製視像教材授課，導師不會親身出現課堂。' },
        { icon: 'SL', title: '半現場班', description: '以四堂為例，其中兩堂現場授課、兩堂播放預錄視像教材。' },
        { icon: 'QL', title: '四分一現場班', description: '以四堂為例，其中一堂現場授課、三堂播放預錄視像教材。' },
        { icon: 'OT', title: '線上課程', description: '透過凝皓網站全線上授課，影片設觀看期限、次數及權限。' },
        { icon: 'LO', title: '混合課程', description: '部分課堂於分校進行，部分為線上課程，安排詳見導師章程。' },
      ],
    },
    {
      blockType: 'locations',
      heading: '上課分校',
      intro: '港九新界共設 9 間實體分校，另設網上課程。',
      branches: branchRows,
    },
    cta([heading('準備好開始了嗎？', 'h2'), para('立即搜尋課程並完成網上報名，或前往任何分校查詢。')], [
      { url: '/register', label: '立即報名', appearance: 'default' },
      { url: '/contact', label: '查詢課程', appearance: 'outline' },
    ]),
  ],
  { title: '報讀課程', description: '凝皓教育課程報名 — DSE 各科常規班、銜接班及專題課程，多種授課模式及分校選擇。', image: coursesBanner },
)

// ── 消息及優惠 / news ──────────────────────────────────────────────────────────
const newsBanner = await makeBanner('news', '消息及優惠')
await upsertPage(
  'news',
  '消息及優惠',
  [
    heroBanner(newsBanner, '消息及優惠', '最新課程、優惠及活動資訊一覽。'),
    {
      blockType: 'latestPosts',
      heading: '最新消息',
      intro: '緊貼凝皓教育的課程優惠、模擬試、工作坊及活動消息。',
      limit: 12,
      link: { type: 'custom', url: '/register', label: '立即報名', newTab: false },
    },
  ],
  { title: '消息及優惠', description: '凝皓教育最新課程優惠、模擬試、免費工作坊及活動消息。', image: firstPostImage || newsBanner },
)

// ── 學生須知 / student ────────────────────────────────────────────────────────
const studentBanner = await makeBanner('student', '學生須知')
await upsertPage(
  'student',
  '學生須知',
  [
    heroBanner(studentBanner, '學生須知', '上課前請細閱以下須知，讓學習更順利。'),
    contentBlock([
      heading('上課須知', 'h2'),
      bullets([
        '請於上課前 10 分鐘到達分校報到，並出示學生證或報名確認。',
        '上課期間請保持安靜，並將手提電話調至靜音。',
        '教材將於課堂派發，請妥善保管，遺失恕不補發。',
      ]),
      heading('缺席與調堂', 'h2'),
      bullets([
        '如未能出席課堂，可於開課 48 小時前申請調堂。',
        '調堂為額外增值服務，本校不保證可成功安排。',
        '缺席恕不退回該堂學費。',
      ]),
      heading('退款政策', 'h2'),
      bullets([
        '已繳學費一經確認，除課程取消外，恕不退還。',
        '如課程因故取消，本校將安排全額退款或轉堂。',
      ]),
      heading('課堂守則', 'h2'),
      bullets([
        '嚴禁錄音、錄影或翻印教材，違者須承擔法律責任。',
        '請愛護分校設施，保持環境整潔。',
        '尊重導師及其他同學，共同維持良好學習氣氛。',
      ]),
    ]),
    cta([heading('有疑問？', 'h2'), para('歡迎聯絡任何一間分校的職員，我們樂意為你解答。')], [
      { url: '/contact', label: '聯絡我們', appearance: 'default' },
    ]),
  ],
  { title: '學生須知', description: '凝皓教育學生上課須知 — 報到、缺席調堂、退款政策及課堂守則。', image: studentBanner },
)

// ── 新生註冊 / register ───────────────────────────────────────────────────────
const registerBanner = await makeBanner('register', '新生註冊')
await upsertPage(
  'register',
  '新生註冊',
  [
    heroBanner(registerBanner, '新生註冊', '只需簡單六步，即可完成網上報名。'),
    {
      blockType: 'featureGrid',
      heading: '報名流程',
      intro: '新生可透過凝皓網站完成註冊及報名，全程約需數分鐘。',
      columns: 3,
      items: [
        { icon: '01', title: '教育產品說明', description: '閱讀並同意《商品說明條例》及個人資料收集聲明。' },
        { icon: '02', title: '選擇課程', description: '按導師、科目、分校及上課時間搜尋並選擇合適課程。' },
        { icon: '03', title: '填寫個人資料', description: '提供學生及家長的聯絡資料。' },
        { icon: '04', title: '上載文件', description: '如適用，上載所需證明文件。' },
        { icon: '05', title: '確認及繳費', description: '核對課程資料並完成網上付款。' },
        { icon: '06', title: '完成報名', description: '收到確認電郵及上課安排。' },
      ],
    },
    contentBlock([
      heading('教育產品說明', 'h2'),
      para('本校嚴守香港特區政府頒布的《商品說明條例》，致力確保所提供的課程及服務資料準確、不具誤導性，以保障消費者權益。'),
      heading('導師資歷', 'h3'),
      para('所有導師報稱的資歷均經本校查驗文件正本後方會刊載於網站及官方宣傳品；宣傳品如涉及比較字眼，均以公開市場資料為依據。'),
      heading('調堂服務', 'h3'),
      para('調堂為額外增值服務，本校並不保證可成功安排，亦不會因學生缺課而退回部分或全部學費。'),
      heading('印刷宣傳品資料', 'h3'),
      para('受各種因素影響，印刷宣傳品上的課程日期、時間及模式可能有所變更。基於環保考慮，校方未必重新印刷，學生或家長應以官方網頁資料為準。'),
      heading('個人資料收集聲明', 'h3'),
      para('依據《個人資料（私隱）條例》，本校所收集及使用的個人資料只限於業務所需及提供優質服務的範圍，包括資料統計、通訊及推廣、處理查詢及投訴、帳單及付款、身份核實及突發事件處理。提供個人資料純屬自願，惟如未能提供，本校或無法完成報讀手續。'),
    ]),
    cta([heading('準備好註冊了嗎？', 'h2'), para('立即搜尋課程並完成網上報名，或聯絡分校職員協助。')], [
      { url: '/courses', label: '開始報名', appearance: 'default' },
      { url: '/contact', label: '聯絡我們', appearance: 'outline' },
    ]),
  ],
  { title: '新生註冊', description: '凝皓教育新生網上註冊流程 — 六步完成報名，附教育產品說明及個人資料收集聲明。', image: registerBanner },
)

// ── 聯絡我們 / contact ────────────────────────────────────────────────────────
const contactBanner = await makeBanner('contact', '聯絡我們')
await upsertPage(
  'contact',
  '聯絡我們',
  [
    heroBanner(contactBanner, '聯絡我們', '歡迎透過以下方式與凝皓教育聯絡。'),
    {
      blockType: 'content',
      columns: [
        { size: 'half', enableLink: false, richText: lex([
          heading('聯絡方法', 'h3'),
          bullets([
            '電話：3618 7218',
            'WhatsApp：9123 4567（示範）',
            '電郵：info@definingeducation.com.hk',
          ]),
        ]) },
        { size: 'half', enableLink: false, richText: lex([
          heading('辦公時間', 'h3'),
          bullets([
            '星期一至日：10:00 – 21:00',
            '公眾假期：10:00 – 18:00',
          ]),
          para('你亦可於 Facebook、Instagram、YouTube 及 WhatsApp 與我們聯繫。'),
        ]) },
      ],
    },
    {
      blockType: 'locations',
      heading: '分校地址及開放時間',
      intro: '歡迎親臨任何一間分校查詢及報名。',
      branches: branchRows,
    },
  ],
  { title: '聯絡我們', description: '凝皓教育聯絡方法、辦公時間及各分校地址。', image: contactBanner },
)

// ── 加入我們 / join ───────────────────────────────────────────────────────────
const joinBanner = await makeBanner('join', '加入我們')
await upsertPage(
  'join',
  '加入我們',
  [
    heroBanner(joinBanner, '加入我們', '與凝皓教育一同重新定義香港的教育。'),
    contentBlock([
      heading('加入我們', 'h2'),
      para('凝皓教育正不斷擴展，誠邀有志投身教育事業的你加入我們的團隊。我們提供具競爭力的薪酬、完善的培訓及廣闊的發展空間。'),
      heading('招聘職位', 'h3'),
      bullets([
        '各科導師（全職／兼職）',
        '課程主任',
        '客戶服務主任',
        '市場推廣主任',
        '影片剪輯及製作',
      ]),
      para('有意者請將履歷電郵至 hr@definingeducation.com.hk，並於主旨註明應徵職位。'),
    ]),
    cta([heading('準備好加入了嗎？', 'h2'), para('把握機會，成為凝皓教育團隊的一份子。')], [
      { url: 'mailto:hr@definingeducation.com.hk', label: '投遞履歷', appearance: 'default' },
    ]),
  ],
  { title: '加入我們', description: '凝皓教育招聘 — 誠邀導師及各職位人才加入團隊。', image: joinBanner },
)

// ── 學校位置及開放時間 / locations ───────────────────────────────────────────
const locationsBanner = await makeBanner('locations', '學校位置及開放時間')
await upsertPage(
  'locations',
  '學校位置及開放時間',
  [
    heroBanner(locationsBanner, '學校位置及開放時間', '港九新界共 9 間分校，另設網上課程。'),
    {
      blockType: 'locations',
      heading: '分校一覽',
      intro: '各分校地址、聯絡電話及開放時間如下（地址為示範資料）。',
      branches: branchRows,
    },
    cta([heading('找到就近的分校了嗎？', 'h2'), para('立即報讀課程，或聯絡分校職員了解詳情。')], [
      { url: '/courses', label: '報讀課程', appearance: 'default' },
      { url: '/contact', label: '聯絡我們', appearance: 'outline' },
    ]),
  ],
  { title: '學校位置及開放時間', description: '凝皓教育各分校地址、聯絡電話及開放時間。', image: locationsBanner },
)

// Flush stdout before exiting — process.exit() would otherwise truncate the
// buffered progress logs when output is redirected to a file/pipe.
await new Promise<void>((resolve) => {
  process.stdout.write('seed-preview done\n', () => resolve())
})
process.exit(0)
