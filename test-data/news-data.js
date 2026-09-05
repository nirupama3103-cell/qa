// test-data/news-data.js
export const newsTestData = {
  pageUrl: 'https://test-saayam.netlify.app/about-us/in-the-news',
  homeUrl: 'https://test-saayam.netlify.app/',

  pageContent: {
    heading: 'News: Our Stories',
    breadcrumbCurrent: 'In The News',
    description: 'Explore how Saayam for All is making headlines and gaining recognition for its work in uplifting communities, empowering volunteers, and building an inclusive support network',
    ctaHeading: 'Want to join us?',
    ctaButton: 'Join Our Community',
  },

  breadcrumbItems: ['Home', 'About Us', 'In The News'],

  cardHeadings: [
    'We Won a Walmart Spark Good Grant',
    'In Step with the Community: A 17-Mile Walk in San Ramon',
  ],

  expectedMinCards: 11,

  placeholderText: ['undefined', 'null', 'NaN', '[object Object]', 'Lorem ipsum'],

  disallowedEmoji: ['🎉', '💻', '✨'],

  selectors: {
    recaptchaBadge: '.grecaptcha-badge',
    scrollTopButton: "[class*='scroll-top'], [class*='back-to-top'], button[aria-label*='top' i]",
  },

  navigationUrls: {
    news: /.*in-the-news.*/,
  },

  mobileViewport: { width: 393, height: 851 },
};
