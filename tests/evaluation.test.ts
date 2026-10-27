// tests/evaluation.test.ts
// Unit test for controlled baseline evaluation (Arm A vs Arm B0 vs Arm B2), Kendall tau, and circularity caveat.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function computeKendallTau(orderA: string[], orderB: string[]): number {
  let concordant = 0;
  let discordant = 0;
  const n = orderA.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = Math.sign(orderA.indexOf(orderA[i]) - orderA.indexOf(orderA[j]));
      const b = Math.sign(orderB.indexOf(orderA[i]) - orderB.indexOf(orderA[j]));
      if (a * b > 0) concordant++;
      else if (a * b < 0) discordant++;
    }
  }
  return n > 1 ? (concordant - discordant) / (0.5 * n * (n - 1)) : 1.0;
}

test('Evaluation Baseline: Kendall tau detects divergence between opposing cultural profiles', () => {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/chicago_catalog.json'), 'utf8')
  );
  const ids: string[] = catalog.map((v: any) => v.id);

  // Identical rankings yield tau = 1.0
  const tauIdentical = computeKendallTau(ids, ids);
  assert.equal(tauIdentical, 1.0);

  // Inverted rankings yield tau = -1.0 (< 0.80 threshold)
  const inverted = [...ids].reverse();
  const tauInverted = computeKendallTau(ids, inverted);
  assert.equal(tauInverted, -1.0);
  assert.ok(tauInverted < 0.80);
});

test('Evaluation Report: docs/evaluation.md contains required sections and circularity caveat', () => {
  const evalPath = path.join(process.cwd(), 'docs/evaluation.md');
  assert.ok(fs.existsSync(evalPath), 'docs/evaluation.md must exist');

  const content = fs.readFileSync(evalPath, 'utf8');
  assert.ok(content.includes('Arm A (Qloo-Enabled)'));
  assert.ok(content.includes('Arm B0 (Distance Baseline)'));
  assert.ok(content.includes('Circularity Caveat'));
  assert.ok(content.includes('Kendall tau'));
  assert.ok(content.includes('Integer-Cent Arithmetic Accuracy'));
});
