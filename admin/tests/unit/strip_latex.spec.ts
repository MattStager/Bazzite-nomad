import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  stripLatex,
  stripHedgeCloser,
  truncateAtNonLatin,
  cleanChatOutput,
} from '../../shared/strip_latex.js'

// ---------- stripLatex ----------

test('stripLatex: empty input passes through', () => {
  assert.equal(stripLatex(''), '')
})

test('stripLatex: text without LaTeX is unchanged', () => {
  const input = 'Use 2 AWG for less than 3% voltage drop over 50 feet.'
  assert.equal(stripLatex(input), input)
})

test('stripLatex: display math delimiters \\[ ... \\] are stripped, inner expression kept', () => {
  assert.equal(stripLatex('\\[ V = I R \\]'), 'V = I R')
})

test('stripLatex: inline math delimiters \\( ... \\) are stripped', () => {
  assert.equal(stripLatex('voltage is \\(V = IR\\) here'), 'voltage is V = IR here')
})

test('stripLatex: $$ ... $$ delimiters are stripped', () => {
  assert.equal(stripLatex('$$ x^2 + y^2 $$'), ' x^2 + y^2 ')
})

test('stripLatex: \\text{X} unwraps to plain text', () => {
  assert.equal(stripLatex('answer is \\text{40 gallons}'), 'answer is 40 gallons')
})

test('stripLatex: \\mathrm{X} unwraps to plain text', () => {
  assert.equal(stripLatex('10 \\mathrm{kg}'), '10 kg')
})

test('stripLatex: common binary operators map to unicode glyphs', () => {
  assert.equal(stripLatex('5 \\times 3'), '5 × 3')
  assert.equal(stripLatex('10 \\div 2'), '10 ÷ 2')
  assert.equal(stripLatex('a \\cdot b'), 'a · b')
  assert.equal(stripLatex('5 \\pm 1'), '5 ± 1')
  assert.equal(stripLatex('x \\approx 3'), 'x ≈ 3')
  assert.equal(stripLatex('x \\leq 5'), 'x ≤ 5')
  assert.equal(stripLatex('y \\geq 0'), 'y ≥ 0')
  assert.equal(stripLatex('a \\neq b'), 'a ≠ b')
})

test('stripLatex: \\frac{a}{b} becomes (a)/(b)', () => {
  assert.equal(stripLatex('\\frac{1}{2}'), '(1)/(2)')
  assert.equal(stripLatex('\\frac{V}{R}'), '(V)/(R)')
})

test('stripLatex: \\sqrt{x} becomes sqrt(x)', () => {
  assert.equal(stripLatex('\\sqrt{2}'), 'sqrt(2)')
})

test('stripLatex: braced subscript and superscript drop the braces', () => {
  assert.equal(stripLatex('x_{1}'), 'x_1')
  assert.equal(stripLatex('x^{2}'), 'x^2')
  assert.equal(stripLatex('a_{ij}^{2n}'), 'a_ij^2n')
})

test('stripLatex: spacing macros collapse to a single space', () => {
  assert.equal(stripLatex('1\\,000'), '1 000')
  assert.equal(stripLatex('1\\;000'), '1 000')
  assert.equal(stripLatex('a\\quad b'), 'a b')
  assert.equal(stripLatex('a\\qquad b'), 'a b')
})

test('stripLatex: escaped special characters unwrap to the literal character', () => {
  assert.equal(stripLatex('50\\%'), '50%')
  assert.equal(stripLatex('\\$10'), '$10')
  assert.equal(stripLatex('A\\&B'), 'A&B')
  assert.equal(stripLatex('foo\\_bar'), 'foo_bar')
  assert.equal(stripLatex('\\#tag'), '#tag')
})

test('stripLatex: double spaces introduced by replacements are collapsed', () => {
  assert.equal(stripLatex('a  \\text{}b'), 'a b')
})

test('stripLatex: realistic mixed input', () => {
  const input = 'For \\(V = IR\\), at \\text{12V} and \\frac{30}{2} A, use \\sqrt{4} \\times 2 AWG.'
  const expected = 'For V = IR, at 12V and (30)/(2) A, use sqrt(4) × 2 AWG.'
  assert.equal(stripLatex(input), expected)
})

test('stripLatex: idempotent on already-clean output', () => {
  const once = stripLatex('\\text{hello} \\times \\text{world}')
  assert.equal(stripLatex(once), once)
})

// ---------- stripHedgeCloser ----------

test('stripHedgeCloser: empty input passes through', () => {
  assert.equal(stripHedgeCloser(''), '')
})

test('stripHedgeCloser: single paragraph is never stripped (never leave empty)', () => {
  const input = 'Always consult a licensed electrician before doing this.'
  assert.equal(stripHedgeCloser(input), input)
})

test('stripHedgeCloser: trailing "consult a professional" paragraph is removed', () => {
  const input = [
    'Use 2 AWG for the 30A run.',
    'Fuse the wire, not the load.',
    'Always consult a licensed electrician before energizing.',
  ].join('\n\n')
  assert.equal(
    stripHedgeCloser(input),
    'Use 2 AWG for the 30A run.\n\nFuse the wire, not the load.'
  )
})

test('stripHedgeCloser: trailing paragraph starting with "Always" is removed', () => {
  const input = 'Do the thing.\n\nAlways check local codes before proceeding.'
  assert.equal(stripHedgeCloser(input), 'Do the thing.')
})

test('stripHedgeCloser: trailing "Note:" / "Important:" hedge starter is removed', () => {
  assert.equal(stripHedgeCloser('Body.\n\nNote: always be careful.'), 'Body.')
  assert.equal(stripHedgeCloser('Body.\n\nImportant: consult a doctor.'), 'Body.')
})

test('stripHedgeCloser: substantive last paragraph is kept', () => {
  const input = 'First step is X.\n\nSecond step is Y, and that completes the install.'
  assert.equal(stripHedgeCloser(input), input)
})

test('stripHedgeCloser: long hedge-shaped paragraph (>400 chars) is kept (likely real content)', () => {
  const long = 'Always ' + 'x'.repeat(420)
  const input = `Body.\n\n${long}`
  assert.equal(stripHedgeCloser(input), input)
})

test('stripHedgeCloser: idempotent', () => {
  const input = 'Body.\n\nAlways consult a professional before doing this.'
  const once = stripHedgeCloser(input)
  assert.equal(stripHedgeCloser(once), once)
})

test('stripHedgeCloser: only the last paragraph is stripped, not earlier ones', () => {
  const input = [
    'Always wear PPE when working with this.',
    'Step 1: turn off the breaker.',
    'Consult a licensed electrician for permits.',
  ].join('\n\n')
  assert.equal(
    stripHedgeCloser(input),
    'Always wear PPE when working with this.\n\nStep 1: turn off the breaker.'
  )
})

// ---------- truncateAtNonLatin ----------

test('truncateAtNonLatin: empty input passes through', () => {
  assert.equal(truncateAtNonLatin(''), '')
})

test('truncateAtNonLatin: pure English text is unchanged', () => {
  const input = 'Use 2 AWG for less than 3% voltage drop.'
  assert.equal(truncateAtNonLatin(input), input)
})

test('truncateAtNonLatin: Latin-1 supplement (accents) is preserved', () => {
  const input = 'Café résumé naïve piñata.'
  assert.equal(truncateAtNonLatin(input), input)
})

test('truncateAtNonLatin: CJK leak truncates at the prior sentence boundary', () => {
  const input = 'Use 2 AWG for the run. Fuse the wire properly. 这是中文'
  assert.equal(truncateAtNonLatin(input), 'Use 2 AWG for the run. Fuse the wire properly.')
})

test('truncateAtNonLatin: Cyrillic leak is also caught', () => {
  const input = 'The answer is 42. Привет мир'
  assert.equal(truncateAtNonLatin(input), 'The answer is 42.')
})

test('truncateAtNonLatin: Hiragana / Katakana / Hangul leaks are caught', () => {
  assert.equal(truncateAtNonLatin('Step 1. これは'), 'Step 1.')
  assert.equal(truncateAtNonLatin('Step 1. カタカナ'), 'Step 1.')
  assert.equal(truncateAtNonLatin('Step 1. 한글'), 'Step 1.')
})

test('truncateAtNonLatin: Arabic / Hebrew leaks are caught', () => {
  assert.equal(truncateAtNonLatin('Step 1. مرحبا'), 'Step 1.')
  assert.equal(truncateAtNonLatin('Step 1. שלום'), 'Step 1.')
})

test('truncateAtNonLatin: no sentence boundary falls back to truncating at first non-Latin char', () => {
  assert.equal(truncateAtNonLatin('hello world 中文'), 'hello world')
})

test('truncateAtNonLatin: leak at the very start returns empty string', () => {
  assert.equal(truncateAtNonLatin('中文 hello'), '')
})

// ---------- cleanChatOutput ----------

test('cleanChatOutput: empty input passes through', () => {
  assert.equal(cleanChatOutput(''), '')
})

test('cleanChatOutput: clean English text is unchanged', () => {
  const input = 'Use 2 AWG for the 30A run. Fuse the wire, not the load.'
  assert.equal(cleanChatOutput(input), input)
})

test('cleanChatOutput: LaTeX is stripped first, then hedge', () => {
  const input = [
    'Use \\text{2 AWG} for the run.',
    'Always consult a licensed electrician before doing this.',
  ].join('\n\n')
  assert.equal(cleanChatOutput(input), 'Use 2 AWG for the run.')
})

test('cleanChatOutput: non-Latin leak is truncated, then any remaining hedge is dropped', () => {
  const input = [
    'Step 1: turn off the breaker.',
    'Step 2: 这是中文 leak text.',
    'Always consult a professional.',
  ].join('\n\n')
  // Non-Latin truncation cuts at the period after "breaker", which removes
  // both subsequent paragraphs in one pass.
  assert.equal(cleanChatOutput(input), 'Step 1: turn off the breaker.')
})

test('cleanChatOutput: idempotent', () => {
  const input = [
    'Use \\text{2 AWG} for the run.',
    'Always consult a licensed electrician.',
  ].join('\n\n')
  const once = cleanChatOutput(input)
  assert.equal(cleanChatOutput(once), once)
})
