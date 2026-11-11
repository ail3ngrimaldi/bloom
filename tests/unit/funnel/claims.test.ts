import { describe, expect, it } from 'vitest'
import { CLAIMS } from '@/funnel/claims'

/**
 * The inventory of PLAN-B 3.3 (claims C1 to C8): every claim exists, is not empty and has the text
 * of the reference with the product's name in place of the reference's. Guardrails 2 and 3.
 */
describe('claims registry (PLAN-B 3.3)', () => {
  it('C1 users: the figure of #17 and #26', () => {
    expect(CLAIMS.users.value).toBe('30 million')
  })

  it('C2 press: five outlets on the quiz and five on the plan sheet', () => {
    expect(CLAIMS.press.quiz).toEqual([
      'The New York Times',
      'WIRED',
      'Forbes',
      'girlboss',
      'healthline',
    ])
    expect(CLAIMS.press.sheet).toEqual([
      'The New York Times',
      'girlboss',
      'Forbes',
      'healthline',
      'SELF',
    ])
  })

  it('C3 universities: Stanford, Duke and Harvard', () => {
    expect(CLAIMS.universities.map((university) => [university.name, university.caption])).toEqual([
      ['STANFORD', 'UNIVERSITY'],
      ['DUKE', 'UNIVERSITY'],
      ['HARVARD', 'UNIVERSITY'],
    ])
  })

  it('C4 expert: the reviewer of the quiz and of the plan sheet', () => {
    expect(CLAIMS.expert.quiz).toEqual({
      name: 'Jazmin Quill, MSc',
      role: 'Co-founder, Stanford Psych One Program',
    })
    expect(CLAIMS.expert.sheet.name).toBe('Jazmin Quill, MA, MSc')
    expect(CLAIMS.expert.sheet.role).toBe('Co-founder, Stanford Psychology One Program')
    expect(CLAIMS.expert.sheet.quote).toMatch(/^"Imagine having someone in your corner/)
  })

  it('C5 awards: three, with their source', () => {
    expect(CLAIMS.awards.map((award) => [award.title, award.source])).toEqual([
      ['Best App Finalist', 'Google Play Awards'],
      ['Best Self-Care App 2018', 'App Store'],
      ['Design Award Winner', 'Google Material'],
    ])
  })

  it('C6 testimonials: the three of the loader (guardrail 3)', () => {
    expect(
      CLAIMS.testimonials.map((testimonial) => [testimonial.author, testimonial.stars]),
    ).toEqual([
      ['Alice L.', 5],
      ['Tara M.', 5],
      ['Remi L.', 5],
    ])
    expect(CLAIMS.testimonials[0].title).toBe('This app is truly amazing!')
    expect(CLAIMS.testimonials[1].title).toBe('This app literally changed my life')
    expect(CLAIMS.testimonials[2].title).toBe(
      '{{brand}} is an absolute amazing tool to have & apply in your life!',
    )
    expect(CLAIMS.testimonials[2].body).toMatch(
      /^I've been using \{\{brand\}\} for at least 5 years\./,
    )
  })

  it('C7 reviews: the two of the plan sheet, with the text of the reference', () => {
    expect(CLAIMS.reviews.map((review) => review.author)).toEqual(['Sabine Rush', 'Chey Here'])
    expect(CLAIMS.reviews[0].text).toMatch(/Thank you Clarify ADHD!! YOU ROCK!"$/)
    expect(CLAIMS.reviews[1].text).toMatch(/Thank you so much\. Highly recommended\."$/)
  })

  it('C8 companyCost: what the trial costs the company', () => {
    expect(CLAIMS.companyCost).toBe(16.41)
  })

  it('has no empty text anywhere', () => {
    const texts: string[] = []
    const collect = (node: unknown) => {
      if (typeof node === 'string') texts.push(node)
      else if (node && typeof node === 'object')
        for (const value of Object.values(node)) collect(value)
    }
    collect(CLAIMS)
    expect(texts.length).toBeGreaterThan(30)
    for (const text of texts) expect(text.trim().length, text).toBeGreaterThan(0)
  })

  it('names the reference product nowhere (guardrail 1)', () => {
    expect(JSON.stringify(CLAIMS)).not.toMatch(/fabulous/i)
  })
})
