import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, CheckboxGroup, CheckboxRow, Header, OptionCard, PageShell, RadioGroup } from '@/ui'
import type { PageTheme } from '@/ui'
import { ModalDemo } from './ModalDemo'
import { Cell, Section } from './Section'
import { StepTransitionDemo } from './StepTransitionDemo'
import styles from './gallery.module.css'

const THEMES: PageTheme[] = ['lilac', 'soft', 'dark', 'warm', 'white']
const PROGRESS_STEPS = [0, 0.2, 0.5, 0.95]
const FREQUENCY = ['Always', 'Often', 'Sometimes', 'Rarely']

// Demo glyph only (the option icon slot is empty in the funnel itself).
const DemoIcon = (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

function InteractiveRadioDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <Cell
      caption={`RadioGroup: arrows move focus, Enter or Space select. Selected: ${value ?? 'none'}`}
    >
      <RadioGroup aria-label="Frequency" value={value} onValueChange={setValue}>
        {FREQUENCY.map((option) => (
          <OptionCard key={option} value={option} label={option} />
        ))}
      </RadioGroup>
    </Cell>
  )
}

function InteractiveCheckboxDemo() {
  const labelId = useId()
  const [checked, setChecked] = useState<string[]>(['Nutrition'])
  const options = ['Sleep', 'Nutrition', 'Going a week without procrastinating']
  return (
    <Cell caption="Interactive: click or press Space">
      <p id={labelId} className={styles.caption}>
        Choose all that apply
      </p>
      <CheckboxGroup aria-labelledby={labelId}>
        {options.map((option) => (
          <CheckboxRow
            key={option}
            label={option}
            checked={checked.includes(option)}
            onCheckedChange={(next) =>
              setChecked((current) =>
                next ? [...current, option] : current.filter((item) => item !== option),
              )
            }
          />
        ))}
      </CheckboxGroup>
    </Cell>
  )
}

/** Every component in every state. Dev and QA tooling: only registered in dev builds. */
export function Gallery() {
  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Bloom UI gallery</h1>
      <p className={styles.note}>
        Dev and QA tooling, not part of the funnel or of production builds. Layout twins of the
        reference screens: <Link to="quiz-single">quiz-single</Link> (image 03) and{' '}
        <Link to="quiz-multi">quiz-multi</Link> (image 06).
      </p>

      <Section title="Themes" note="PageShell backgrounds">
        <div className={styles.row}>
          {THEMES.map((theme) => (
            <Cell key={theme} caption={theme} width="auto">
              <PageShell theme={theme} className={styles.swatch} style={{ minHeight: 96 }} />
            </Cell>
          ))}
        </div>
      </Section>

      <Section
        title="Header"
        note="Logo at +42, progress bar at +75, 333 x 3. Values 0, 20, 50, 95 percent."
      >
        <div className={styles.row}>
          {PROGRESS_STEPS.map((value) => (
            <Cell key={value} caption={`${Math.round(value * 100)}%`} width="auto">
              <div className={styles.headerFrame}>
                <Header progress={value} />
              </div>
            </Cell>
          ))}
        </div>
      </Section>

      <Section title="Button" note="data-state=hover forces the hover look (stretched arrow).">
        <div className={styles.row}>
          <Cell caption="primary">
            <Button>Continue</Button>
          </Cell>
          <Cell caption="primary, hover (forced)">
            <Button data-state="hover">Continue</Button>
          </Cell>
          <Cell caption="primary, no arrow">
            <Button arrow={false}>Continue</Button>
          </Cell>
          <Cell caption="disabled">
            <Button variant="disabled">Continue</Button>
          </Cell>
          <Cell caption="loading">
            <Button variant="loading">Continue</Button>
          </Cell>
          <Cell caption="interstitial size">
            <Button size="interstitial">Continue</Button>
          </Cell>
          <Cell caption="white (wand finish)" width={389}>
            <div className={styles.darkBackdrop}>
              <Button variant="white">Continue</Button>
            </div>
          </Cell>
        </div>
      </Section>

      <Section title="OptionCard" note="333 x 72, label bottom-left through --option-label-align.">
        <div className={styles.row}>
          <Cell caption="rest">
            <OptionCard value="rest" label="Sometimes" />
          </Cell>
          <Cell caption="hover (forced)">
            <OptionCard value="hover" label="Sometimes" data-state="hover" />
          </Cell>
          <Cell caption="pressed (forced)">
            <OptionCard value="pressed" label="Sometimes" data-state="pressed" />
          </Cell>
          <Cell caption="selected">
            <OptionCard value="selected" label="Sometimes" selected />
          </Cell>
          <Cell caption="with icon slot">
            <OptionCard value="icon" label="Sometimes" icon={DemoIcon} />
          </Cell>
          <Cell caption="long label">
            <OptionCard value="long" label="Sometimes, I drop it for a while" />
          </Cell>
          <InteractiveRadioDemo />
        </div>
      </Section>

      <Section title="CheckboxRow" note="325 x 56; two-line labels grow the row.">
        <div className={styles.row}>
          <Cell caption="unchecked">
            <CheckboxRow label="Nutrition" checked={false} />
          </Cell>
          <Cell caption="checked">
            <CheckboxRow label="Nutrition" checked />
          </Cell>
          <Cell caption="pressed (forced)">
            <CheckboxRow label="Nutrition" checked={false} data-state="pressed" />
          </Cell>
          <Cell caption="two-line label">
            <CheckboxRow label="Going a week without procrastinating" checked={false} />
          </Cell>
          <Cell caption="two-line label, checked">
            <CheckboxRow label="Feeling calmer in stressful situations" checked />
          </Cell>
          <Cell caption="disabled">
            <CheckboxRow label="Nutrition" checked={false} disabled />
          </Cell>
          <InteractiveCheckboxDemo />
        </div>
      </Section>

      <Section title="Modal" note="Focus trap, ESC, backdrop click, scroll lock, focus return.">
        <ModalDemo />
      </Section>

      <Section title="StepTransition" note="Out 400 ms, gap 150 ms, in 300 ms.">
        <StepTransitionDemo />
      </Section>
    </main>
  )
}
