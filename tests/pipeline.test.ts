import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM helper without type declarations
import { cumulative, nameKey, pointLineDistance, simplify, slugify, tokenSimilarity } from '../scripts/lib.mjs';
import { parseHash, buildHash } from '../src/lib/router';

describe('name matching', () => {
  it('drops generic words but keeps distinguishing ones', () => {
    expect(nameKey('Nagan Chowrangi')).toBe(nameKey('Nagan'));
    expect(nameKey('Malir Halt Bus Stop')).toBe('malir halt');
    expect(nameKey('Model Colony')).not.toBe(nameKey('Model Town'));
    expect(nameKey('Gulshan-e-Iqbal')).toBe('gulshan iqbal');
  });

  it('keeps Islamabad sector codes together', () => {
    expect(nameKey('G-9 Markaz')).toBe('g9 markaz');
    expect(nameKey('I 8')).toBe('i8');
  });

  it('never returns an empty key for a real name', () => {
    expect(nameKey('Station')).toBe('station');
    expect(nameKey('Chowk')).toBe('chowk');
  });

  it('normalises common spelling variants', () => {
    expect(nameKey('Shahra-e-Faisal')).toBe(nameKey('Shahrah e Faisal'));
    expect(nameKey('Khokrapar')).toBe(nameKey('Khokhrapar'));
  });

  it('token similarity', () => {
    expect(tokenSimilarity('malir halt', 'malir halt')).toBe(1);
    expect(tokenSimilarity('malir halt', 'malir cantt')).toBe(0.5);
  });

  it('slugify', () => {
    expect(slugify('I.I. Chundrigar Road')).toBe('i-i-chundrigar-road');
    expect(slugify('ملیر')).toBe('stop');
  });
});

describe('geometry helpers', () => {
  const line: [number, number][] = [[24.9, 67.0], [24.9, 67.01], [24.9, 67.02]];
  it('distance from a point to a line and position along it', () => {
    const d = pointLineDistance([24.901, 67.015], line, cumulative(line));
    expect(d.metres).toBeGreaterThan(100);
    expect(d.metres).toBeLessThan(120);
    expect(d.along).toBeGreaterThan(1400);
    expect(d.along).toBeLessThan(1600);
  });
  it('simplify removes collinear points', () => {
    expect(simplify(line, 1)).toHaveLength(2);
  });
});

describe('hash router', () => {
  it('round-trips plan locations', () => {
    const loc = parseHash('#/karachi/plan?from=24.90000,67.10000,Home&to=24.85000,67.00000,Saddar%20Market');
    expect(loc.city).toBe('karachi');
    expect(loc.tab).toBe('plan');
    expect(loc.from?.label).toBe('Home');
    expect(loc.to?.label).toBe('Saddar Market');
    expect(parseHash(buildHash(loc))).toEqual(loc);
  });
  it('parses route and stop pages', () => {
    expect(parseHash('#/karachi/route/karachi-pbs%3AR1').routeKey).toBe('karachi-pbs:R1');
    expect(parseHash('#/lahore/stop/kalma-chowk').stopId).toBe('kalma-chowk');
  });
});
