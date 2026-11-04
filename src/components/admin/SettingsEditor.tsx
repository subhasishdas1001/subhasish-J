import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialIcon } from '../SocialIcon';
import { SocialPlatform } from '../../types/portfolio';
import { DEFAULT_PORTFOLIO_DATA } from '../../data/defaultPortfolioData';
import { compressImageFile } from '../../utils/imageUtils';
import { PublicPortfolio } from '../PublicPortfolio';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Send,
  Upload,
  RotateCcw,
  Eye,
  Download,
  FileUp,
  ShieldCheck,
} from 'lucide-react';

interface SettingsEditorProps {
  activeTab:
    | 'socials'
    | 'appearance'
    | 'seo'
    | 'navigation'
    | 'footer'
    | 'admin-settings';
}

const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'behance', label: 'Behance' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'custom', label: 'Custom Platform' },
];

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  activeTab,
}) => {
  const {
    user,
    draftData,
    projects,
    updateDraftData,
    saveDraft,
    publishWebsite,
    saveProject,
    resetToFactoryDefaults,
    importFullBackup,
    isSaving,
    showToast,
  } = usePortfolio();

  const [showAppearancePreview, setShowAppearancePreview] = useState(false);
  const [confirmFactoryReset, setConfirmFactoryReset] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);

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
   * 9. SOCIAL MEDIA LINKS MANAGER
   * ========================================================================== */
  if (activeTab === 'socials') {
    const sortedSocials = [...draftData.socials].sort(
      (a, b) => a.order - b.order
    );

    const moveSocial = (idx: number, dir: -1 | 1) => {
      const target = idx + dir;
      if (target < 0 || target >= sortedSocials.length) return;
      const list = [...sortedSocials];
      const [moved] = list.splice(idx, 1);
      list.splice(target, 0, moved);
      const reindexed = list.map((s, i) => ({ ...s, order: i + 1 }));
      updateDraftData((prev) => ({ ...prev, socials: reindexed }));
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Social Media Links Manager"
          subtitle="Add, edit, enable, disable, or reorder your social profiles for the contact section and footer."
          sectionName="Social Media Links"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              updateDraftData((prev) => ({
                ...prev,
                socials: [
                  ...prev.socials,
                  {
                    id: `soc-${Date.now()}`,
                    platform: 'custom',
                    name: 'Custom Social',
                    handle: '@subhasish',
                    url: 'https://',
                    enabled: true,
                    order: prev.socials.length + 1,
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Social Link
          </button>
        </div>

        <div className="space-y-3">
          {sortedSocials.map((soc, idx) => (
            <div
              key={soc.id}
              className={`rounded-2xl border p-4 transition ${
                soc.enabled
                  ? 'border-stone-200 bg-white shadow-xs'
                  : 'border-stone-200/60 bg-stone-50/70 opacity-75'
              }`}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                {/* Icon & Platform Select */}
                <div className="flex items-center gap-3 sm:col-span-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700">
                    <SocialIcon platform={soc.platform} size={18} />
                  </div>
                  <select
                    value={soc.platform}
                    onChange={(e) => {
                      const pf = e.target.value as SocialPlatform;
                      const label =
                        SOCIAL_PLATFORMS.find((p) => p.value === pf)?.label ||
                        soc.name;
                      updateDraftData((prev) => ({
                        ...prev,
                        socials: prev.socials.map((s) =>
                          s.id === soc.id
                            ? { ...s, platform: pf, name: label }
                            : s
                        ),
                      }));
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold text-stone-900"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Platform Display Name */}
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={soc.name}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        socials: prev.socials.map((s) =>
                          s.id === soc.id ? { ...s, name: e.target.value } : s
                        ),
                      }))
                    }
                    placeholder="Platform Name"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium"
                  />
                </div>

                {/* Handle / Label */}
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={soc.handle}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        socials: prev.socials.map((s) =>
                          s.id === soc.id ? { ...s, handle: e.target.value } : s
                        ),
                      }))
                    }
                    placeholder="@handle"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
                  />
                </div>

                {/* URL */}
                <div className="sm:col-span-3">
                  <input
                    type="url"
                    value={soc.url}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        socials: prev.socials.map((s) =>
                          s.id === soc.id ? { ...s, url: e.target.value } : s
                        ),
                      }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
                  />
                </div>

                {/* Visibility & Order Controls */}
                <div className="flex items-center justify-between gap-2 sm:col-span-2 sm:justify-end">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soc.enabled}
                      onChange={(e) =>
                        updateDraftData((prev) => ({
                          ...prev,
                          socials: prev.socials.map((s) =>
                            s.id === soc.id
                              ? { ...s, enabled: e.target.checked }
                              : s
                          ),
                        }))
                      }
                      className="h-4 w-4 rounded text-orange-600"
                    />
                    {soc.enabled ? 'Visible' : 'Hidden'}
                  </label>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveSocial(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSocial(idx, 1)}
                      disabled={idx === sortedSocials.length - 1}
                      className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftData((prev) => ({
                          ...prev,
                          socials: prev.socials.filter((s) => s.id !== soc.id),
                        }))
                      }
                      className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
   * 10. WEBSITE APPEARANCE SETTINGS
   * ========================================================================== */
  if (activeTab === 'appearance') {
    const { appearance } = draftData;

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingAsset(true);
      try {
        const dataUrl = await compressImageFile(file, 400, 0.85);
        updateDraftData((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, logoImage: dataUrl },
        }));
        showToast('Logo image uploaded to draft.', 'success');
      } catch {
        showToast('Failed to upload logo.', 'error');
      } finally {
        setUploadingAsset(false);
        e.target.value = '';
      }
    };

    const handleFaviconUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingAsset(true);
      try {
        const dataUrl = await compressImageFile(file, 128, 0.9);
        updateDraftData((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, faviconUrl: dataUrl },
          seo: { ...prev.seo, faviconUrl: dataUrl },
        }));
        showToast('Favicon uploaded to draft.', 'success');
      } catch {
        showToast('Failed to upload favicon.', 'error');
      } finally {
        setUploadingAsset(false);
        e.target.value = '';
      }
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Website Appearance &amp; Theme Customization"
          subtitle="Customize colors, typography, light/dark mode defaults, button styles, spacing, and live preview before publishing."
          sectionName="Website Appearance"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAppearancePreview(!showAppearancePreview)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                showAppearancePreview
                  ? 'bg-stone-900 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              <Eye className="h-4 w-4" />
              {showAppearancePreview
                ? 'Hide Live Theme Preview'
                : 'Open Interactive Live Preview'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              updateDraftData((prev) => ({
                ...prev,
                appearance: DEFAULT_PORTFOLIO_DATA.appearance,
              }));
              showToast('Restored original portfolio colors and typography in draft.', 'info');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Original Theme
          </button>
        </div>

        {showAppearancePreview && (
          <div className="overflow-hidden rounded-3xl border-2 border-orange-500/40 bg-stone-900 shadow-xl">
            <div className="flex items-center justify-between bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white">
              <span>Live Draft Theme Preview (Interactive)</span>
              <button
                type="button"
                onClick={() => setShowAppearancePreview(false)}
                className="rounded bg-stone-800 px-2.5 py-1 hover:bg-stone-700"
              >
                Close Preview
              </button>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              <PublicPortfolio
                onNavigateAdmin={() => setShowAppearancePreview(false)}
                forceDraftPreview={true}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Light Mode Palette */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Light Mode Color Palette
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Primary Accent Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.accentLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          accentLight: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.accentLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          accentLight: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Background Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.bgLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          bgLight: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.bgLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          bgLight: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Card Surface Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.surfaceLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          surfaceLight: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.surfaceLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          surfaceLight: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Primary Text Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.textLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          textLight: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.textLight}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          textLight: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dark Mode Palette */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Dark Mode Color Palette
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Dark Accent Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.accentDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          accentDark: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.accentDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          accentDark: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Dark Background Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.bgDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          bgDark: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.bgDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          bgDark: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Dark Surface Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.surfaceDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          surfaceDark: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.surfaceDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          surfaceDark: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Dark Text Color
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.textDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          textDark: e.target.value,
                        },
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-stone-200"
                  />
                  <input
                    type="text"
                    value={appearance.textDark}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          textDark: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography, Layout & Buttons */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Fonts, Buttons &amp; Layout Spacing
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Heading Font
                </label>
                <select
                  value={appearance.headingFont}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        headingFont: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="Fraunces">Fraunces (Original Editorial Serif)</option>
                  <option value="Georgia">Georgia (Classic Serif)</option>
                  <option value="Manrope">Manrope (Modern Geometric Sans)</option>
                  <option value="system-ui">System Sans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Body Font
                </label>
                <select
                  value={appearance.bodyFont}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        bodyFont: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="Manrope">Manrope (Original Clean Sans)</option>
                  <option value="system-ui">System Default Sans</option>
                  <option value="Fraunces">Fraunces</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Default Theme Mode
                </label>
                <select
                  value={appearance.defaultTheme}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        defaultTheme:
                          e.target.value === 'dark' ? 'dark' : 'light',
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="light">Light Mode Default</option>
                  <option value="dark">Dark Mode Default</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Button Corner Style
                </label>
                <select
                  value={appearance.buttonStyle}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        buttonStyle: e.target.value as
                          | 'pill'
                          | 'rounded'
                          | 'sharp',
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="pill">Pill Buttons (99px — Original)</option>
                  <option value="rounded">Rounded Buttons (12px)</option>
                  <option value="sharp">Sharp Minimal Buttons (6px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Section Vertical Spacing
                </label>
                <select
                  value={appearance.sectionSpacing}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        sectionSpacing: e.target.value as
                          | 'compact'
                          | 'normal'
                          | 'spacious',
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="compact">Compact (52px)</option>
                  <option value="normal">Normal (76px — Original)</option>
                  <option value="spacious">Spacious (104px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Card Border Radius ({appearance.borderRadius}px)
                </label>
                <input
                  type="range"
                  min={0}
                  max={36}
                  value={appearance.borderRadius}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        borderRadius: Number(e.target.value),
                      },
                    }))
                  }
                  className="mt-3 w-full accent-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Branding Assets (Logo & Favicon) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Website Logo &amp; Favicon
            </h3>
            <div>
              <label className="block text-xs font-medium text-stone-500">
                Header Brand Text
              </label>
              <input
                type="text"
                value={appearance.logoText}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      logoText: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                <span className="text-xs font-bold text-stone-700">
                  Logo Mark Image (Optional)
                </span>
                {appearance.logoImage && (
                  <img
                    src={appearance.logoImage}
                    alt="Logo"
                    className="h-10 w-auto rounded border border-stone-200 bg-white p-1"
                  />
                )}
                <div className="flex gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingAsset ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {appearance.logoImage && (
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftData((prev) => ({
                          ...prev,
                          appearance: { ...prev.appearance, logoImage: '' },
                        }))
                      }
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                <span className="text-xs font-bold text-stone-700">
                  Browser Favicon
                </span>
                {appearance.faviconUrl && (
                  <img
                    src={appearance.faviconUrl}
                    alt="Favicon"
                    className="h-8 w-8 rounded border border-stone-200 bg-white p-1"
                  />
                )}
                <div className="flex gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Favicon
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 11. SEO SETTINGS MANAGER
   * ========================================================================== */
  if (activeTab === 'seo') {
    const { seo } = draftData;

    const handleOgImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingAsset(true);
      try {
        const dataUrl = await compressImageFile(file, 1200, 0.8);
        updateDraftData((prev) => ({
          ...prev,
          seo: { ...prev.seo, ogImage: dataUrl },
        }));
        showToast('Social sharing OG image uploaded.', 'success');
      } catch {
        showToast('Failed to upload OG image.', 'error');
      } finally {
        setUploadingAsset(false);
        e.target.value = '';
      }
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Global &amp; Page SEO Management"
          subtitle="Manage search engine titles, meta descriptions, keywords, Open Graph sharing cards, canonical URLs, and project SEO."
          sectionName="SEO Settings"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Global Meta Tags */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Global Search Engine Metadata
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Website Title
              </label>
              <input
                type="text"
                value={seo.siteTitle}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, siteTitle: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                SEO Keywords (Comma-Separated)
              </label>
              <textarea
                rows={2}
                value={seo.keywords}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, keywords: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seo.canonicalUrl}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, canonicalUrl: e.target.value },
                    }))
                  }
                  placeholder="https://subhasish.com/"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Author Meta
                </label>
                <input
                  type="text"
                  value={seo.author}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, author: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Open Graph Social Sharing */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Open Graph &amp; Social Sharing Card
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Open Graph Title
              </label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, ogTitle: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Open Graph Description
              </label>
              <textarea
                rows={3}
                value={seo.ogDescription}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, ogDescription: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Social Sharing Image (OG Image)
              </label>
              {seo.ogImage && (
                <div className="mt-2 aspect-16/9 max-w-xs overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <img
                    src={seo.ogImage}
                    alt="OG Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingAsset ? 'Uploading...' : 'Upload Social Share Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageUpload}
                    className="hidden"
                  />
                </label>
                {seo.ogImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, ogImage: '' },
                      }))
                    }
                    className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project-Specific SEO Quick Editor */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">
            Project Detail Pages SEO
          </h3>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-3">
                  <div className="text-xs font-bold text-stone-900">
                    {proj.title}
                  </div>
                  <div className="text-[11px] text-stone-500">#p-{proj.id}</div>
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    defaultValue={proj.seoTitle}
                    onBlur={(e) => {
                      if (e.target.value !== proj.seoTitle) {
                        saveProject(
                          { ...proj, seoTitle: e.target.value },
                          false
                        );
                      }
                    }}
                    placeholder="SEO Title"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    defaultValue={proj.seoDesc}
                    onBlur={(e) => {
                      if (e.target.value !== proj.seoDesc) {
                        saveProject({ ...proj, seoDesc: e.target.value }, false);
                      }
                    }}
                    placeholder="SEO Meta Description"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 12. NAVIGATION SETTINGS
   * ========================================================================== */
  if (activeTab === 'navigation') {
    const sortedNav = [...draftData.navigation].sort(
      (a, b) => a.order - b.order
    );

    const moveNav = (idx: number, dir: -1 | 1) => {
      const target = idx + dir;
      if (target < 0 || target >= sortedNav.length) return;
      const list = [...sortedNav];
      const [moved] = list.splice(idx, 1);
      list.splice(target, 0, moved);
      const reindexed = list.map((n, i) => ({ ...n, order: i + 1 }));
      updateDraftData((prev) => ({ ...prev, navigation: reindexed }));
    };

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Header Navigation Menu Manager"
          subtitle="Add, rename, change URLs, hide/show, or reorder top navigation links."
          sectionName="Navigation Settings"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              updateDraftData((prev) => ({
                ...prev,
                navigation: [
                  ...prev.navigation,
                  {
                    id: `nav-${Date.now()}`,
                    label: 'New Link',
                    url: '#work',
                    visible: true,
                    order: prev.navigation.length + 1,
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </button>
        </div>

        <div className="space-y-3">
          {sortedNav.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
            >
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-400">
                    Menu Label
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        navigation: prev.navigation.map((n) =>
                          n.id === item.id ? { ...n, label: e.target.value } : n
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400">
                    Target Anchor / URL
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        navigation: prev.navigation.map((n) =>
                          n.id === item.id ? { ...n, url: e.target.value } : n
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 sm:pt-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) =>
                      updateDraftData((prev) => ({
                        ...prev,
                        navigation: prev.navigation.map((n) =>
                          n.id === item.id
                            ? { ...n, visible: e.target.checked }
                            : n
                        ),
                      }))
                    }
                    className="h-4 w-4 rounded text-orange-600"
                  />
                  {item.visible ? 'Visible' : 'Hidden'}
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveNav(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNav(idx, 1)}
                    disabled={idx === sortedNav.length - 1}
                    className="rounded p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraftData((prev) => ({
                        ...prev,
                        navigation: prev.navigation.filter(
                          (n) => n.id !== item.id
                        ),
                      }))
                    }
                    className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 13. FOOTER SETTINGS
   * ========================================================================== */
  if (activeTab === 'footer') {
    const { footer } = draftData;
    const sortedLinks = [...footer.links].sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-6">
        <ActionHeader
          title="Footer Settings &amp; Links"
          subtitle="Manage footer brand text, copyright statement, social icons display, and footer navigation links."
          sectionName="Footer Settings"
        />

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Brand Name
              </label>
              <input
                type="text"
                value={footer.brandName}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, brandName: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Footer Description Line
              </label>
              <input
                type="text"
                value={footer.description}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, description: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Copyright Text
              </label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={(e) =>
                  updateDraftData((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, copyrightText: e.target.value },
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footer.showSocialIcons}
                  onChange={(e) =>
                    updateDraftData((prev) => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        showSocialIcons: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4 rounded text-orange-600"
                />
                Display Enabled Social Media Links in Footer
              </label>
            </div>
          </div>

          {/* Footer Navigation Links */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Footer Navigation Links
              </span>
              <button
                type="button"
                onClick={() =>
                  updateDraftData((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      links: [
                        ...prev.footer.links,
                        {
                          id: `fnav-${Date.now()}`,
                          label: 'New Footer Link',
                          url: '#top',
                          visible: true,
                          order: prev.footer.links.length + 1,
                        },
                      ],
                    },
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Footer Link
              </button>
            </div>

            <div className="space-y-2.5">
              {sortedLinks.map((lnk) => (
                <div
                  key={lnk.id}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={lnk.label}
                      onChange={(e) =>
                        updateDraftData((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            links: prev.footer.links.map((l) =>
                              l.id === lnk.id
                                ? { ...l, label: e.target.value }
                                : l
                            ),
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={lnk.url}
                      onChange={(e) =>
                        updateDraftData((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            links: prev.footer.links.map((l) =>
                              l.id === lnk.id
                                ? { ...l, url: e.target.value }
                                : l
                            ),
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between sm:col-span-3 sm:justify-end gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lnk.visible}
                        onChange={(e) =>
                          updateDraftData((prev) => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              links: prev.footer.links.map((l) =>
                                l.id === lnk.id
                                  ? { ...l, visible: e.target.checked }
                                  : l
                              ),
                            },
                          }))
                        }
                        className="rounded text-orange-600"
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftData((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            links: prev.footer.links.filter(
                              (l) => l.id !== lnk.id
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
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * 14. ADMIN SETTINGS & BACKUP / RESTORE
   * ========================================================================== */
  const handleExportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      siteData: draftData,
      projects,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subhasish-portfolio-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Full website JSON backup downloaded.', 'success');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.siteData && Array.isArray(parsed.projects)) {
          await importFullBackup(parsed.siteData, parsed.projects);
        } else {
          showToast('Invalid backup JSON format.', 'error');
        }
      } catch {
        showToast('Could not parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">
          Admin Security, Backup &amp; System Settings
        </h2>
        <p className="text-sm text-stone-500">
          Manage your Firebase administrator session, export/import full website backups, or restore original defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Authenticated Admin Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Firebase Admin Authentication
              </h3>
              <p className="text-xs text-stone-500">
                Protected by Cloud Firestore RBAC Security Rules
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Signed-in Account:</span>
              <span className="font-semibold text-stone-900">
                {user?.email || 'Verified Admin'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">One-Time Setup Lock:</span>
              <span className="font-semibold text-emerald-600">
                Active &amp; Permanently Locked
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Last Draft Update:</span>
              <span className="text-stone-700">
                {new Date(draftData.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Change Firebase Admin Password
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="password"
                id="curr-admin-pass-input"
                autoComplete="off"
                placeholder="Current password"
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs"
              />
              <input
                type="password"
                id="new-admin-pass-input"
                autoComplete="new-password"
                placeholder="New password (min 8 chars)"
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                const currEl = document.getElementById(
                  'curr-admin-pass-input'
                ) as HTMLInputElement | null;
                const newEl = document.getElementById(
                  'new-admin-pass-input'
                ) as HTMLInputElement | null;
                const currVal = currEl?.value || '';
                const newVal = newEl?.value || '';
                if (!currVal || newVal.length < 8) {
                  showToast(
                    'Enter your current password and a new password of at least 8 characters.',
                    'error'
                  );
                  return;
                }
                try {
                  const { updateAdminAccountPassword } = await import(
                    '../../firebase'
                  );
                  await updateAdminAccountPassword(currVal, newVal);
                  if (currEl) currEl.value = '';
                  if (newEl) newEl.value = '';
                  showToast(
                    'Firebase Admin password updated successfully.',
                    'success'
                  );
                } catch (err) {
                  showToast(
                    err instanceof Error
                      ? err.message
                      : 'Failed to update password in Firebase Auth.',
                    'error'
                  );
                }
              }}
              className="rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
            >
              Update Firebase Password
            </button>
          </div>
        </div>

        {/* Backup & Restore Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">
            Backup, Import &amp; Factory Reset
          </h3>
          <p className="text-xs text-stone-500">
            Download a complete JSON snapshot of all sections, settings, and portfolio projects, or restore from a backup file.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export JSON Backup
            </button>

            <label className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
              <FileUp className="h-4 w-4" />
              Import JSON Backup
              <input
                type="file"
                accept="application/json"
                onChange={handleImportBackupFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="border-t border-stone-100 pt-4">
            {!confirmFactoryReset ? (
              <button
                type="button"
                onClick={() => setConfirmFactoryReset(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Entire Website to Original HTML Defaults
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3">
                <span className="text-xs font-medium text-red-800">
                  Restore original text, theme, and 4 initial projects?
                </span>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    await resetToFactoryDefaults();
                    setConfirmFactoryReset(false);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmFactoryReset(false)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs text-stone-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
