/**
 * Preview seed — populates just enough content (real DE nav + a simple home page)
 * to preview the brand styling. Demo data only; safe to delete.
 * Run: pnpm payload run scripts/seed-preview.ts
 */
import { getPayload } from 'payload'
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

const data = {
  title: '凝皓教育 Defining Education',
  slug: 'home',
  _status: 'published' as const,
  hero: {
    type: 'lowImpact' as const,
    richText: lex([
      heading('啟發潛能・培育人才'),
      para('凝皓教育 — 香港多分校補習學校，提供 DSE 各科名師課程。'),
    ]),
  },
  layout: [
    {
      blockType: 'content' as const,
      columns: [
        {
          size: 'full' as const,
          richText: lex([
            heading('精選課程', 'h2'),
            para('中文、英文、數學、經濟、化學、物理、生物等 DSE 科目，由本校名師任教。'),
          ]),
          enableLink: false,
        },
      ],
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
