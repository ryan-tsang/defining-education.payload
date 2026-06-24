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

// Wide brand-teal gradient for the hero background.
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#04312b"/>
      <stop offset="0.55" stop-color="#0f6e63"/>
      <stop offset="1" stop-color="#25d9c4"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="960" fill="url(#g)"/>
  <circle cx="1600" cy="220" r="340" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="320" cy="820" r="260" fill="#ffffff" fill-opacity="0.05"/>
  <circle cx="980" cy="540" r="180" fill="#fae549" fill-opacity="0.07"/>
</svg>`

// Generic avatar silhouette on a brand-tinted background.
const avatarSvg = (bg: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <circle cx="300" cy="232" r="96" fill="#ffffff" fill-opacity="0.92"/>
  <path d="M300 352 C188 352 108 436 108 566 L108 600 L492 600 L492 566 C492 436 412 352 300 352 Z" fill="#ffffff" fill-opacity="0.92"/>
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

// ── Media: brand placeholder hero + tutor avatars ──────────────────────────
const heroImage = await payload.create({
  collection: 'media',
  overrideAccess: true,
  data: { alt: '凝皓教育課堂環境（示範圖片）' },
  file: await svgToPng('hero-banner', heroSvg),
})
console.log('✓ hero image')

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
      blockType: 'heroBanner' as const,
      media: heroImage.id,
      richText: lex([
        heading('啟發潛能・成就未來'),
        para('凝皓教育 — 香港多分校補習學校，DSE 各科名師親自任教，助學生考取佳績。'),
      ]),
      links: [
        {
          link: {
            type: 'custom' as const,
            url: '/courses',
            label: '立即報讀課程',
            appearance: 'default' as const,
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom' as const,
            url: '/tutors',
            label: '認識本校名師',
            appearance: 'outline' as const,
            newTab: false,
          },
        },
      ],
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
