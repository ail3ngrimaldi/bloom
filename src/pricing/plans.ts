import type { Plan, PlanConfig, PlanId } from './types'

/**
 * The three plans of the reference (PLAN 5.10), as demo data (decision D4): the paywall labels
 * them as such, and nothing can be charged. TODO(content): real prices, currency and the price
 * history behind the struck-through amounts (guardrail 5).
 */
export const DEMO_PLANS: readonly PlanConfig[] = [
  {
    id: 'trial_1w',
    days: 7,
    price: 5.19,
    originalPrice: 39.99,
    comparisonDays: 30,
    renewal: 'month',
    showSavings: false,
  },
  {
    id: 'month_1',
    days: 30,
    price: 8.99,
    originalPrice: 39.99,
    comparisonDays: 30,
    renewal: 'month',
    showSavings: true,
    mostPopular: true,
    default: true,
  },
  {
    id: 'month_3',
    days: 90,
    price: 16.99,
    originalPrice: 59.99,
    comparisonDays: 90,
    renewal: 'three_months',
    showSavings: true,
  },
]

export const CURRENCY = 'USD'

/** Cents-exact rounding for display. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * perDay = price / days; perDayOriginal = originalPrice / comparisonDays; savings = 1 - price /
 * originalPrice, rounded. Without the discount, the first period costs the original price.
 */
export function computePlan(config: PlanConfig, discounted = true): Plan {
  const price = discounted ? config.price : config.originalPrice
  return {
    ...config,
    price,
    discounted,
    perDay: roundMoney(price / config.days),
    perDayOriginal: roundMoney(config.originalPrice / config.comparisonDays),
    savingsPercent: Math.round((1 - config.price / config.originalPrice) * 100),
  }
}

export function plansFor(discounted = true, configs: readonly PlanConfig[] = DEMO_PLANS): Plan[] {
  return configs.map((config) => computePlan(config, discounted))
}

export function defaultPlanId(configs: readonly PlanConfig[] = DEMO_PLANS): PlanId {
  return (configs.find((plan) => plan.default) ?? configs[0]).id
}

/** The plan to show as chosen: the stored one if it still exists, else the default. */
export function selectedPlan(plans: readonly Plan[], stored: PlanId | null): Plan {
  return plans.find((plan) => plan.id === stored) ?? plans.find((plan) => plan.default) ?? plans[0]
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY })

export function formatMoney(value: number): string {
  return money.format(value)
}

/** "$0.30" split for the big per-day display: symbol, whole part and ".30". */
export function splitMoney(value: number): { symbol: string; whole: string; fraction: string } {
  const parts = money.formatToParts(value)
  const symbol = parts.find((part) => part.type === 'currency')?.value ?? '$'
  const whole = parts
    .filter((part) => part.type === 'integer' || part.type === 'group')
    .map((part) => part.value)
    .join('')
  const fraction = parts.find((part) => part.type === 'fraction')?.value ?? '00'
  return { symbol, whole, fraction: `.${fraction}` }
}
