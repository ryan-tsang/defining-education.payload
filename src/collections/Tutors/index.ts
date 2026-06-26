import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateTutor } from './hooks/revalidateTutor'

export const Tutors: CollectionConfig<'tutors'> = {
  slug: 'tutors',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // Controls what's populated by default when a tutor is referenced (e.g. from
  // the Tutor Showcase block) — enough to render a card without a deep query.
  defaultPopulate: {
    name: true,
    nameEn: true,
    subject: true,
    slug: true,
    photo: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'nameEn', 'subject', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug as string, collection: 'tutors', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'tutors', req }),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Display name, e.g. 林溢欣' },
        },
        {
          name: 'nameEn',
          type: 'text',
          admin: { width: '50%', description: 'English name, e.g. YY Lam' },
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'Subject taught, e.g. 中文' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      label: 'Profile',
    },
    // `useAsSlug` must point at an always-present field. `name` is required;
    // `nameEn` is optional, and pointing the slug at it caused autosave/publish to
    // reset the slug to null whenever nameEn was blank (most English-named tutors).
    // The custom slugify still prefers the English name so Chinese-named tutors get
    // a stable Latin slug (e.g. 林溢欣 → "yy-lam"); a tutor with no Latin name at
    // all yields an empty slug the editor must fill in (default slugify drops
    // non-ASCII), instead of silently nulling a working slug.
    slugField({
      useAsSlug: 'name',
      slugify: ({ data, valueToSlugify }) => {
        const toSlug = (s: unknown) =>
          String(s || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        // Slugify the primary value (a manually-typed slug on create, otherwise the
        // `name`); fall back to the English name only when that yields nothing — i.e.
        // a Chinese display name (林溢欣 → "" → "yy-lam"). Never returns null, so an
        // existing slug is never wiped by autosave.
        return toSlug(valueToSlugify) || toSlug(data?.nameEn)
      },
    }),
  ],
  hooks: {
    afterChange: [revalidateTutor],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
