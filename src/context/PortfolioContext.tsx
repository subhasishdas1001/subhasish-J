import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  auth,
  onAuthStateChanged,
  User,
  checkIsAdminUser,
  checkOneTimeSetupStatus,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  PortfolioSiteData,
  PortfolioProject,
  ActivityLogItem,
} from '../types/portfolio';
import {
  DEFAULT_PORTFOLIO_DATA,
  DEFAULT_PROJECTS,
  serializeSiteData,
  deserializeSiteData,
} from '../data/defaultPortfolioData';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface PortfolioContextValue {
  // Auth & One-Time Setup State
  user: User | null;
  isAdmin: boolean;
  authReady: boolean;
  isSetupInitialized: boolean;
  refreshAdminAuth: () => Promise<void>;

  // Data
  publishedData: PortfolioSiteData;
  draftData: PortfolioSiteData;
  projects: PortfolioProject[];
  activityLogs: ActivityLogItem[];
  hasUnpublishedChanges: boolean;
  isPreviewingDraft: boolean;
  setIsPreviewingDraft: (val: boolean) => void;
  loadingData: boolean;
  isSaving: boolean;

  // Notifications
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Section Draft & Publish actions
  updateDraftData: (updater: (prev: PortfolioSiteData) => PortfolioSiteData) => void;
  saveDraft: (sectionLabel?: string) => Promise<void>;
  publishWebsite: (note?: string) => Promise<void>;
  discardDraft: () => Promise<void>;

  // Project CRUD
  saveProject: (project: PortfolioProject, isNew?: boolean) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (project: PortfolioProject) => Promise<void>;
  reorderProjects: (orderedProjects: PortfolioProject[]) => Promise<void>;

  // Admin Utilities
  resetToFactoryDefaults: () => Promise<void>;
  importFullBackup: (siteData: PortfolioSiteData, projectsList: PortfolioProject[]) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isSetupInitialized, setIsSetupInitialized] = useState<boolean>(true);

  const [publishedData, setPublishedData] = useState<PortfolioSiteData>(
    DEFAULT_PORTFOLIO_DATA
  );
  const [draftData, setDraftData] = useState<PortfolioSiteData>(
    DEFAULT_PORTFOLIO_DATA
  );
  const [projects, setProjects] = useState<PortfolioProject[]>(DEFAULT_PROJECTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAdminAuth = useCallback(async () => {
    const setupStatus = await checkOneTimeSetupStatus();
    setIsSetupInitialized(setupStatus.initialized);
    const currUser = auth.currentUser;
    setUser(currUser);
    const verified = await checkIsAdminUser(currUser);
    setIsAdmin(verified);
    if (verified) {
      setIsSetupInitialized(true);
    }
    setAuthReady(true);
  }, []);

  // 1. Auth & Setup Lock Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      const setupStatus = await checkOneTimeSetupStatus();
      setIsSetupInitialized(setupStatus.initialized);
      const verified = await checkIsAdminUser(currUser);
      setIsAdmin(verified);
      if (verified) {
        setIsSetupInitialized(true);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const logActivity = useCallback(
    async (action: string, section: string) => {
      if (!isAdmin || !user) return;
      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const entry: ActivityLogItem = {
        id: logId,
        action,
        section,
        actorEmail: user.uid,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'activity_logs', logId), {
          action: entry.action,
          section: entry.section,
          actorEmail: entry.actorEmail,
          createdAt: entry.createdAt,
        });
      } catch (err) {
        console.warn('Could not write activity log:', err);
      }
    },
    [isAdmin, user]
  );

  // 2. Public Published Site Data Listener
  useEffect(() => {
    const pubRef = doc(db, 'site_published', 'main');
    const unsub = onSnapshot(
      pubRef,
      (snap) => {
        if (snap.exists()) {
          const parsed = deserializeSiteData(
            snap.data() as Record<string, unknown>
          );
          setPublishedData(parsed);
          if (!isAdmin) {
            setDraftData(parsed);
          }
        }
        setLoadingData(false);
      },
      (err) => {
        console.warn('Published site snapshot notice:', err);
        setLoadingData(false);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 3. Admin Draft Listener + Initial Database Seeding when Verified Admin Connects
  useEffect(() => {
    if (!authReady || !isAdmin || !user) return;

    const draftRef = doc(db, 'site_draft', 'main');
    const pubRef = doc(db, 'site_published', 'main');

    const unsubDraft = onSnapshot(
      draftRef,
      async (snap) => {
        if (snap.exists()) {
          const parsed = deserializeSiteData(
            snap.data() as Record<string, unknown>
          );
          setDraftData(parsed);
        } else {
          try {
            const initialPayload = serializeSiteData({
              ...DEFAULT_PORTFOLIO_DATA,
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid,
            });
            await setDoc(pubRef, initialPayload);
            await setDoc(draftRef, initialPayload);
          } catch (err) {
            console.warn('Initial site config seed error:', err);
          }
        }
      },
      (err) => {
        console.warn('Draft snapshot listener notice:', err);
      }
    );

    const unsubLogs = onSnapshot(
      collection(db, 'activity_logs'),
      (snap) => {
        const items: ActivityLogItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            action: String(data.action || ''),
            section: String(data.section || ''),
            actorEmail: String(data.actorEmail || ''),
            createdAt: String(data.createdAt || ''),
          });
        });
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setActivityLogs(items.slice(0, 25));
      },
      (err) => {
        console.warn('Activity logs listener notice:', err);
      }
    );

    return () => {
      unsubDraft();
      unsubLogs();
    };
  }, [authReady, isAdmin, user]);

  // 4. Projects Listener (Admin reads all projects; Public reads published projects)
  useEffect(() => {
    if (!authReady) return;

    const projectsCollection = collection(db, 'projects');
    const q = isAdmin
      ? projectsCollection
      : query(projectsCollection, where('status', '==', 'published'));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        if (snap.empty && isAdmin && user) {
          try {
            const batch = writeBatch(db);
            for (const proj of DEFAULT_PROJECTS) {
              batch.set(doc(db, 'projects', proj.id), proj);
            }
            await batch.commit();
            return;
          } catch (seedErr) {
            console.warn('Initial projects seed notice:', seedErr);
          }
        }

        if (!snap.empty) {
          const list: PortfolioProject[] = [];
          snap.forEach((d) => {
            const raw = d.data();
            list.push({
              id: String(raw.id || d.id),
              title: String(raw.title || ''),
              cat: String(raw.cat || ''),
              shortDesc: String(raw.shortDesc || ''),
              desc: String(raw.desc || ''),
              img: String(raw.img || ''),
              gallery: Array.isArray(raw.gallery)
                ? raw.gallery.map(String)
                : [],
              url: String(raw.url || ''),
              tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
              year: String(raw.year || '2026'),
              featured: Boolean(raw.featured),
              order: typeof raw.order === 'number' ? raw.order : 99,
              status: raw.status === 'draft' ? 'draft' : 'published',
              seoTitle: String(raw.seoTitle || ''),
              seoDesc: String(raw.seoDesc || ''),
              updatedAt: String(raw.updatedAt || new Date().toISOString()),
            });
          });
          list.sort((a, b) => a.order - b.order);
          setProjects(list);
        } else if (!isAdmin) {
          setProjects(DEFAULT_PROJECTS);
        }
      },
      (err) => {
        console.warn('Projects snapshot fallback to default projects:', err);
        setProjects(DEFAULT_PROJECTS);
      }
    );

    return () => unsub();
  }, [authReady, isAdmin, user]);

  // Compare draftData vs publishedData to track unpublished changes
  useEffect(() => {
    const a = serializeSiteData(publishedData);
    const b = serializeSiteData(draftData);
    const changed =
      a.heroJson !== b.heroJson ||
      a.aboutJson !== b.aboutJson ||
      a.servicesJson !== b.servicesJson ||
      a.skillsJson !== b.skillsJson ||
      a.processJson !== b.processJson ||
      a.contactJson !== b.contactJson ||
      a.socialJson !== b.socialJson ||
      a.appearanceJson !== b.appearanceJson ||
      a.seoJson !== b.seoJson ||
      a.navigationJson !== b.navigationJson ||
      a.footerJson !== b.footerJson;
    setHasUnpublishedChanges(changed);
  }, [publishedData, draftData]);

  const updateDraftData = useCallback(
    (updater: (prev: PortfolioSiteData) => PortfolioSiteData) => {
      setDraftData((prev) => {
        const next = updater(prev);
        return {
          ...next,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || 'admin',
        };
      });
    },
    [user]
  );

  const saveDraft = useCallback(
    async (sectionLabel = 'Website Draft') => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const updatedDraft: PortfolioSiteData = {
          ...draftData,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || 'admin',
        };
        const payload = serializeSiteData(updatedDraft);
        await setDoc(doc(db, 'site_draft', 'main'), payload);
        await logActivity(`Saved draft changes for ${sectionLabel}`, sectionLabel);
        showToast(`${sectionLabel} saved to draft.`, 'success');
      } catch (err) {
        showToast('Failed to save draft changes.', 'error');
        handleFirestoreError(err, OperationType.WRITE, 'site_draft/main');
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, draftData, user, logActivity, showToast]
  );

  const publishWebsite = useCallback(
    async (note = 'All Website Sections') => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const now = new Date().toISOString();
        const updated: PortfolioSiteData = {
          ...draftData,
          updatedAt: now,
          updatedBy: user?.uid || 'admin',
        };
        const payload = serializeSiteData(updated);
        await setDoc(doc(db, 'site_draft', 'main'), payload);
        await setDoc(doc(db, 'site_published', 'main'), payload);
        setPublishedData(updated);
        await logActivity(`Published changes (${note}) to live site`, note);
        showToast('Published! Changes are now live on your public website.', 'success');
      } catch (err) {
        showToast('Failed to publish changes.', 'error');
        handleFirestoreError(err, OperationType.WRITE, 'site_published/main');
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, draftData, user, logActivity, showToast]
  );

  const discardDraft = useCallback(async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const payload = serializeSiteData(publishedData);
      await setDoc(doc(db, 'site_draft', 'main'), payload);
      setDraftData(publishedData);
      await logActivity('Discarded unpublished draft changes', 'Draft Reset');
      showToast('Unpublished draft changes discarded.', 'info');
    } catch (err) {
      showToast('Failed to discard draft.', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'site_draft/main');
    } finally {
      setIsSaving(false);
    }
  }, [isAdmin, publishedData, logActivity, showToast]);

  const saveProject = useCallback(
    async (project: PortfolioProject, isNew = false) => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const cleanId =
          project.id
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-')
            .replace(/^-|-$/g, '') || `proj-${Date.now()}`;

        const finalProj: PortfolioProject = {
          ...project,
          id: cleanId,
          gallery: project.gallery.slice(0, 12),
          tags: project.tags.slice(0, 30),
          seoTitle:
            project.seoTitle || `${project.title} — ${project.cat} | Subhasish`,
          seoDesc: project.seoDesc || project.shortDesc.slice(0, 500),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'projects', cleanId), finalProj);
        await logActivity(
          `${isNew ? 'Created' : 'Updated'} project "${finalProj.title}" (${finalProj.status})`,
          'Projects'
        );
        showToast(
          `Project "${finalProj.title}" ${isNew ? 'created' : 'updated'} (${finalProj.status}).`,
          'success'
        );
      } catch (err) {
        showToast('Failed to save project.', 'error');
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `projects/${project.id}`
        );
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, logActivity, showToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const target = projects.find((p) => p.id === projectId);
        await deleteDoc(doc(db, 'projects', projectId));
        await logActivity(
          `Deleted project "${target?.title || projectId}"`,
          'Projects'
        );
        showToast(`Project "${target?.title || projectId}" deleted.`, 'info');
      } catch (err) {
        showToast('Failed to delete project.', 'error');
        handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, projects, logActivity, showToast]
  );

  const duplicateProject = useCallback(
    async (project: PortfolioProject) => {
      if (!isAdmin) return;
      const newId = `${project.id}-copy-${Date.now().toString(36).slice(-4)}`;
      const copy: PortfolioProject = {
        ...project,
        id: newId,
        title: `${project.title} (Copy)`,
        order: projects.length + 1,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      await saveProject(copy, true);
    },
    [isAdmin, projects.length, saveProject]
  );

  const reorderProjects = useCallback(
    async (orderedProjects: PortfolioProject[]) => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const batch = writeBatch(db);
        orderedProjects.forEach((p, idx) => {
          const updated = {
            ...p,
            order: idx + 1,
            updatedAt: new Date().toISOString(),
          };
          batch.set(doc(db, 'projects', p.id), updated);
        });
        await batch.commit();
        await logActivity('Reordered portfolio projects', 'Projects');
        showToast('Project display order updated.', 'success');
      } catch (err) {
        showToast('Failed to reorder projects.', 'error');
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, logActivity, showToast]
  );

  const resetToFactoryDefaults = useCallback(async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const freshSite = {
        ...DEFAULT_PORTFOLIO_DATA,
        updatedAt: now,
        updatedBy: user?.uid || 'admin',
      };
      const payload = serializeSiteData(freshSite);
      await setDoc(doc(db, 'site_published', 'main'), payload);
      await setDoc(doc(db, 'site_draft', 'main'), payload);

      const existingSnap = await getDocs(collection(db, 'projects'));
      const batch = writeBatch(db);
      existingSnap.forEach((d) => batch.delete(d.ref));
      for (const proj of DEFAULT_PROJECTS) {
        batch.set(doc(db, 'projects', proj.id), {
          ...proj,
          updatedAt: now,
        });
      }
      await batch.commit();
      await logActivity(
        'Reset entire website & projects to original defaults',
        'System'
      );
      showToast('Website restored to original HTML portfolio defaults.', 'success');
    } catch (err) {
      showToast('Failed to reset website defaults.', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'site_published/main');
    } finally {
      setIsSaving(false);
    }
  }, [isAdmin, user, logActivity, showToast]);

  const importFullBackup = useCallback(
    async (
      siteData: PortfolioSiteData,
      projectsList: PortfolioProject[]
    ) => {
      if (!isAdmin) return;
      setIsSaving(true);
      try {
        const now = new Date().toISOString();
        const updatedSite = {
          ...siteData,
          updatedAt: now,
          updatedBy: user?.uid || 'admin',
        };
        const payload = serializeSiteData(updatedSite);
        await setDoc(doc(db, 'site_draft', 'main'), payload);
        await setDoc(doc(db, 'site_published', 'main'), payload);

        const existingSnap = await getDocs(collection(db, 'projects'));
        const batch = writeBatch(db);
        existingSnap.forEach((d) => batch.delete(d.ref));
        projectsList.forEach((p, idx) => {
          batch.set(doc(db, 'projects', p.id), {
            ...p,
            order: typeof p.order === 'number' ? p.order : idx + 1,
            updatedAt: now,
          });
        });
        await batch.commit();
        await logActivity('Imported full JSON backup', 'System');
        showToast('Backup imported and published successfully!', 'success');
      } catch (err) {
        showToast('Failed to import backup.', 'error');
        handleFirestoreError(err, OperationType.WRITE, 'site_published/main');
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin, user, logActivity, showToast]
  );

  return (
    <PortfolioContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        isSetupInitialized,
        refreshAdminAuth,
        publishedData,
        draftData,
        projects,
        activityLogs,
        hasUnpublishedChanges,
        isPreviewingDraft,
        setIsPreviewingDraft,
        loadingData,
        isSaving,
        toasts,
        showToast,
        dismissToast,
        updateDraftData,
        saveDraft,
        publishWebsite,
        discardDraft,
        saveProject,
        deleteProject,
        duplicateProject,
        reorderProjects,
        resetToFactoryDefaults,
        importFullBackup,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
