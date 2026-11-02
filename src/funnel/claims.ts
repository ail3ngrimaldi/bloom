/**
 * Claims, credentials, testimonials and reviews the funnel shows (guardrails 2 and 3 of
 * PLAN-B 2). This is the one place that holds their content, so they can be edited, replaced by
 * Bloom's own figures or removed without touching a screen. Nothing is gated: every screen that
 * has a claim renders it. The wording is the reference's with `{{brand}}` in place of its product
 * name; the logos, wordmarks and photos are not copied (guardrail 6): the screens draw their own.
 *
 * TODO(content): these describe the product of the reference, not Bloom. Review them with legal
 * advice before real payments are turned on (PLAN-B 2.4).
 */

export interface University {
  readonly name: string
  readonly caption: string
}

export interface Award {
  readonly title: string
  readonly source: string
}

export interface Testimonial {
  readonly stars: number
  readonly title: string
  readonly author: string
  readonly body: string
}

export interface Review {
  readonly stars: number
  readonly author: string
  readonly text: string
}

export interface Reviewer {
  readonly name: string
  readonly role: string
}

export const CLAIMS = {
  /** C1: the user count of #17 and #26 (`{{claims.users}}`). */
  users: { value: '30 million' },

  /** C2: the press outlets, as the quiz (#17) and the plan sheet list them. */
  press: {
    quiz: ['The New York Times', 'WIRED', 'Forbes', 'girlboss', 'healthline'],
    sheet: ['The New York Times', 'girlboss', 'Forbes', 'healthline', 'SELF'],
  },

  /** C3: the three universities of #30. */
  universities: [
    { name: 'STANFORD', caption: 'UNIVERSITY' },
    { name: 'DUKE', caption: 'UNIVERSITY' },
    { name: 'HARVARD', caption: 'UNIVERSITY' },
  ] satisfies readonly University[],

  /** C4: the reviewing expert of #31 and of the plan sheet. */
  expert: {
    quiz: {
      name: 'Jazmin Quill, MSc',
      role: 'Co-founder, Stanford Psych One Program',
    } satisfies Reviewer,
    sheet: {
      name: 'Jazmin Quill, MA, MSc',
      role: 'Co-founder, Stanford Psychology One Program',
      quote:
        '"Imagine having someone in your corner, someone who truly believes in you. I\'ve seen our coaches dismantle unseen barriers and unlock innate powers long waiting to emerge."',
    } satisfies Reviewer & { quote: string },
  },

  /** C5: the awards of the plan sheet. */
  awards: [
    { title: 'Best App Finalist', source: 'Google Play Awards' },
    { title: 'Best Self-Care App 2018', source: 'App Store' },
    { title: 'Design Award Winner', source: 'Google Material' },
  ] satisfies readonly Award[],

  /** C6: the three testimonials under the bars of the plan loader (#37). */
  testimonials: [
    {
      stars: 5,
      title: 'This app is truly amazing!',
      author: 'Alice L.',
      body: "I love it because it keeps me very motivated and focused on the goals I've set for myself to achieve. It makes me accountable and forces me to be consistent \u{1F499}.",
    },
    {
      stars: 5,
      title: 'This app literally changed my life',
      author: 'Tara M.',
      body: 'I had found myself at the deep end. You pulled me out, I am sincerely grateful.',
    },
    {
      stars: 5,
      title: '{{brand}} is an absolute amazing tool to have & apply in your life!',
      author: 'Remi L.',
      body: "I've been using {{brand}} for at least 5 years. It just gets better and better. I love this app and whenever I'm lost this is always where I come back to.",
    },
  ] satisfies readonly Testimonial[],

  /** C7: the two member reviews of the plan sheet. */
  reviews: [
    {
      stars: 5,
      author: 'Sabine Rush',
      text: '"Being diagnosed with ADHD as an adult has been a shock but a blessing. A blessing because now I can get control of my life. I\'m 45 and I have felt out of control my entire life. I tried everything but now, thanks to a good doctor and program like this I\'m getting my life in order and looking forward to living for real for the first time. Thank you Clarify ADHD!! YOU ROCK!"',
    },
    {
      stars: 5,
      author: 'Chey Here',
      text: '"This app is absolutely life changing! I feel so grateful to have found it and I have no regrets in paying for it. It\'s like having a life coach that is gentle and kind but incredibly wise. I\'ve surrendered to this process and have started to change on the inside. I feel more peace, gratitude and hope for my future by learning how to break things down into smaller steps and celebrate each small progress. Thank you so much. Highly recommended."',
    },
  ] satisfies readonly Review[],

  /** C8: what the trial costs the company, shown on "Pay what you want" (USD). */
  companyCost: 16.41,
} as const
