// The starter's sample business (Meridian): what replaces it when it is hidden or deleted.
// Used by the editor's Hide / Delete sample content buttons (through `sampleContent` in
// src/sections/index.ts) and by `npm run start-fresh`. No imports, so Node can run it directly.
//
// What counts as sample content is marked in the files themselves: `"sample": true` in a page's
// JSON, `sample: true` in an article's or event's front matter. Saving one from the editor drops
// the mark, so anything someone has edited is theirs and is left alone.

export const sampleLabel = 'Meridian, the sample architecture studio';

/** The home page that takes the sample one's place. */
export function sampleHome(siteName: string) {
  return {
    title: 'Home',
    sections: [
      {
        id: 'home-hero', type: 'hero',
        settings: { title: siteName, text: '<p>One or two sentences that say what you do and who it is for.</p>', layout: 'minimal', image: { src: '', alt: '' } },
        blocks: [{ id: 'home-btn', type: 'button', settings: { label: 'Get in touch', href: '/#contact', style: 'solid' } }],
      },
    ],
  };
}

/** Site settings reset with the samples: the announcement advertised a sample event. */
export const sampleGlobals = { site: { announcement: '' } };
