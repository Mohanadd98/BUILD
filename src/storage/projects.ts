import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Step } from '@/calc/format';

import { getItemMigrating } from './keys';

export type Tool = 'concrete' | 'blocks' | 'plaster' | 'tiles' | 'paint';

/**
 * One line of a saved calculation. Labels are stored as translation keys so a
 * saved result is shown in whichever language the app is set to later.
 */
export interface Line {
  labelKey: string;
  value?: string;
  /** Translation key for a value that is a word, e.g. "concrete.mix.plain". */
  valueKey?: string;
  unit?: string;
  /** Translation key for a unit that is a word, e.g. "concrete.bags". */
  unitKey?: string;
}

export interface SavedCalc {
  id: string;
  tool: Tool;
  createdAt: number;
  inputs: Line[];
  results: Line[];
  steps: Step[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  calcs: SavedCalc[];
}

/** Where to save: an existing project, or a new one with this name. */
export type SaveTarget = { projectId: string } | { newName: string };

const STORAGE_KEY = 'build.projects.v1';
/** Key used before the app was renamed to BUILD; read once and migrated. */
const LEGACY_STORAGE_KEY = 'binaahub.projects.v1';

export function newId(now: number = Date.now()): string {
  return `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Adds a calculation; returns a new list (the input is not changed). Newest first. */
export function addCalc(projects: Project[], target: SaveTarget, calc: SavedCalc, now: number = Date.now()): Project[] {
  if ('projectId' in target) {
    return projects.map((p) => (p.id === target.projectId ? { ...p, calcs: [calc, ...p.calcs] } : p));
  }
  const name = target.newName.trim();
  if (!name) return projects;
  return [{ id: newId(now), name, createdAt: now, calcs: [calc] }, ...projects];
}

export function removeCalc(projects: Project[], projectId: string, calcId: string): Project[] {
  return projects.map((p) => (p.id === projectId ? { ...p, calcs: p.calcs.filter((c) => c.id !== calcId) } : p));
}

export function removeProject(projects: Project[], projectId: string): Project[] {
  return projects.filter((p) => p.id !== projectId);
}

/** A line split into its translated label and its value with unit. */
export function lineParts(line: Line, t: (key: string) => string): { label: string; value: string } {
  const value = line.valueKey ? t(line.valueKey) : (line.value ?? '');
  const unit = line.unitKey ? t(line.unitKey) : (line.unit ?? '');
  return { label: t(line.labelKey), value: `${value}${unit ? ` ${unit}` : ''}` };
}

/** One readable line, e.g. "Cement: 23 bags". */
export function lineText(line: Line, t: (key: string) => string): string {
  const { label, value } = lineParts(line, t);
  return `${label}: ${value}`;
}

/** Plain text for WhatsApp or email, including the formulas. */
export function shareText(projectName: string, calc: SavedCalc, t: (key: string) => string, date: string): string {
  return [
    `BUILD · ${projectName}`,
    `${t(`${calc.tool}.title`)} · ${date}`,
    '',
    ...calc.inputs.map((l) => lineText(l, t)),
    '',
    `${t('common.result')}:`,
    ...calc.results.map((l) => lineText(l, t)),
    '',
    `${t('common.formula')}:`,
    ...calc.steps.map((s) => `${t(s.labelKey)}: ${s.expr}`),
  ].join('\n');
}

function isLine(v: unknown): v is Line {
  return typeof v === 'object' && v !== null && typeof (v as Line).labelKey === 'string';
}

function isCalc(v: unknown): v is SavedCalc {
  const c = v as SavedCalc;
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof c.id === 'string' &&
    ['concrete', 'blocks', 'plaster', 'tiles', 'paint'].includes(c.tool) &&
    typeof c.createdAt === 'number' &&
    Array.isArray(c.inputs) &&
    c.inputs.every(isLine) &&
    Array.isArray(c.results) &&
    c.results.every(isLine) &&
    Array.isArray(c.steps) &&
    c.steps.every((s) => typeof s?.labelKey === 'string' && typeof s?.expr === 'string')
  );
}

/**
 * Reads stored projects, keeping only well-formed entries.
 * Throws if the stored text is not valid JSON, so the caller never
 * overwrites data it could not read.
 */
export function parseProjects(raw: string | null): Project[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Stored projects are not a list');
  return data
    .filter(
      (p): p is Project =>
        typeof p === 'object' &&
        p !== null &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.createdAt === 'number' &&
        Array.isArray(p.calcs),
    )
    .map((p) => ({ ...p, calcs: p.calcs.filter(isCalc) }));
}

/**
 * Loads saved projects. Returns null when they could not be read; the
 * damaged text is copied to a backup key so it is never silently lost.
 */
export async function loadProjects(): Promise<Project[] | null> {
  let raw: string | null;
  try {
    raw = await getItemMigrating(STORAGE_KEY, LEGACY_STORAGE_KEY);
  } catch {
    return null;
  }
  try {
    return parseProjects(raw);
  } catch {
    await AsyncStorage.setItem(`${STORAGE_KEY}.damaged.${Date.now()}`, raw ?? '').catch(() => {});
    return [];
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
