import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { compressImageFile } from '../../utils/imageUtils';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  Send,
} from 'lucide-react';

interface SectionEditorProps {
  activeSection:
    | 'hero'
    | 'about'
    | 'services'
    | 'skills'
    | 'process'
    | 'contact';
}

const SERVICE_ICON_PRESETS = ['▣', '⌂', '◧', '↻', '✦', '⚡', '◈', '⌘', '❖', '◎'];

export const SectionsEditor: React.FC<SectionEditorProps> = ({
  activeSection,
}) => {
  const {
    draftData,
    updateDraftData,
    saveDraft,
    publishWebsite,
    isSaving,
    showToast,
  } = usePortfolio();

  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleHeroPortraitUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const dataUrl = await compressImageFile(file, 900, 0.82);
      updateDraftData((prev) => ({
        ...prev,
        hero: { ...prev.hero, portraitImg: dataUrl },
      }));
      showToast('Hero profile image updated in draft.', 'success');
    } catch {
      showToast('Failed to process image.', 'error');
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const handleAboutImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const dataUrl = await compressImageFile(file, 900, 0.82);
      updateDraftData((prev) => ({
        ...prev,
        about: {
          ...prev.about,
          profileImage: dataUrl,
          showProfileImage: true,
        },
      }));
      showToast('About section photo updated in draft.', 'success');
    } catch {
      showToast('Failed to process image.', 'error');
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const ActionHeader = ({
    title,
    subtitle,
    sectionName,
  }: {
    title: string;
    subtitle: string;
    sectionName: string;
  }) => (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => saveDraft(sectionName)}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => publishWebsite(sectionName)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-500 disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          Publish to Website
        </button>
      </div>
    </div>
  );

  /* ============================================================================
   * 1. HERO SECTION EDITOR (Manage Homepage)
   * ========================================================================== */
  if (activeSection === 'hero') {
    const { hero } = draftData;
    return (
      <div className="space-y-6">
        <ActionHeader
          title="Manage Homepage — Hero Section"
          subtitle="Edit your main headline, italicized highlight word, subtitle, portrait image, CTA buttons, and floating badge."
          sectionName="Hero Section"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Text & Buttons Column */}
          <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Small Top Label (Badge)
              </label>
              <input
                type="text"
                value={hero.label}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, label: e.target.value },
                  }))
                }
                placeholder="Web & Software Designer"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Heading First Part
                </label>
                <input
                  type="text"
                  value={hero.headingPrefix}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingPrefix: e.target.value },
                    }))
                  }
                  placeholder="I design websites that make"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-600">
                  Highlighted Word (Italic Accent)
                </label>
                <input
                  type="text"
                  value={hero.headingHighlight}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingHighlight: e.target.value },
                    }))
                  }
                  placeholder="brands"
                  className="mt-1.5 w-full rounded-xl border border-orange-300 bg-orange-50/40 px-3.5 py-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Heading Ending
                </label>
                <input
                  type="text"
                  value={hero.headingSuffix}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingSuffix: e.target.value },
                    }))
                  }
                  placeholder="stand out."
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Subtitle Paragraph
              </label>
              <textarea
                rows={3}
                value={hero.subtitle}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            {/* Primary & Secondary Buttons */}
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Primary Button
                </span>
                <div>
                  <label className="block text-xs text-stone-500">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={hero.primaryBtnText}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryBtnText: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500">
                    Button Link / Anchor
                  </label>
                  <input
                    type="text"
                    value={hero.primaryBtnLink}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryBtnLink: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Secondary Button
                </span>
                <div>
                  <label className="block text-xs text-stone-500">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={hero.secondaryBtnText}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          secondaryBtnText: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500">
                    Button Link / Anchor
                  </label>
                  <input
                    type="text"
                    value={hero.secondaryBtnLink}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          secondaryBtnLink: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Floating Info Card */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Floating Information Card
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hero.showFloatingCard !== false}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          showFloatingCard: e.target.checked,
                        },
                      }))
                    }
                    className="rounded text-orange-600"
                  />
                  Show Floating Card
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-stone-500">
                    Bold Title
                  </label>
                  <input
                    type="text"
                    value={hero.floatingCardTitle}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          floatingCardTitle: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500">
                    Small Subtitle
                  </label>
                  <input
                    type="text"
                    value={hero.floatingCardSubtitle}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          floatingCardSubtitle: e.target.value,
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Portrait Image Column */}
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900">
              Hero Portrait Image
            </h3>
            <div className="mx-auto max-w-[240px] overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 aspect-4/4.6">
              {hero.portraitImg ? (
                <img
                  src={hero.portraitImg}
                  alt="Hero Portrait"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-xs text-stone-400">
                  No Image
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploadingImg ? 'Uploading...' : 'Upload New Portrait'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroPortraitUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 2. ABOUT SECTION EDITOR
   * ========================================================================== */
  if (activeSection === 'about') {
    const { about } = draftData;
    return (
      <div className="space-y-6">
        <ActionHeader
          title="About Section Editor"
          subtitle="Manage your biography heading, description, optional profile photo, and highlight cards."
          sectionName="About Section"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Section Label
                </label>
                <input
                  type="text"
                  value={about.label}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      about: { ...prev.about, label: e.target.value },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={about.heading}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      about: { ...prev.about, heading: e.target.value },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                About Description
              </label>
              <textarea
                rows={4}
                value={about.description}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    about: { ...prev.about, description: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* Highlights / Content Blocks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Highlight Information Cards ({about.highlights.length})
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateDraftData((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        highlights: [
                          ...prev.about.highlights,
                          {
                            id: `pt-${Date.now()}`,
                            title: 'New Highlight',
                            description: 'Short description here.',
                          },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Highlight Card
                </button>
              </div>

              <div className="space-y-3">
                {about.highlights.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const next = [...about.highlights];
                          next[idx] = { ...item, title: e.target.value };
                          updateDraftData((prev) => ({
                            ...prev,
                            about: { ...prev.about, highlights: next },
                          }));
                        }}
                        placeholder="Highlight Title"
                        className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const next = [...about.highlights];
                          next[idx] = { ...item, description: e.target.value };
                          updateDraftData((prev) => ({
                            ...prev,
                            about: { ...prev.about, highlights: next },
                          }));
                        }}
                        placeholder="Highlight Description"
                        className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftData((prev) => ({
                          ...prev,
                          about: {
                            ...prev.about,
                            highlights: prev.about.highlights.filter(
                              (h) => h.id !== item.id
                            ),
                          },
                        }))
                      }
                      className="self-end rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 sm:self-center cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optional About Profile Image */}
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                About Profile Photo
              </h3>
              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={about.showProfileImage}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        showProfileImage: e.target.checked,
                      },
                    }))
                  }
                  className="rounded text-orange-600"
                />
                Display Photo
              </label>
            </div>
            {about.profileImage && (
              <div className="mx-auto max-w-[200px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 aspect-square">
                <img
                  src={about.profileImage}
                  alt="About"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <label className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploadingImg ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAboutImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 3. SERVICES SECTION EDITOR
   * ========================================================================== */
  if (activeSection === 'services') {
    const sortedServices = [...draftData.services].sort(
      (a, b) => a.order - b.order
    );

    const moveService = (idx: number, dir: -1 | 1) => {
      const target = idx + dir;
      if (target < 0 || target >= sortedServices.length) return;
      const list = [...sortedServices];
      const [moved] = list.splice(idx, 1);
      list.splice(target, 0, moved);
      const reindexed = list.map((s, i) => ({ ...s, order: i + 1 }));
      updateDraftData((prev) => ({ ...prev, services: reindexed }));
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Services Section Manager"
          subtitle="Add, edit, reorder, or remove the services offered on your portfolio."
          sectionName="Services Section"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              updateDraftData((prev) => ({
                ...prev,
                services: [
                  ...prev.services,
                  {
                    id: `srv-${Date.now()}`,
                    icon: '✦',
                    title: 'New Service',
                    description: 'Describe what this service delivers for clients.',
                    order: prev.services.length + 1,
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Service
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sortedServices.map((srv, idx) => (
            <div
              key={srv.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-lg font-bold text-orange-600">
                    {srv.icon}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Service #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveService(idx, -1)}
                    disabled={idx === 0}
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveService(idx, 1)}
                    disabled={idx === sortedServices.length - 1}
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        services: prev.services.filter((s) => s.id !== srv.id),
                      }))
                    }
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500">
                    Icon Symbol
                  </label>
                  <input
                    type="text"
                    value={srv.icon}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        services: prev.services.map((s) =>
                          s.id === srv.id ? { ...s, icon: e.target.value } : s
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-center text-sm font-bold"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {SERVICE_ICON_PRESETS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() =>
                          updateDraftData((prev) => ({
                            ...prev,
                            services: prev.services.map((s) =>
                              s.id === srv.id ? { ...s, icon: ic } : s
                            ),
                          }))
                        }
                        className="rounded border border-stone-200 px-1.5 py-0.5 text-xs hover:bg-orange-50 hover:border-orange-300 cursor-pointer"
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-500">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) =>
                        updateDraftData((prev) => ({
                          ...prev,
                          services: prev.services.map((s) =>
                            s.id === srv.id
                              ? { ...s, title: e.target.value }
                              : s
                          ),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={srv.description}
                      onChange={(e) =>
                        updateDraftData((prev) => ({
                          ...prev,
                          services: prev.services.map((s) =>
                            s.id === srv.id
                              ? { ...s, description: e.target.value }
                              : s
                          ),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 4. SKILLS SECTION EDITOR
   * ========================================================================== */
  if (activeSection === 'skills') {
    const { skills } = draftData;

    const handleAddCategory = () => {
      if (!newCategoryName.trim()) return;
      updateDraftData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          categories: [
            ...prev.skills.categories,
            {
              id: `cat-${Date.now()}`,
              name: newCategoryName.trim(),
              skills: [],
            },
          ],
        },
      }));
      setNewCategoryName('');
    };

    const handleAddSkillToCategory = (catId: string) => {
      const text = (newSkillText[catId] || '').trim();
      if (!text) return;
      const parts = text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      updateDraftData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          categories: prev.skills.categories.map((c) =>
            c.id === catId
              ? { ...c, skills: Array.from(new Set([...c.skills, ...parts])) }
              : c
          ),
        },
      }));
      setNewSkillText((prev) => ({ ...prev, [catId]: '' }));
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Skills &amp; Categories Manager"
          subtitle="Add, edit, or remove skills and organize them into categories."
          sectionName="Skills Section"
        />

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Section Label
              </label>
              <input
                type="text"
                value={skills.label}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    skills: { ...prev.skills, label: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Section Heading
              </label>
              <input
                type="text"
                value={skills.heading}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    skills: { ...prev.skills, heading: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skills.showCategories}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        showCategories: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4 rounded text-orange-600"
                />
                Group by Category Headers on Website
              </label>
            </div>
          </div>
        </div>

        {/* Add Category Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Skill Category Name (e.g., Frontend & UI, Industry Specialties)..."
            className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {skills.categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        categories: prev.skills.categories.map((c) =>
                          c.id === cat.id ? { ...c, name: e.target.value } : c
                        ),
                      },
                    }))
                  }
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-bold text-stone-900"
                />
                {skills.categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          categories: prev.skills.categories.filter(
                            (c) => c.id !== cat.id
                          ),
                        },
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Category
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillText[cat.id] || ''}
                  onChange={(e) =>
                    setNewSkillText((prev) => ({
                      ...prev,
                      [cat.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkillToCategory(cat.id);
                    }
                  }}
                  placeholder="Add skill(s) to this category..."
                  className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkillToCategory(cat.id)}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500 cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {cat.skills.map((sk, sIdx) => (
                  <div
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800"
                  >
                    <input
                      type="text"
                      value={sk}
                      onChange={(e) => {
                        const updatedSkills = [...cat.skills];
                        updatedSkills[sIdx] = e.target.value;
                        updateDraftData((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            categories: prev.skills.categories.map((c) =>
                              c.id === cat.id
                                ? { ...c, skills: updatedSkills }
                                : c
                            ),
                          },
                        }));
                      }}
                      className="w-auto min-w-[90px] bg-transparent text-xs font-medium focus:outline-none"
                      style={{ width: `${Math.max(8, sk.length + 1)}ch` }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftData((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            categories: prev.skills.categories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    skills: c.skills.filter(
                                      (_, i) => i !== sIdx
                                    ),
                                  }
                                : c
                            ),
                          },
                        }))
                      }
                      className="text-stone-400 hover:text-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 5. PROCESS SECTION EDITOR
   * ========================================================================== */
  if (activeSection === 'process') {
    const sortedSteps = [...draftData.process.steps].sort(
      (a, b) => a.order - b.order
    );

    const moveStep = (idx: number, dir: -1 | 1) => {
      const target = idx + dir;
      if (target < 0 || target >= sortedSteps.length) return;
      const list = [...sortedSteps];
      const [moved] = list.splice(idx, 1);
      list.splice(target, 0, moved);
      const reindexed = list.map((st, i) => ({
        ...st,
        order: i + 1,
        number: String(i + 1).padStart(2, '0'),
      }));
      updateDraftData((prev) => ({
        ...prev,
        process: { ...prev.process, steps: reindexed },
      }));
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Process Steps Manager"
          subtitle="Add, edit, reorder, or remove workflow steps in your Process section."
          sectionName="Process Section"
        />

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Section Label
              </label>
              <input
                type="text"
                value={draftData.process.label}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    process: { ...prev.process, label: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Section Heading
              </label>
              <input
                type="text"
                value={draftData.process.heading}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    process: { ...prev.process, heading: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              updateDraftData((prev) => {
                const nextNum = String(prev.process.steps.length + 1).padStart(
                  2,
                  '0'
                );
                return {
                  ...prev,
                  process: {
                    ...prev.process,
                    steps: [
                      ...prev.process.steps,
                      {
                        id: `step-${Date.now()}`,
                        number: nextNum,
                        title: 'New Step',
                        description: 'Describe this step of your workflow.',
                        order: prev.process.steps.length + 1,
                      },
                    ],
                  },
                };
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sortedSteps.map((step, idx) => (
            <div
              key={step.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={step.number}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        process: {
                          ...prev.process,
                          steps: prev.process.steps.map((s) =>
                            s.id === step.id
                              ? { ...s, number: e.target.value }
                              : s
                          ),
                        },
                      }))
                    }
                    className="w-14 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-center font-serif text-sm font-bold text-orange-700"
                  />
                  <span className="text-xs font-medium text-stone-400">
                    Step Order #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(idx, 1)}
                    disabled={idx === sortedSteps.length - 1}
                    className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        process: {
                          ...prev.process,
                          steps: prev.process.steps.filter(
                            (s) => s.id !== step.id
                          ),
                        },
                      }))
                    }
                    className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Step Title
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      process: {
                        ...prev.process,
                        steps: prev.process.steps.map((s) =>
                          s.id === step.id ? { ...s, title: e.target.value } : s
                        ),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Step Description
                </label>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      process: {
                        ...prev.process,
                        steps: prev.process.steps.map((s) =>
                          s.id === step.id
                            ? { ...s, description: e.target.value }
                            : s
                        ),
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 6. CONTACT SECTION EDITOR
   * ========================================================================== */
  const { contact } = draftData;
  return (
    <div className="space-y-6">
      <ActionHeader
        title="Contact Information Editor"
        subtitle="Update your contact heading, phone number, WhatsApp number, email, and call-to-action buttons."
        sectionName="Contact Section"
      />

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Contact Heading
            </label>
            <input
              type="text"
              value={contact.heading}
              onChange={(e) =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, heading: e.target.value },
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Description Subtitle
            </label>
            <input
              type="text"
              value={contact.description}
              onChange={(e) =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, description: e.target.value },
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Phone Number
            </label>
            <input
              type="text"
              value={contact.phone}
              onChange={(e) =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              placeholder="8670479101"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              WhatsApp Number (with country code)
            </label>
            <input
              type="text"
              value={contact.whatsapp}
              onChange={(e) =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, whatsapp: e.target.value },
                }))
              }
              placeholder="918670479101"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Email Address
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Contact CTA Buttons */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Contact Action Buttons
            </span>
            <button
              type="button"
              onClick={() =>
                updateDraftData((prev) => ({
                  ...prev,
                  contact: {
                    ...prev.contact,
                    buttons: [
                      ...prev.contact.buttons,
                      {
                        id: `cbtn-${Date.now()}`,
                        label: 'Email Me',
                        url: `mailto:${prev.contact.email}`,
                        variant: 'ghost',
                      },
                    ],
                  },
                }))
              }
              className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Button
            </button>
          </div>

          <div className="space-y-3">
            {contact.buttons.map((btn, idx) => (
              <div
                key={btn.id}
                className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 sm:grid-cols-4 sm:items-center"
              >
                <input
                  type="text"
                  value={btn.label}
                  onChange={(e) => {
                    const next = [...contact.buttons];
                    next[idx] = { ...btn, label: e.target.value };
                    updateDraftData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, buttons: next },
                    }));
                  }}
                  placeholder="Button Label"
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium"
                />
                <input
                  type="text"
                  value={btn.url}
                  onChange={(e) => {
                    const next = [...contact.buttons];
                    next[idx] = { ...btn, url: e.target.value };
                    updateDraftData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, buttons: next },
                    }));
                  }}
                  placeholder="URL (https://wa.me/... or tel:...)"
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm sm:col-span-2"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={btn.variant}
                    onChange={(e) => {
                      const next = [...contact.buttons];
                      next[idx] = {
                        ...btn,
                        variant:
                          e.target.value === 'primary' ? 'primary' : 'ghost',
                      };
                      updateDraftData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, buttons: next },
                      }));
                    }}
                    className="flex-1 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="primary">Primary Solid</option>
                    <option value="ghost">Outline / Ghost</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          buttons: prev.contact.buttons.filter(
                            (b) => b.id !== btn.id
                          ),
                        },
                      }))
                    }
                    className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
