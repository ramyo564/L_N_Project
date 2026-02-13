import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
import { templateConfig } from './config.js';

const baseMermaidConfig = {
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear'
    }
};

const mermaidConfig = {
    ...baseMermaidConfig,
    ...(templateConfig.mermaid ?? {}),
    flowchart: {
        ...baseMermaidConfig.flowchart,
        ...(templateConfig.mermaid?.flowchart ?? {})
    }
};

mermaid.initialize(mermaidConfig);

function byId(id) {
    return document.getElementById(id);
}

function normalizeHashTarget(target) {
    if (!target) {
        return '#';
    }
    return target.startsWith('#') ? target : `#${target}`;
}

function toSafeLabel(value) {
    return String(value ?? 'unknown').replace(/[^a-zA-Z0-9_-]+/g, ' ').trim() || 'unknown';
}

function setText(id, value) {
    const el = byId(id);
    if (el && value) {
        el.textContent = value;
    }
}

function setupUptime() {
    const uptimeElement = byId('uptime');
    if (!uptimeElement) {
        return;
    }

    const startTime = new Date();
    const updateUptime = () => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        uptimeElement.textContent = `${h}:${m}:${s}`;
    };

    updateUptime();
    setInterval(updateUptime, 1000);
}

function setupMobileNav() {
    const nav = byId('header-nav');
    const toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) {
        return;
    }

    const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const openNav = () => {
        nav.classList.add('is-open');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (nav.classList.contains('is-open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    nav.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('nav-item')) {
            closeNav();
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        if (!nav.contains(target) && !toggle.contains(target)) {
            closeNav();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}

function setSystemInfo() {
    if (templateConfig.system?.documentTitle) {
        document.title = templateConfig.system.documentTitle;
    }
    setText('system-name', templateConfig.system?.systemName);
}

function renderHero() {
    const hero = templateConfig.hero ?? {};
    const section = byId('system-architecture');
    const metrics = byId('hero-metrics');
    const mermaidContainer = byId('hero-mermaid');

    if (section && hero.sectionId) {
        section.id = hero.sectionId;
    }
    setText('hero-panel-title', hero.panelTitle);
    setText('hero-panel-uid', hero.panelUid);

    if (mermaidContainer && hero.diagramId) {
        mermaidContainer.setAttribute('data-mermaid-id', hero.diagramId);
    }

    if (!metrics) {
        return;
    }
    metrics.replaceChildren();
    renderMetricLines(metrics, hero.metrics, '> Add metrics in templateConfig.hero.metrics');
}

function renderMetricLines(container, lines, fallbackText) {
    const metricLines = Array.isArray(lines) ? lines : [];
    if (metricLines.length === 0) {
        const fallback = document.createElement('p');
        fallback.textContent = fallbackText;
        container.appendChild(fallback);
        return;
    }

    metricLines.forEach((line) => {
        const item = document.createElement('p');
        const cleanLine = String(line).replace(/^>\s*/, '');
        item.textContent = `> ${cleanLine}`;
        container.appendChild(item);
    });
}

function createTopPanel(panel, index) {
    const section = document.createElement('section');
    section.className = `panel hero-panel ${panel.panelClass ?? ''}`.trim();
    section.id = panel.sectionId || `top-panel-${index + 1}`;

    const header = document.createElement('div');
    header.className = 'panel-header';

    const title = document.createElement('span');
    title.className = 'panel-title';
    title.textContent = panel.panelTitle || `TOP_PANEL_${index + 1}`;

    const uid = document.createElement('span');
    uid.className = 'panel-uid';
    uid.textContent = panel.panelUid || `ID: TOP-${String(index + 1).padStart(2, '0')}`;

    header.append(title, uid);

    const graphContainer = document.createElement('div');
    graphContainer.className = 'graph-container';
    const mermaidContainer = document.createElement('div');
    mermaidContainer.className = 'mermaid';
    mermaidContainer.setAttribute('data-mermaid-id', panel.diagramId || '');
    graphContainer.appendChild(mermaidContainer);

    const metrics = document.createElement('div');
    metrics.className = 'hero-message';
    renderMetricLines(metrics, panel.metrics, '> Add metrics in templateConfig.topPanels');

    section.append(header, graphContainer, metrics);
    return section;
}

function renderTopPanels() {
    const container = byId('top-panels');
    if (!container) {
        return;
    }
    container.replaceChildren();

    const panels = Array.isArray(templateConfig.topPanels) ? templateConfig.topPanels : [];
    panels.forEach((panel, index) => {
        container.appendChild(createTopPanel(panel, index));
    });
}

function renderSkills() {
    const skillsConfig = templateConfig.skills ?? {};
    const section = byId('skill-set');
    const grid = byId('skill-grid');
    if (!grid) {
        return;
    }

    if (section && skillsConfig.sectionId) {
        section.id = skillsConfig.sectionId;
    }
    setText('skills-panel-title', skillsConfig.panelTitle);
    setText('skills-panel-uid', skillsConfig.panelUid);

    grid.replaceChildren();
    const items = Array.isArray(skillsConfig.items) ? skillsConfig.items : [];

    items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'skill-card';

        const title = document.createElement('h3');
        title.className = 'skill-card-title';
        title.textContent = item.title ?? 'CATEGORY';

        const stack = document.createElement('p');
        stack.className = 'skill-card-stack';
        stack.textContent = item.stack ?? '';

        card.append(title, stack);
        grid.appendChild(card);
    });
}

function createGroupDivider(group, sectionTheme) {
    const divider = document.createElement('div');
    divider.className = 'group-divider';
    divider.setAttribute('data-theme', sectionTheme || 'blue');

    const title = document.createElement('span');
    title.className = 'group-title';
    title.textContent = group.title ?? '';

    const desc = document.createElement('span');
    desc.className = 'group-desc';
    desc.textContent = group.desc ?? '';

    divider.append(title, desc);
    return divider;
}

function createServiceCard(card, sectionConfig) {
    const article = document.createElement('article');
    article.className = `service-card ${sectionConfig.cardClass ?? ''} ${card.cardClass ?? ''}`.trim();

    const visual = document.createElement('div');
    visual.className = 'card-visual';
    const visualHeight = card.visualHeight || sectionConfig.cardVisualHeight;
    if (visualHeight) {
        visual.style.setProperty('--card-visual-height', visualHeight);
    }

    const mermaidContainer = document.createElement('div');
    mermaidContainer.className = 'mermaid';
    mermaidContainer.setAttribute('data-mermaid-id', card.mermaidId ?? '');
    visual.appendChild(mermaidContainer);

    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = card.title ?? 'Card Title';

    const description = document.createElement('p');
    description.className = 'card-desc';
    description.textContent = card.description ?? '';

    const link = document.createElement('a');
    link.className = 'card-link';
    link.textContent = card.linkLabel ?? 'LEARN MORE';

    if (card.learnMore && card.learnMore !== '#') {
        link.href = card.learnMore;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    } else {
        link.href = '#';
        link.classList.add('is-disabled');
        link.setAttribute('aria-disabled', 'true');
        link.textContent = 'NO LINK';
    }

    content.append(title, description, link);
    article.append(visual, content);
    return article;
}

function renderServiceSections() {
    const container = byId('service-sections');
    if (!container) {
        return;
    }
    container.replaceChildren();

    const sections = Array.isArray(templateConfig.serviceSections) ? templateConfig.serviceSections : [];
    sections.forEach((sectionConfig) => {
        const sectionWrapper = document.createElement('section');
        sectionWrapper.className = 'service-section';
        sectionWrapper.id = sectionConfig.id ?? '';

        const header = document.createElement('div');
        header.className = 'section-header';
        const heading = document.createElement('h2');
        heading.className = 'section-title';
        heading.textContent = sectionConfig.title ?? 'SERVICES';
        header.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'service-grid';

        const groups = Array.isArray(sectionConfig.groups) && sectionConfig.groups.length > 0
            ? sectionConfig.groups
            : [{ title: '', desc: '', cards: sectionConfig.cards ?? [] }];

        groups.forEach((group) => {
            if (group.title || group.desc) {
                grid.appendChild(createGroupDivider(group, sectionConfig.theme));
            }

            const cards = Array.isArray(group.cards) ? group.cards : [];
            cards.forEach((card) => {
                grid.appendChild(createServiceCard(card, sectionConfig));
            });
        });

        sectionWrapper.append(header, grid);
        container.appendChild(sectionWrapper);
    });
}

function renderContact() {
    const contact = templateConfig.contact ?? {};
    const section = byId('contact');
    const actions = byId('contact-actions');

    if (section && contact.sectionId) {
        section.id = contact.sectionId;
    }
    setText('contact-panel-title', contact.panelTitle);
    setText('contact-panel-uid', contact.panelUid);
    setText('contact-description', contact.description);

    if (!actions) {
        return;
    }
    actions.replaceChildren();

    const items = Array.isArray(contact.actions) ? contact.actions : [];
    items.forEach((item) => {
        const action = document.createElement('a');
        action.className = 'action-btn';
        action.href = item.href || '#';
        action.textContent = item.label || 'LINK';
        if (!String(item.href || '').startsWith('mailto:')) {
            action.target = '_blank';
            action.rel = 'noopener noreferrer';
        }
        actions.appendChild(action);
    });
}

function buildDefaultNavigation() {
    const items = [];

    const hero = templateConfig.hero ?? {};
    const skills = templateConfig.skills ?? {};
    const contact = templateConfig.contact ?? {};

    items.push({
        label: hero.panelTitle || 'SYSTEM_ARCHITECTURE',
        target: normalizeHashTarget(hero.sectionId || 'system-architecture')
    });

    const topPanels = Array.isArray(templateConfig.topPanels) ? templateConfig.topPanels : [];
    topPanels.forEach((panel, index) => {
        items.push({
            label: panel.navLabel || panel.panelTitle || `TOP_PANEL_${index + 1}`,
            target: normalizeHashTarget(panel.sectionId || `top-panel-${index + 1}`)
        });
    });

    items.push({
        label: skills.panelTitle || 'SKILL_SET',
        target: normalizeHashTarget(skills.sectionId || 'skill-set')
    });

    const serviceSections = Array.isArray(templateConfig.serviceSections) ? templateConfig.serviceSections : [];
    serviceSections.forEach((section) => {
        items.push({
            label: section.navLabel || section.title || section.id || 'SERVICES',
            target: normalizeHashTarget(section.id || '')
        });
    });

    items.push({
        label: contact.panelTitle || 'CONTACT',
        target: normalizeHashTarget(contact.sectionId || 'contact')
    });

    return items;
}

function renderNavigation() {
    const nav = byId('header-nav');
    if (!nav) {
        return;
    }
    nav.replaceChildren();

    const configuredNav = Array.isArray(templateConfig.navigation) && templateConfig.navigation.length > 0
        ? templateConfig.navigation
        : buildDefaultNavigation();

    configuredNav.forEach((item) => {
        const link = document.createElement('a');
        link.className = 'nav-item';
        link.href = normalizeHashTarget(item.target);
        link.textContent = item.label || 'SECTION';
        nav.appendChild(link);
    });
}

function injectMermaidSources() {
    const nodes = Array.from(document.querySelectorAll('.mermaid'));
    const diagrams = templateConfig.diagrams ?? {};

    nodes.forEach((container) => {
        const mermaidId = container.getAttribute('data-mermaid-id') || '';
        if (mermaidId && diagrams[mermaidId]) {
            container.innerHTML = diagrams[mermaidId];
            return;
        }

        const label = toSafeLabel(mermaidId || 'undefined_id');
        container.innerHTML = `
            graph TD
            A[${label}] --> B[Define templateConfig.diagrams entry]
        `;
    });

    return nodes;
}

function setupMermaidModal() {
    const modal = byId('mermaid-modal');
    const modalContent = byId('mermaid-modal-content');
    const modalTitle = byId('mermaid-modal-title');

    if (!modal || !modalContent || !modalTitle) {
        return;
    }

    const targets = document.querySelectorAll('.graph-container, .card-visual');

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        modalContent.replaceChildren();
        document.body.classList.remove('modal-open');
    };

    const openModal = (target) => {
        const sourceSvg = target.querySelector('.mermaid svg');
        if (!sourceSvg) {
            return;
        }

        const clonedSvg = sourceSvg.cloneNode(true);
        const viewBox = sourceSvg.getAttribute('viewBox');
        if (viewBox) {
            const parts = viewBox.trim().split(/\s+/).map(Number);
            if (parts.length === 4 && parts.every(Number.isFinite)) {
                const zoom = 1.35;
                clonedSvg.setAttribute('width', String(Math.round(parts[2] * zoom)));
                clonedSvg.setAttribute('height', String(Math.round(parts[3] * zoom)));
            }
        } else {
            const rect = sourceSvg.getBoundingClientRect();
            clonedSvg.setAttribute('width', String(Math.round(rect.width * 1.35)));
            clonedSvg.setAttribute('height', String(Math.round(rect.height * 1.35)));
        }

        modalContent.replaceChildren(clonedSvg);

        const titleText =
            target.closest('.service-card')?.querySelector('.card-title')?.textContent?.trim() ||
            target.closest('.hero-panel')?.querySelector('.panel-title')?.textContent?.trim() ||
            'Mermaid Diagram';
        modalTitle.textContent = titleText;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    targets.forEach((target) => {
        target.classList.add('mermaid-zoom-target');
        target.setAttribute('tabindex', '0');
        target.setAttribute('role', 'button');
        target.setAttribute('aria-label', 'Open expanded Mermaid diagram');

        target.addEventListener('click', () => openModal(target));
        target.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(target);
            }
        });
    });

    modal.querySelectorAll('[data-mermaid-close]').forEach((closeButton) => {
        closeButton.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    setSystemInfo();
    renderHero();
    renderTopPanels();
    renderSkills();
    renderServiceSections();
    renderContact();
    renderNavigation();
    setupUptime();
    setupMobileNav();

    const mermaidNodes = injectMermaidSources();
    await mermaid.run({ nodes: mermaidNodes });

    setupMermaidModal();
});
