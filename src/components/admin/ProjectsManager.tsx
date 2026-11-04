import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioProject } from '../../types/portfolio';
import { compressImageFile } from '../../utils/imageUtils';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Star,
  CheckCircle2,
  FileEdit,
  X,
  Upload,
  Sparkles,
} from 'lucide-react';

const EMPTY_PROJECT: PortfolioProject = {
  id: '',
  title: '',
  cat: '',
  shortDesc: '',
  desc: '',
  img: '',
  gallery: [],
  url: '',
  tags: [],
  year: new Date().getFullYear().toString(),
  featured: true,
  order: 1,
  status: 'published',
  seoTitle: '',
  seoDesc: '',
  updatedAt: new Date().toISOString(),
};

interface ProjectsManagerProps {
  autoOpenAddModal?: boolean;
  onAutoOpenHandled?: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  autoOpenAddModal = false,
  onAutoOpenHandled,
}) => {
  const {
    projects,
    saveProject,
    deleteProject,
    duplicateProject,
    reorderProjects,
    isSaving,
    showToast,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  const filteredProjects = sortedProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'published') return p.status === 'published';
    if (statusFilter === 'draft') return p.status === 'draft';
    if (statusFilter === 'featured') return p.featured;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProject({
      ...EMPTY_PROJECT,
      order: projects.length + 1,
      updatedAt: new Date().toISOString(),
    });
    setIsNewProject(true);
    setTagInput('');
  };

  React.useEffect(() => {
    if (autoOpenAddModal) {
      handleOpenAdd();
      onAutoOpenHandled?.();
    }
  }, [autoOpenAddModal]);

  const handleOpenEdit = (project: PortfolioProject) => {
    setEditingProject({
      ...project,
      gallery:
        project.gallery && project.gallery.length > 0
          ? [...project.gallery]
          : project.img
          ? [project.img]
          : [],
      tags: [...(project.tags || [])],
    });
    setIsNewProject(false);
    setTagInput('');
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedProjects.length) return;
    const updated = [...sortedProjects];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    await reorderProjects(updated);
  };

  const handleQuickStatusToggle = async (project: PortfolioProject) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    await saveProject({ ...project, status: nextStatus }, false);
  };

  const handleQuickFeaturedToggle = async (project: PortfolioProject) => {
    await saveProject({ ...project, featured: !project.featured }, false);
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.8);
      const nextGallery = editingProject.gallery.includes(dataUrl)
        ? editingProject.gallery
        : [dataUrl, ...editingProject.gallery].slice(0, 12);
      setEditingProject({
        ...editingProject,
        img: dataUrl,
        gallery: nextGallery,
      });
      showToast('Project thumbnail uploaded & optimized.', 'success');
    } catch {
      showToast('Could not process image file.', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleUploadGalleryScreenshots = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editingProject) return;
    setUploadingImage(true);
    try {
      const compressedList: string[] = [];
      for (const file of files.slice(0, 10)) {
        const compressed = await compressImageFile(file, 1200, 0.78);
        compressedList.push(compressed);
      }
      const combinedGallery = [
        ...editingProject.gallery,
        ...compressedList,
      ].slice(0, 12);
      setEditingProject({
        ...editingProject,
        img: editingProject.img || combinedGallery[0] || '',
        gallery: combinedGallery,
      });
      showToast(
        `Added ${compressedList.length} screenshot(s) to project gallery.`,
        'success'
      );
    } catch {
      showToast('Failed to process one or more gallery images.', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleReplaceGalleryImage = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadingImage(true);
    try {
      const newImg = await compressImageFile(file, 1200, 0.8);
      const oldImg = editingProject.gallery[idx];
      const nextGallery = [...editingProject.gallery];
      nextGallery[idx] = newImg;
      setEditingProject({
        ...editingProject,
        gallery: nextGallery,
        img: editingProject.img === oldImg ? newImg : editingProject.img,
      });
      showToast('Screenshot replaced.', 'success');
    } catch {
      showToast('Failed to replace screenshot.', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    if (!editingProject) return;
    const removed = editingProject.gallery[idx];
    const nextGallery = editingProject.gallery.filter((_, i) => i !== idx);
    setEditingProject({
      ...editingProject,
      gallery: nextGallery,
      img:
        editingProject.img === removed
          ? nextGallery[0] || ''
          : editingProject.img,
    });
  };

  const handleMoveGalleryImage = (idx: number, dir: -1 | 1) => {
    if (!editingProject) return;
    const target = idx + dir;
    if (target < 0 || target >= editingProject.gallery.length) return;
    const nextGallery = [...editingProject.gallery];
    const [moved] = nextGallery.splice(idx, 1);
    nextGallery.splice(target, 0, moved);
    setEditingProject({
      ...editingProject,
      gallery: nextGallery,
    });
  };

  const handleAddTag = () => {
    if (!editingProject || !tagInput.trim()) return;
    const parts = tagInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const nextTags = Array.from(new Set([...editingProject.tags, ...parts]));
    setEditingProject({ ...editingProject, tags: nextTags });
    setTagInput('');
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      showToast('Project Name is required.', 'error');
      return;
    }
    const generatedId =
      editingProject.id.trim() ||
      editingProject.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    await saveProject(
      {
        ...editingProject,
        id: generatedId,
      },
      isNewProject
    );
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">
            Projects &amp; Portfolio Manager
          </h2>
          <p className="text-sm text-stone-500">
            Upload, edit, reorder, and publish unlimited portfolio projects and gallery screenshots.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Project
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, category, description, or tag..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-10 pr-4 text-sm text-stone-900 focus:border-orange-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'published', 'draft', 'featured'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid / Table */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredProjects.map((project, idx) => (
          <div
            key={project.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition hover:border-stone-300 hover:shadow-md"
          >
            {/* Card Media Header */}
            <div className="relative aspect-16/9 w-full overflow-hidden bg-stone-100 border-b border-stone-100">
              {project.img ? (
                <img
                  src={project.img}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-stone-400">
                  <ImageIcon className="h-8 w-8 stroke-1" />
                  <span className="font-serif text-base text-stone-500">
                    {project.title}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickStatusToggle(project)}
                  title="Click to toggle Published / Draft status"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-md transition cursor-pointer ${
                    project.status === 'published'
                      ? 'bg-emerald-600/95 text-white hover:bg-emerald-700'
                      : 'bg-amber-500/95 text-white hover:bg-amber-600'
                  }`}
                >
                  {project.status === 'published' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <FileEdit className="h-3 w-3" />
                  )}
                  {project.status === 'published' ? 'Published' : 'Draft'}
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFeaturedToggle(project)}
                  title="Click to toggle Featured status"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-md transition cursor-pointer ${
                    project.featured
                      ? 'bg-stone-900/90 text-amber-300'
                      : 'bg-white/90 text-stone-600'
                  }`}
                >
                  <Star
                    className={`h-3 w-3 ${
                      project.featured ? 'fill-amber-300' : ''
                    }`}
                  />
                  {project.featured ? 'Featured' : 'Standard'}
                </button>
              </div>

              {/* Order Controls */}
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-stone-700 shadow-xs backdrop-blur-md">
                <span>#{project.order}</span>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, -1)}
                  disabled={idx === 0 || isSaving}
                  title="Move earlier"
                  className="rounded p-0.5 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 1)}
                  disabled={idx === filteredProjects.length - 1 || isSaving}
                  title="Move later"
                  className="rounded p-0.5 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {project.gallery && project.gallery.length > 1 && (
                <div className="absolute bottom-2.5 right-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {project.gallery.length} gallery photos
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    {project.cat || 'Uncategorized'}
                  </span>
                  <span className="text-xs text-stone-400">{project.year}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-stone-900">
                  {project.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-stone-600">
                  {project.shortDesc}
                </p>

                {project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 5).map((t, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600"
                      >
                        {t}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                        +{project.tags.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Project
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateProject(project)}
                    disabled={isSaving}
                    title="Duplicate project"
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open live website"
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live
                    </a>
                  )}
                  {confirmDeleteId === project.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteProject(project.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg bg-stone-100 px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(project.id)}
                      title="Delete project"
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {isNewProject ? 'Add New Portfolio Project' : `Edit Project: ${editingProject.title}`}
                </h3>
                <p className="text-xs text-stone-500">
                  Published projects automatically appear on the homepage and generate a dedicated detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Zaiko Foods"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Project Category *
                  </label>
                  <input
                    type="text"
                    value={editingProject.cat}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        cat: e.target.value,
                      })
                    }
                    placeholder="e.g., Restaurant & Food Service Website"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Live Website URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.url}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        url: e.target.value,
                      })
                    }
                    placeholder="https://www.example.com/"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Year
                    </label>
                    <input
                      type="text"
                      value={editingProject.year}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          year: e.target.value,
                        })
                      }
                      placeholder="2026"
                      className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Order
                    </label>
                    <input
                      type="number"
                      value={editingProject.order}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          order: Number(e.target.value) || 1,
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Status
                    </label>
                    <select
                      value={editingProject.status}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          status:
                            e.target.value === 'draft' ? 'draft' : 'published',
                        })
                      }
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2.5 text-sm font-medium text-stone-900 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Featured Toggle & Slug */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4 border border-stone-200/80">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        featured: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-stone-900">
                      Featured Portfolio Project
                    </span>
                    <p className="text-xs text-stone-500">
                      Highlight this project prominently on the public homepage.
                    </p>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500">
                    URL Slug:
                  </span>
                  <input
                    type="text"
                    value={editingProject.id}
                    disabled={!isNewProject}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        id: e.target.value,
                      })
                    }
                    placeholder="auto-generated-from-name"
                    className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-700 disabled:bg-stone-100"
                  />
                </div>
              </div>

              {/* Short & Full Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Short Description (Displayed on Project Card) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingProject.shortDesc}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        shortDesc: e.target.value,
                      })
                    }
                    placeholder="Concise 1–2 sentence overview for the portfolio card..."
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Full Project Description (Displayed on Project Detail Page)
                  </label>
                  <textarea
                    rows={4}
                    value={editingProject.desc}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        desc: e.target.value,
                      })
                    }
                    placeholder="Detailed explanation of the project goals, UI/UX process, features, and impact..."
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Technologies / Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Technologies &amp; Tags
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tags (comma-separated, e.g. UI/UX Design, Responsive Design)..."
                    className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
                {editingProject.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingProject.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              tags: editingProject.tags.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="text-stone-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Image & Gallery Management */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Project Thumbnail &amp; Multi-Image Gallery
                    </h4>
                    <p className="text-xs text-stone-500">
                      Upload images from your computer. Click &ldquo;Set as Thumbnail&rdquo; on any screenshot, or reorder gallery slides.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingImage ? 'Processing...' : 'Upload Thumbnail'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadThumbnail}
                        className="hidden"
                      />
                    </label>
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-orange-500 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" />
                      {uploadingImage
                        ? 'Processing...'
                        : 'Upload Multiple Screenshots'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadGalleryScreenshots}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery Grid */}
                {editingProject.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {editingProject.gallery.map((imgSrc, idx) => {
                      const isFeaturedThumb = editingProject.img === imgSrc;
                      return (
                        <div
                          key={idx}
                          className={`group relative overflow-hidden rounded-xl border bg-white p-1.5 shadow-xs ${
                            isFeaturedThumb
                              ? 'border-orange-500 ring-2 ring-orange-500/20'
                              : 'border-stone-200'
                          }`}
                        >
                          <div className="aspect-16/10 overflow-hidden rounded-lg bg-stone-100">
                            <img
                              src={imgSrc}
                              alt={`Slide ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProject({
                                  ...editingProject,
                                  img: imgSrc,
                                })
                              }
                              className={`rounded px-2 py-0.5 font-semibold cursor-pointer ${
                                isFeaturedThumb
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                              }`}
                            >
                              {isFeaturedThumb ? '★ Thumbnail' : 'Set Thumbnail'}
                            </button>

                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveGalleryImage(idx, -1)}
                                disabled={idx === 0}
                                title="Move left"
                                className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveGalleryImage(idx, 1)}
                                disabled={
                                  idx === editingProject.gallery.length - 1
                                }
                                title="Move right"
                                className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"
                              >
                                ›
                              </button>
                              <label
                                title="Replace image"
                                className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                              >
                                ↻
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleReplaceGalleryImage(idx, e)
                                  }
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                title="Remove image"
                                className="rounded p-1 text-red-500 hover:bg-red-50"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-white py-8 text-center text-xs text-stone-500">
                    No screenshots uploaded yet. Projects without images automatically display a clean typographic card on the portfolio.
                  </div>
                )}
              </div>

              {/* Project-Specific SEO */}
              <div className="rounded-2xl border border-stone-200 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
                  <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                  Project-Specific SEO Metadata
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-600">
                      SEO Page Title
                    </label>
                    <input
                      type="text"
                      value={editingProject.seoTitle}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          seoTitle: e.target.value,
                        })
                      }
                      placeholder={`${
                        editingProject.title || 'Project'
                      } — Subhasish`}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600">
                      SEO Meta Description
                    </label>
                    <input
                      type="text"
                      value={editingProject.seoDesc}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          seoDesc: e.target.value,
                        })
                      }
                      placeholder={
                        editingProject.shortDesc ||
                        'Custom meta description for search engines...'
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Submit Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingImage}
                  className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving
                    ? 'Saving...'
                    : isNewProject
                    ? 'Create Project'
                    : 'Save Project Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
