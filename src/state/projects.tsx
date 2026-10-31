import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  addCalc,
  loadProjects,
  removeCalc,
  removeProject,
  saveProjects,
  type Project,
  type SavedCalc,
  type SaveTarget,
} from '@/storage/projects';

interface ProjectsContext {
  projects: Project[];
  /** The calculation waiting on the Save screen. */
  pending: SavedCalc | null;
  setPending: (calc: SavedCalc | null) => void;
  save: (target: SaveTarget, calc: SavedCalc) => void;
  deleteCalc: (projectId: string, calcId: string) => void;
  deleteProject: (projectId: string) => void;
}

const Ctx = createContext<ProjectsContext | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<SavedCalc | null>(null);

  useEffect(() => {
    loadProjects().then((p) => {
      // null means storage could not be read: keep saving off so nothing is overwritten.
      if (p === null) return;
      setProjects(p);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveProjects(projects).catch(() => {});
  }, [projects, loaded]);

  const save = useCallback((target: SaveTarget, calc: SavedCalc) => setProjects((p) => addCalc(p, target, calc)), []);
  const deleteCalc = useCallback(
    (projectId: string, calcId: string) => setProjects((p) => removeCalc(p, projectId, calcId)),
    [],
  );
  const deleteProject = useCallback((projectId: string) => setProjects((p) => removeProject(p, projectId)), []);

  const value = useMemo(
    () => ({ projects, pending, setPending, save, deleteCalc, deleteProject }),
    [projects, pending, save, deleteCalc, deleteProject],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProjects(): ProjectsContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProjects must be used inside ProjectsProvider');
  return ctx;
}
