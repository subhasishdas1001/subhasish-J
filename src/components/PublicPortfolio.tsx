import React, { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { SocialIcon } from './SocialIcon';
import { PortfolioProject } from '../types/portfolio';
import { Eye, ArrowLeft, Settings } from 'lucide-react';

interface PublicPortfolioProps {
  onNavigateAdmin: () => void;
  forceDraftPreview?: boolean;
}

export const PublicPortfolio: React.FC<PublicPortfolioProps> = ({
  onNavigateAdmin,
  forceDraftPreview = false,
}) => {
  const {
    publishedData,
    draftData,
    projects,
    isAdmin,
    isPreviewingDraft,
    setIsPreviewingDraft,
    hasUnpublishedChanges,
    publishWebsite,
    isSaving,
  } = usePortfolio();

  const useDraft = forceDraftPreview || (isAdmin && isPreviewingDraft);
  const siteData = useDraft ? draftData : publishedData;
  const {
    hero,
    about,
    services,
    skills,
    process,
    contact,
    socials,
    appearance,
    seo,
    navigation,
    footer,
  } = siteData;

  // Theme state (light / dark) initialized from localStorage or appearance.defaultTheme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('t');
    if (saved === 'dark' || saved === 'light') return saved;
    return appearance.defaultTheme || 'light';
  });

  // Mobile Menu & Three-Dot Dropdown Menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dotsMenuOpen, setDotsMenuOpen] = useState(false);
  const dotsWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dotsWrapRef.current &&
        !dotsWrapRef.current.contains(e.target as Node)
      ) {
        setDotsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDotsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Project Detail state (supports both #p-<id> hash and click navigation)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const h = window.location.hash;
    return h.startsWith('#p-') ? h.slice(3) : null;
  });
  const [slideIndex, setSlideIndex] = useState(0);

  // Hero interactive pointer coordinates & tilt
  const heroRef = useRef<HTMLElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const procRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync theme to document.documentElement for [data-theme="dark"]
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('t', theme);
  }, [theme]);

  // Listen to hashchange for #p-<id> project detail pages
  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash;
      if (h.startsWith('#p-')) {
        setActiveProjectId(h.slice(3));
        setSlideIndex(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveProjectId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter projects for public view (or show all in draft preview mode)
  const visibleProjects = projects
    .filter((p) => (useDraft ? true : p.status === 'published'))
    .sort((a, b) => a.order - b.order);

  const activeProject: PortfolioProject | undefined = activeProjectId
    ? visibleProjects.find((p) => p.id === activeProjectId) ||
      projects.find((p) => p.id === activeProjectId)
    : undefined;

  // Dynamic SEO updates (<title>, meta description, keywords, OG tags, favicon, canonical)
  useEffect(() => {
    const title = activeProject
      ? activeProject.seoTitle || `${activeProject.title} — ${seo.siteTitle}`
      : seo.siteTitle;
    const desc = activeProject
      ? activeProject.seoDesc || activeProject.shortDesc || seo.metaDescription
      : seo.metaDescription;

    document.title = title;

    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) el.setAttribute('property', propMatch[1]);
        } else {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) el.setAttribute('name', nameMatch[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[name="keywords"]', 'content', seo.keywords);
    setMeta('meta[name="author"]', 'content', seo.author);
    setMeta('meta[name="robots"]', 'content', seo.robots || 'index,follow');
    setMeta('meta[property="og:title"]', 'content', activeProject ? title : seo.ogTitle || title);
    setMeta(
      'meta[property="og:description"]',
      'content',
      activeProject ? desc : seo.ogDescription || desc
    );
    if (seo.ogImage) {
      setMeta('meta[property="og:image"]', 'content', seo.ogImage);
    }

    const fav = appearance.faviconUrl || seo.faviconUrl;
    if (fav) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = fav;
    }

    if (seo.canonicalUrl) {
      let canon = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!canon) {
        canon = document.createElement('link');
        canon.rel = 'canonical';
        document.head.appendChild(canon);
      }
      canon.href = seo.canonicalUrl;
    }
  }, [seo, appearance.faviconUrl, activeProject]);

  // IntersectionObserver for scroll reveal (.rv) and process progress line (#proc)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const rvNodes = root.querySelectorAll('.rv');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            if (e.target.id === 'proc') {
              (e.target as HTMLElement).style.setProperty('--p', '100%');
            }
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    rvNodes.forEach((el) => io.observe(el));
    if (procRef.current) io.observe(procRef.current);

    return () => io.disconnect();
  }, [activeProjectId, services.length, visibleProjects.length, process.steps.length]);

  // Hero pointermove glow & portrait 3D tilt (exact behavior from original index.html)
  const handleHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const r = heroEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    heroEl.style.setProperty('--mx', x + '%');
    heroEl.style.setProperty('--my', y + '%');

    if (portraitRef.current && window.innerWidth > 860) {
      const rx = (y - 50) / -14;
      const ry = (x - 50) / 14;
      portraitRef.current.style.transform = `perspective(900px) rotateX(${rx.toFixed(
        2
      )}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
  };

  const handleHeroPointerLeave = () => {
    if (portraitRef.current) {
      portraitRef.current.style.transform = '';
    }
  };

  // Compute dynamic CSS variables from Appearance settings
  const isDark = theme === 'dark';
  const btnRadius =
    appearance.buttonStyle === 'sharp'
      ? '6px'
      : appearance.buttonStyle === 'rounded'
      ? '12px'
      : '99px';
  const secPy =
    appearance.sectionSpacing === 'compact'
      ? '52px'
      : appearance.sectionSpacing === 'spacious'
      ? '104px'
      : '76px';

  const dynamicStyle = {
    '--bg': isDark ? appearance.bgDark : appearance.bgLight,
    '--surf': isDark ? appearance.surfaceDark : appearance.surfaceLight,
    '--ink': isDark ? appearance.textDark : appearance.textLight,
    '--acc': isDark ? appearance.accentDark : appearance.accentLight,
    '--r': `${appearance.borderRadius ?? 20}px`,
    '--btn-r': btnRadius,
    '--sec-py': secPy,
    '--font-heading': `'${appearance.headingFont || 'Fraunces'}', serif`,
    '--font-body': `'${appearance.bodyFont || 'Manrope'}', system-ui, sans-serif`,
  } as React.CSSProperties;

  const visibleNav = [...navigation]
    .filter((n) => n.visible)
    .sort((a, b) => a.order - b.order);

  const visibleFooterLinks = [...footer.links]
    .filter((n) => n.visible)
    .sort((a, b) => a.order - b.order);

  const enabledSocials = [...socials]
    .filter((s) => s.enabled && s.url.trim() !== '')
    .sort((a, b) => a.order - b.order);

  const sortedServices = [...services].sort((a, b) => a.order - b.order);
  const sortedSteps = [...process.steps].sort((a, b) => a.order - b.order);

  // Project Detail Gallery Images
  const projectImages = activeProject
    ? activeProject.gallery && activeProject.gallery.length > 0
      ? activeProject.gallery
      : activeProject.img
      ? [activeProject.img]
      : []
    : [];

  const openProjectDetail = (projectId: string) => {
    window.location.hash = `#p-${projectId}`;
    setActiveProjectId(projectId);
    setSlideIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProjectDetail = () => {
    if (window.location.hash.startsWith('#p-')) {
      history.pushState(
        '',
        document.title,
        window.location.pathname + window.location.search
      );
    }
    setActiveProjectId(null);
  };

  return (
    <div ref={containerRef} className="portfolio-site" style={dynamicStyle}>
      {/* Admin Floating Toolbar when logged in */}
      {isAdmin && !forceDraftPreview && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/95 px-4 py-2 text-xs font-medium text-stone-100 shadow-2xl backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isPreviewingDraft ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            {isPreviewingDraft ? 'Draft Preview Mode' : 'Viewing Live Site'}
          </span>
          <button
            type="button"
            onClick={() => setIsPreviewingDraft(!isPreviewingDraft)}
            className="ml-2 inline-flex items-center gap-1 rounded-full bg-stone-800 px-3 py-1 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewingDraft ? 'Switch to Live' : 'Preview Draft'}
          </button>
          {hasUnpublishedChanges && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => publishWebsite('Quick Publish from Preview')}
              className="rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-500 transition disabled:opacity-50"
            >
              {isSaving ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-900 hover:bg-stone-200 transition"
          >
            <Settings className="h-3.5 w-3.5" />
            Admin Panel
          </button>
        </div>
      )}

      {/* Header Navigation */}
      <header className="nav">
        <div className="w navin">
          <a
            href="#top"
            onClick={(e) => {
              if (activeProjectId) {
                e.preventDefault();
                closeProjectDetail();
              }
            }}
            className="logo"
          >
            {appearance.logoImage ? (
              <img
                src={appearance.logoImage}
                alt={appearance.logoText || 'Logo'}
                style={{ height: '28px', width: 'auto', borderRadius: '6px' }}
              />
            ) : (
              <span className="dot" />
            )}
            <span>{appearance.logoText || 'Subhasish'}</span>
          </a>

          <nav className="links" aria-label="Primary">
            {visibleNav.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={() => {
                  if (activeProjectId && item.url.startsWith('#')) {
                    closeProjectDetail();
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nact">
            <button
              className="ibtn"
              id="tbtn"
              type="button"
              aria-label="Toggle theme"
              title="Toggle light/dark mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀' : '◐'}
            </button>

            <div className="dots-wrap" ref={dotsWrapRef}>
              <button
                className="ibtn"
                id="dots-btn"
                type="button"
                aria-label="More options"
                aria-expanded={dotsMenuOpen}
                title="Options menu"
                onClick={() => setDotsMenuOpen((prev) => !prev)}
              >
                ⋮
              </button>

              {dotsMenuOpen && (
                <div className="dots-menu" role="menu" aria-label="Options">
                  <a
                    href="/admin"
                    role="menuitem"
                    className="dots-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setDotsMenuOpen(false);
                      setMobileMenuOpen(false);
                      onNavigateAdmin();
                    }}
                  >
                    <span>Admin Panel</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}
            </div>

            <button
              className="ibtn mbtn"
              id="mbtn"
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mmenu" className="mmenu">
            {visibleNav.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.url === '/admin' || item.url === '#admin') {
                    e.preventDefault();
                    onNavigateAdmin();
                    return;
                  }
                  if (activeProjectId && item.url.startsWith('#')) {
                    closeProjectDetail();
                  }
                }}
              >
                {item.label}
              </a>
            ))}
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              style={{
                color: 'var(--acc)',
                fontWeight: 600,
                paddingTop: '4px',
                borderTop: '1px solid var(--line)',
              }}
            >
              Admin Panel →
            </a>
          </div>
        )}
      </header>

      {/* Main Public Homepage vs Project Detail View */}
      {!activeProject ? (
        <main id="home" className="view on">
          {/* HERO SECTION */}
          <section
            className="hero"
            id="top"
            ref={heroRef}
            onPointerMove={handleHeroPointerMove}
            onPointerLeave={handleHeroPointerLeave}
          >
            <div className="w hgrid">
              <div>
                {hero.label && (
                  <div className="tag">
                    <span className="dot" />
                    {hero.label}
                  </div>
                )}
                <h1>
                  {hero.headingPrefix}{' '}
                  {hero.headingHighlight && <em>{hero.headingHighlight}</em>}{' '}
                  {hero.headingSuffix}
                </h1>
                <p>{hero.subtitle}</p>
                <div className="cta-row">
                  {hero.primaryBtnText && (
                    <a className="btn p" href={hero.primaryBtnLink || '#work'}>
                      {hero.primaryBtnText}
                    </a>
                  )}
                  {hero.secondaryBtnText && (
                    <a className="btn" href={hero.secondaryBtnLink || '#contact'}>
                      {hero.secondaryBtnText}
                    </a>
                  )}
                </div>
              </div>

              <div className="pwrap">
                <div className="ph" ref={portraitRef}>
                  {hero.portraitImg ? (
                    <img
                      src={hero.portraitImg}
                      alt={`${appearance.logoText || 'Subhasish'} — ${hero.label}`}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--mut)',
                      }}
                    >
                      No Portrait
                    </div>
                  )}
                </div>
                {hero.showFloatingCard !== false &&
                  (hero.floatingCardTitle || hero.floatingCardSubtitle) && (
                    <div className="chip">
                      <b>{hero.floatingCardTitle}</b>
                      {hero.floatingCardSubtitle && (
                        <small>{hero.floatingCardSubtitle}</small>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className="about">
            <div className="w split">
              <div>
                <span className="slabel">{about.label || 'About'}</span>
                <h2>{about.heading}</h2>
                {about.showProfileImage && about.profileImage && (
                  <div
                    style={{
                      marginTop: '20px',
                      maxWidth: '240px',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <img
                      src={about.profileImage}
                      alt={about.heading}
                      style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p>{about.description}</p>
                {about.highlights && about.highlights.length > 0 && (
                  <div className="pts">
                    {about.highlights.map((pt) => (
                      <div key={pt.id} className="pt">
                        <b>{pt.title}</b>
                        <span>{pt.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SERVICES SECTION */}
          <section id="services">
            <div className="w">
              <div className="sh">
                <div>
                  <span className="slabel">Services</span>
                  <h2>What I can build for you</h2>
                </div>
              </div>
              <div className="grid4">
                {sortedServices.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="card rv"
                    style={{ transitionDelay: `${(idx % 4) * 60}ms` }}
                  >
                    <div className="ico">{srv.icon || '▣'}</div>
                    <h3>{srv.title}</h3>
                    <p>{srv.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PROJECTS / PORTFOLIO SECTION */}
          <section id="work">
            <div className="w">
              <div className="sh">
                <div>
                  <span className="slabel">Portfolio</span>
                  <h2>Selected work</h2>
                </div>
                <p>Real projects designed and built with care.</p>
              </div>
              <div className="grid2" id="pgrid">
                {visibleProjects.map((p, idx) => {
                  const isPlaceholderCard =
                    !p.url && !p.img && p.id === 'next';

                  if (isPlaceholderCard) {
                    return (
                      <article
                        key={p.id}
                        className="pcard addc rv"
                        style={{ transitionDelay: `${(idx % 4) * 60}ms` }}
                      >
                        <span className="cat">{p.cat || 'More work'}</span>
                        <h3>{p.title}</h3>
                        <p>{p.shortDesc}</p>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={p.id}
                      className="pcard rv"
                      style={{ transitionDelay: `${(idx % 4) * 60}ms` }}
                    >
                      <a
                        href={`#p-${p.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openProjectDetail(p.id);
                        }}
                        className="pimg"
                        aria-label={p.title}
                      >
                        {p.img ? (
                          <img src={p.img} alt={p.title} loading="lazy" />
                        ) : (
                          <div className="pl">{p.title}</div>
                        )}
                      </a>
                      <div className="pbody">
                        <div className="pmeta">
                          <span className="cat">{p.cat}</span>
                          {p.status === 'draft' && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#d97706',
                                fontWeight: 700,
                              }}
                            >
                              DRAFT
                            </span>
                          )}
                        </div>
                        <h3>{p.title}</h3>
                        <p>{p.shortDesc}</p>
                        <div className="pfoot">
                          <a
                            href={`#p-${p.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              openProjectDetail(p.id);
                            }}
                          >
                            View details →
                          </a>
                          {p.url ? (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Live ↗
                            </a>
                          ) : (
                            <span />
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SKILLS SECTION */}
          <section id="skills">
            <div className="w split">
              <div>
                <span className="slabel">{skills.label || 'Skills'}</span>
                <h2>{skills.heading || 'Areas I work in'}</h2>
              </div>
              <div>
                {skills.showCategories && skills.categories.length > 1 ? (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {skills.categories.map((cat) => (
                      <div key={cat.id}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--mut)',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {cat.name}
                        </div>
                        <div className="tags">
                          {cat.skills.map((sk, i) => (
                            <span key={`${cat.id}-${i}`} className="pill">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tags">
                    {skills.categories
                      .flatMap((c) => c.skills)
                      .map((sk, idx) => (
                        <span
                          key={`${sk}-${idx}`}
                          className="pill rv in"
                          style={{ transitionDelay: `${(idx % 4) * 60}ms` }}
                        >
                          {sk}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PROCESS SECTION */}
          <section id="process">
            <div className="w">
              <div className="sh">
                <div>
                  <span className="slabel">{process.label || 'Process'}</span>
                  <h2>{process.heading || 'How I work'}</h2>
                </div>
              </div>
              <div className="steps" id="proc" ref={procRef}>
                {sortedSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="step rv"
                    style={{ transitionDelay: `${(idx % 4) * 60}ms` }}
                  >
                    <div className="num">{step.number}</div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact">
            <div className="w">
              <div className="cta">
                <span className="slabel">Get in touch</span>
                <h2>{contact.heading}</h2>
                <p>{contact.description}</p>
                <div
                  className="cta-row"
                  style={{ justifyContent: 'center', marginTop: '6px' }}
                >
                  {contact.buttons.map((btn) => (
                    <a
                      key={btn.id}
                      className={btn.variant === 'primary' ? 'btn p' : 'btn'}
                      href={btn.url}
                      target={
                        btn.url.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        btn.url.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
                <div className="cinfo">
                  {contact.phone && (
                    <a href={`tel:+91${contact.phone.replace(/^\+?91/, '')}`}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {contact.phone}
                    </a>
                  )}
                  {enabledSocials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon platform={soc.platform} size={15} />
                      {soc.handle || soc.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* PROJECT DETAIL VIEW (#pview) */
        <section id="pview" className="view on">
          <div className="w">
            <button
              type="button"
              className="btn"
              onClick={closeProjectDetail}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </button>

            <div className="pvh">
              <div>
                <span className="slabel" id="pv-cat">
                  {activeProject.cat}
                </span>
                <h1
                  id="pv-title"
                  style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}
                >
                  {activeProject.title}
                </h1>
              </div>
              {activeProject.url && (
                <a
                  id="pv-live"
                  className="btn p"
                  href={activeProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Live Website ↗
                </a>
              )}
            </div>

            <div className="pvimg" id="pv-img">
              {projectImages.length > 0 ? (
                <>
                  <div
                    className="pvtrack"
                    id="ptrack"
                    style={{
                      transform: `translateX(-${slideIndex * 100}%)`,
                    }}
                  >
                    {projectImages.map((src, i) => (
                      <div key={i} className="pvslide">
                        <img
                          src={src}
                          alt={`${activeProject.title} screenshot ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  {projectImages.length > 1 && (
                    <>
                      <div className="pvnav">
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={() =>
                            setSlideIndex(
                              (slideIndex - 1 + projectImages.length) %
                                projectImages.length
                            )
                          }
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() =>
                            setSlideIndex(
                              (slideIndex + 1) % projectImages.length
                            )
                          }
                        >
                          ›
                        </button>
                      </div>
                      <div className="pvdots" id="pdots">
                        {projectImages.map((_, idx) => (
                          <i
                            key={idx}
                            className={idx === slideIndex ? 'on' : ''}
                            onClick={() => setSlideIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  className="pl"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2rem',
                    color: 'var(--mut)',
                  }}
                >
                  {activeProject.title}
                </div>
              )}
            </div>

            <div className="pvgrid">
              <div>
                <h3 style={{ marginBottom: '10px' }}>About the project</h3>
                <p
                  id="pv-desc"
                  style={{
                    fontSize: '1.04rem',
                    color: 'var(--ink)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {activeProject.desc || activeProject.shortDesc}
                </p>
              </div>
              <div className="pvbox">
                <div>
                  <span className="slabel">Category &amp; Tags</span>
                  <div
                    className="tags"
                    id="pv-tags"
                    style={{ marginTop: '6px' }}
                  >
                    {(activeProject.tags && activeProject.tags.length > 0
                      ? activeProject.tags
                      : [activeProject.cat]
                    ).map((t, i) => (
                      <span key={i} className="pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {activeProject.year && (
                  <div>
                    <span className="slabel">Year</span>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {activeProject.year}
                    </div>
                  </div>
                )}
                {activeProject.url && (
                  <div>
                    <span className="slabel">Live Link</span>
                    <div>
                      <a
                        id="pv-url"
                        href={activeProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--acc)',
                          fontWeight: 600,
                          wordBreak: 'break-all',
                        }}
                      >
                        {activeProject.url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <div className="w fin">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {footer.logoImage && (
              <img
                src={footer.logoImage}
                alt={footer.brandName}
                style={{ height: '22px', width: 'auto', borderRadius: '4px' }}
              />
            )}
            <span>
              {footer.description ||
                `${footer.brandName} — ${footer.tagline}`}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '18px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {visibleFooterLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                onClick={(e) => {
                  if (link.url === '/admin' || link.url === '#admin') {
                    e.preventDefault();
                    onNavigateAdmin();
                    return;
                  }
                  if (activeProjectId && link.url.startsWith('#')) {
                    closeProjectDetail();
                  }
                }}
              >
                {link.label}
              </a>
            ))}
            {footer.showSocialIcons &&
              enabledSocials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <SocialIcon platform={soc.platform} size={15} />
                  <span>{soc.name}</span>
                </a>
              ))}
          </div>

          <div>{footer.copyrightText}</div>
        </div>
      </footer>
    </div>
  );
};
