/**
 * Preview seed — populates just enough content (real DE nav + a representative
 * home page built from the marketing blocks) to preview the brand styling.
 * Demo data only; safe to delete.
 *
 * Placeholder imagery is generated on the fly with sharp (brand-coloured SVG →
 * PNG) so the seed never depends on the network or real photos.
 *
 * Run: pnpm payload run scripts/seed-preview.ts
 */
import type { File } from 'payload'
import type { HeroSliderBlock } from '@/payload-types'

import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '@payload-config'

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
const heading = (text: string, tag = 'h1'): Node => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})
const para = (text: string): Node => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
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

// Wide 5:2 marketing banner for the hero slider (brand gradient + soft shapes).
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
  },
})
console.log('✓ header nav')

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

// ── Media: tutor avatars ────────────────────────────────────────────────────
const tutorSeed: { name: string; subject: string }[] = [
  { name: '陳力行老師', subject: '中文' },
  { name: '黃浩然老師', subject: '英文' },
  { name: '李敏儀老師', subject: '數學' },
  { name: '張家輝老師', subject: '經濟' },
  { name: '劉淑芬老師', subject: '化學' },
  { name: '周文傑老師', subject: '物理' },
  { name: '何嘉怡老師', subject: '生物' },
  { name: '林俊賢老師', subject: '數學（M2）' },
]
const tealPalette = ['#1aa897', '#25d9c4', '#0f6e63', '#2bb6a6', '#14857a', '#37c9b8', '#1f9d8e', '#128576']

const tutors: { name: string; subject: string; photo: number }[] = []
for (let i = 0; i < tutorSeed.length; i++) {
  const t = tutorSeed[i]
  const photo = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: `${t.name}（示範相片）` },
    file: await svgToPng(`tutor-${i + 1}`, avatarSvg(tealPalette[i % tealPalette.length])),
  })
  tutors.push({ name: t.name, subject: t.subject, photo: photo.id })
}
console.log(`✓ ${tutors.length} tutor avatars`)

// ── Hero slider banners ─────────────────────────────────────────────────────
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

const slides: NonNullable<HeroSliderBlock['slides']> = []
for (const s of slideSeed) {
  const media = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: s.alt },
    file: await svgToPng(s.name, s.svg),
  })
  slides.push({
    image: media.id,
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
  {
    title: '【暑假試堂】ONE-DAY FREE COURSE 接受報名！',
    slug: 'one-day-free-course',
    date: '2026-06-12T10:00:00.000Z',
    desc: '一天免費試堂，親身體驗凝皓名師課堂，名額有限，立即報名。',
  },
  {
    title: '2026 DSE 放榜打氣大會',
    slug: '2026-dse-results-rally',
    date: '2026-06-11T10:00:00.000Z',
    desc: '放榜在即，凝皓名師團隊為你打氣，分享升學選科策略。',
  },
  {
    title: '【LEO SIR】新學年陪你「玩」贏數學（限時 $200 / 2 堂）',
    slug: 'leo-sir-maths-promo',
    date: '2026-05-30T10:00:00.000Z',
    desc: '限時優惠，$200 兩堂，跟 Leo Sir 由淺入深掌握數學core。',
  },
  {
    title: '升中四選科指南',
    slug: 'subject-selection-guide',
    date: '2026-05-28T10:00:00.000Z',
    desc: '選科影響升學前路，一文看清各科出路與選科貼士。',
  },
  {
    title: '【2027 DSE】考試時間表',
    slug: '2027-dse-timetable',
    date: '2026-05-22T10:00:00.000Z',
    desc: '2027 DSE 各科考試日期一覽，及早規劃溫習進度。',
  },
  {
    title: '【林溢欣】免費閱讀操卷工作坊',
    slug: 'reading-workshop',
    date: '2026-05-17T10:00:00.000Z',
    desc: '林溢欣老師親授閱讀理解操卷技巧，免費參加，座位有限。',
  },
]
const postPalette: [string, string, string][] = [
  ['#04312b', '#0f6e63', '試'],
  ['#0b3a52', '#1f7a8c', '榜'],
  ['#14857a', '#37c9b8', '數'],
  ['#13243b', '#2bb6a6', '選'],
  ['#0f4f47', '#1aa897', 'DSE'],
  ['#04312b', '#25d9c4', '讀'],
]
for (let i = 0; i < postSeed.length; i++) {
  const p = postSeed[i]
  const [from, to, glyph] = postPalette[i % postPalette.length]
  const image = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: `${p.title}（示範圖片）` },
    file: await svgToPng(`post-${i + 1}`, postSvg(from, to, glyph)),
  })
  const existingPost = await payload.find({
    collection: 'posts',
    where: { slug: { equals: p.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const postData = {
    title: p.title,
    slug: p.slug,
    _status: 'published' as const,
    publishedAt: p.date,
    heroImage: image.id,
    content: lex([heading(p.title, 'h2'), para(p.desc)]),
    meta: { title: p.title, description: p.desc, image: image.id },
  }
  if (existingPost.docs.length) {
    await payload.update({
      collection: 'posts',
      id: existingPost.docs[0].id,
      data: postData,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  } else {
    await payload.create({
      collection: 'posts',
      data: postData,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }
}
console.log(`✓ ${postSeed.length} news posts`)

// ── Subjects grid ──────────────────────────────────────────────────────────
const subjectSeed: { label: string; slug: string }[] = [
  { label: '中文', slug: 'chinese' },
  { label: '英文', slug: 'english' },
  { label: '數學', slug: 'mathematics' },
  { label: '經濟', slug: 'economics' },
  { label: '化學', slug: 'chemistry' },
  { label: '物理', slug: 'physics' },
  { label: '生物', slug: 'biology' },
  { label: '企業、會計與財務概論', slug: 'bafs' },
  { label: '地理', slug: 'geography' },
  { label: '歷史', slug: 'history' },
  { label: '旅遊與款待', slug: 'tourism' },
  { label: 'IELTS', slug: 'ielts' },
]
const subjects = subjectSeed.map(({ label, slug }) => ({
  link: { type: 'custom' as const, url: `/courses/${slug}`, label, newTab: false },
}))

// ── Home page assembled from the three marketing blocks ────────────────────
const data = {
  title: '凝皓教育 Defining Education',
  slug: 'home',
  _status: 'published' as const,
  hero: { type: 'none' as const },
  layout: [
    {
      blockType: 'heroSlider' as const,
      autoplay: true,
      interval: 6,
      slides,
    },
    {
      blockType: 'latestPosts' as const,
      heading: '最新推廣及情報',
      intro: '緊貼凝皓教育最新課程、優惠及活動資訊。',
      limit: 6,
      link: { type: 'custom' as const, url: '/news', label: '查看更多', newTab: false },
    },
    {
      blockType: 'tutorShowcase' as const,
      heading: '本校名師',
      intro: '由經驗豐富的 DSE 名師團隊任教，緊貼考評重點，因材施教，全面提升學生成績。',
      tutors,
    },
    {
      blockType: 'subjectsCta' as const,
      heading: '報讀課程',
      description: '提供 DSE 各主要科目課程，點擊了解課程詳情及上課時間表。',
      subjects,
    },
  ],
}

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  overrideAccess: true,
})
const ctx = { disableRevalidate: true }
if (existing.docs.length) {
  await payload.update({
    collection: 'pages',
    id: existing.docs[0].id,
    data,
    overrideAccess: true,
    context: ctx,
  })
  console.log('✓ home page (updated)')
} else {
  await payload.create({ collection: 'pages', data, overrideAccess: true, context: ctx })
  console.log('✓ home page (created)')
}

console.log('seed-preview done')
process.exit(0)
