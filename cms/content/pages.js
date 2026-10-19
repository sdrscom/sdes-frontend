// Which editable sections and image slots belong to each page of the site.
// `sections` keys are top-level keys of src/locales/translations.ts.
// `media` slots are images/videos the site reads via useMedia(key, fallback);
// `preview` is the default asset path on the frontend (for the thumbnail only).

export const PAGES = [
  {
    slug: 'home',
    title: 'Home',
    path: '/',
    sections: [
      { key: 'hero', label: 'Hero banner' },
      { key: 'primeLocation', label: 'Prime location' },
      { key: 'taxBenefits', label: 'Cost & tax benefits' },
      { key: 'fasterClearance', label: 'Faster clearance' },
      { key: 'streamlinedOperations', label: 'Streamlined operations' },
      { key: 'appointment', label: 'Book an appointment (popup form)' },
    ],
    media: [
      { key: 'home.heroImage', label: 'Hero background image', preview: '/hero-bg2.jpg' },
      { key: 'home.heroVideo', label: 'Hero background video (plays instead of the image)', type: 'video' },
      { key: 'home.primeLocationImage', label: 'Prime location image', preview: '/src/assets/Picture3.png' },
      { key: 'home.operations.payment', label: 'Operations: payment', preview: '/src/assets/Streamlined/Payment.jpg' },
      { key: 'home.operations.credit', label: 'Operations: credit', preview: '/src/assets/Streamlined/Credit.jpg' },
      { key: 'home.operations.government', label: 'Operations: e-government', preview: '/src/assets/Streamlined/Government.jpg' },
      { key: 'home.operations.realTime', label: 'Operations: real-time tracking', preview: '/src/assets/Streamlined/RealTime.jpg' },
    ],
  },
  {
    slug: 'about',
    title: 'About Us',
    path: '/about',
    sections: [
      { key: 'aboutHero', label: 'Hero, mission & vision' },
      { key: 'aboutSections', label: 'CEO message & leadership team' },
      { key: 'sdesStoryline', label: 'Timeline (The SDES Story)' },
    ],
    media: [
      { key: 'about.heroImage', label: 'Hero background image', preview: '/src/assets/aboutHero.jpg' },
      { key: 'about.ceoPhoto', label: 'CEO photo', preview: '/ceo.jpg' },
      ...[2005, 2009, 2010, 2013, 2015, 2022, 2025].map((year, i) => ({
        key: `about.timeline.${i}`,
        label: `Timeline image #${i + 1} (${year})`,
        preview: `/src/assets/Location/${year}.png`,
      })),
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    path: '/services',
    sections: [
      { key: 'servicesHero', label: 'Hero' },
      { key: 'servicesSection', label: 'Service list' },
    ],
    media: [
      { key: 'services.heroImage', label: 'Hero background image' },
      { key: 'services.container', label: 'Container services', preview: '/src/assets/img7.jpg' },
      { key: 'services.general', label: 'General cargo', preview: '/src/assets/cargo steel.jpg' },
      { key: 'services.vehicle', label: 'Vehicles', preview: '/src/assets/statsBg.jpg' },
      { key: 'services.freight', label: 'Freight', preview: '/src/assets/background3.jpg' },
      { key: 'services.trade', label: 'Trade', preview: '/src/assets/img3.jpg' },
      { key: 'services.labour', label: 'Labour', preview: '/src/assets/File249.jpg' },
    ],
  },
  {
    slug: 'facilities',
    title: 'Facilities',
    path: '/facilities',
    sections: [
      { key: 'facilities', label: 'Facilities overview' },
      { key: 'preBuiltWarehouses', label: 'Pre-built warehouses' },
      { key: 'builtToSuit', label: 'Built-to-suit warehouses' },
    ],
    media: [{ key: 'facilities.heroImage', label: 'Hero background image' }],
  },
  {
    slug: 'investment',
    title: 'Investment',
    path: '/investment',
    sections: [
      { key: 'investment', label: 'Hero' },
      { key: 'whySaudi', label: 'Why Saudi Arabia' },
      { key: 'sdesBondedZone', label: 'SDES bonded zone' },
      { key: 'investorAdvantages', label: 'Investor advantages' },
    ],
    // Hero slideshow; empty slots are skipped. Count matches HERO_SLIDES in InvestmentHero.tsx.
    media: [0, 1, 2, 3].map((i) => ({
      key: `investment.heroImage.${i}`,
      label: `Hero slideshow image #${i + 1}`,
    })),
  },
  {
    slug: 'location',
    title: 'Location',
    path: '/location',
    sections: [
      { key: 'locationHero', label: 'Hero' },
      { key: 'locationDetails', label: 'Location details' },
      { key: 'strategicConnectivity', label: 'Strategic connectivity' },
    ],
    media: [{ key: 'location.heroImage', label: 'Hero background image' }],
  },
  { slug: 'faq', title: 'FAQs', path: '/faqs', sections: [{ key: 'faq', label: 'Questions & answers' }] },
  {
    slug: 'news',
    title: 'News (page text)',
    path: '/news',
    sections: [
      { key: 'newsPage', label: 'News list page' },
      { key: 'newsDetailPage', label: 'Article page' },
    ],
  },
  { slug: 'gallery', title: 'Gallery (page text)', path: '/gallery', sections: [{ key: 'galleryPage', label: 'Gallery page' }] },
  { slug: 'careers', title: 'Careers (page text)', path: '/careers', sections: [{ key: 'careerPage', label: 'Careers page' }] },
  {
    slug: 'global',
    title: 'Header & Footer',
    path: '/',
    sections: [
      { key: 'navbar', label: 'Header / navigation' },
      { key: 'footer', label: 'Footer' },
    ],
    media: [
      { key: 'global.headerLogo', label: 'Header logo', preview: '/src/assets/Logo-1.png' },
      { key: 'global.footerLogo', label: 'Footer logo', preview: '/Footer-logo.png' },
    ],
  },
];

// Blank item shapes for lists that ship empty, so "Add item" knows the fields.
export const ITEM_TEMPLATES = {
  'sdesStoryline.events': { year: '', title: '', description: '', warehouses: '', teus: '', image: '' },
  'facilities.storageItems': { name: '', area: '', image: '' },
  'facilities.operationsItems': { name: '', area: '', image: '' },
};

export function findPage(slug) {
  return PAGES.find((p) => p.slug === slug);
}

export function pageForSection(sectionKey) {
  return PAGES.find((p) => p.sections.some((s) => s.key === sectionKey));
}
