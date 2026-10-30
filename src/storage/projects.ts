import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Step } from '@/calc/format';

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

const STORAGE_KEY = 'binaahub.projects.v1';

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
    `BinaaHub · ${projectName}`,
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

export async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
