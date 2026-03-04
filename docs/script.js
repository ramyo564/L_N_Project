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
let mermaidRenderCounter = 0;

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

function pushDataLayerEvent(eventName, payload = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        tracking_version: '2026-03-ui-click-v1',
        page_path: window.location.pathname,
        page_title: document.title,
        ...payload
    });
}

function normalizeTrackingPayload(payload = {}) {
    const normalized = { ...payload };
    const uiLabel = String(normalized.ui_label ?? normalized.element_label ?? normalized.link_label ?? 'unknown');
    const uiSection = String(normalized.ui_section_id ?? normalized.section_name ?? 'unknown');
    const uiCardId = String(normalized.ui_card_id ?? normalized.item_id ?? '');
    const uiCardTitle = String(normalized.ui_card_title ?? normalized.item_name ?? '');

    normalized.ui_label = uiLabel;
    normalized.ui_section_id = uiSection;
    normalized.ui_card_id = uiCardId;
    normalized.ui_card_title = uiCardTitle;

    normalized.element_label = String(normalized.element_label ?? uiLabel);
    normalized.section_name = String(normalized.section_name ?? uiSection);
    const fallbackItemId = uiCardId || uiLabel;
    const fallbackItemName = uiCardTitle || uiLabel;
    normalized.item_id = String(normalized.item_id ?? fallbackItemId);
    normalized.item_name = String(normalized.item_name ?? fallbackItemName);

    return normalized;
}

function trackUiClick(payload = {}) {
    pushDataLayerEvent('ui_click', normalizeTrackingPayload(payload));
}

function setTrackData(element, payload = {}) {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    element.dataset.trackClick = 'true';
    element.dataset.trackArea = payload.area ?? 'unknown';
    element.dataset.trackComponent = payload.component ?? 'element';
    element.dataset.trackLabel = payload.label ?? element.textContent?.trim() ?? 'unknown';
    element.dataset.trackAction = payload.action ?? 'click';
    element.dataset.trackDestination = payload.destination ?? '';
    element.dataset.trackCardId = payload.cardId ?? '';
    element.dataset.trackCardTitle = payload.cardTitle ?? '';
    const fallbackSection = element.closest('section[id], .service-section[id], .panel[id]')?.id ?? '';
    element.dataset.trackSectionId = payload.sectionId ?? fallbackSection;
}

function trackElementInteraction(element, interaction = 'mouse') {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    if (element.dataset.trackClick !== 'true') {
        return;
    }

    trackUiClick({
        ui_area: element.dataset.trackArea || 'unknown',
        ui_component: element.dataset.trackComponent || 'element',
        ui_label: element.dataset.trackLabel || 'unknown',
        ui_action: element.dataset.trackAction || 'click',
        ui_destination: element.dataset.trackDestination || '',
        ui_card_id: element.dataset.trackCardId || '',
        ui_card_title: element.dataset.trackCardTitle || '',
        ui_section_id: element.dataset.trackSectionId || '',
        ui_interaction: interaction
    });
}

function setupInteractionTracking() {
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const tracked = target.closest('[data-track-click="true"]');
        if (!tracked) {
            return;
        }
        const interaction = event.detail === 0 ? 'keyboard' : 'mouse';
        trackElementInteraction(tracked, interaction);
    });

    document.addEventListener('auxclick', (event) => {
        if (event.button !== 1) {
            return;
        }
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const tracked = target.closest('[data-track-click="true"]');
        if (!tracked) {
            return;
        }
        trackElementInteraction(tracked, 'auxclick');
    });
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
        const nextAction = nav.classList.contains('is-open') ? 'close_navigation' : 'open_navigation';
        const interaction = event.detail === 0 ? 'keyboard' : 'mouse';
        trackUiClick({
            ui_area: 'header_nav',
            ui_component: 'button',
            ui_label: 'NAV_TOGGLE',
            ui_action: nextAction,
            ui_destination: '#header-nav',
            ui_interaction: interaction
        });
        if (nav.classList.contains('is-open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    nav.addEventListener('click', (event) => {
        const target = event.target;
        if (
            target instanceof HTMLElement &&
            (target.classList.contains('nav-item') || target.classList.contains('nav-sub-item'))
        ) {
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

    if (metrics) {
        metrics.replaceChildren();
        renderMetricLines(metrics, hero.metrics, '> Add metrics in templateConfig.hero.metrics');
    }

    renderHeroActions(hero, hero.sectionId || 'system-architecture');
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
        item.className = 'metric-line';

        const cleanLine = String(line).replace(/^>\s*/, '').trim();
        const parsed = cleanLine.match(/^([^:]+):\s*(.+)$/);

        if (!parsed) {
            item.textContent = cleanLine;
            container.appendChild(item);
            return;
        }

        const label = document.createElement('span');
        label.className = 'metric-label';
        label.textContent = `${parsed[1]}:`;

        const value = document.createElement('span');
        value.className = 'metric-value';
        value.textContent = parsed[2];

        item.append(label, value);
        container.appendChild(item);
    });
}

function renderHeroActions(heroConfig, sectionId) {
    const actionsContainer = byId('hero-actions');
    if (!actionsContainer) {
        return;
    }

    actionsContainer.replaceChildren();
    const actions = Array.isArray(heroConfig.actions) ? heroConfig.actions : [];
    if (actions.length === 0) {
        actionsContainer.style.display = 'none';
        return;
    }
    actionsContainer.style.display = 'flex';

    actions.forEach((item) => {
        const requestedAction = String(item.action || '').trim().toLowerCase();
        const targetSelector = String(item.target || item.href || '#').trim();
        const targetId = targetSelector.replace(/^#/, '');

        if (requestedAction === 'toggle_panel' && targetId) {
            const action = document.createElement('button');
            action.className = 'hero-action-btn';
            action.type = 'button';

            const resolveTarget = () => byId(targetId);
            const syncState = () => {
                const target = resolveTarget();
                const expanded = Boolean(target && !target.classList.contains('is-panel-hidden'));
                action.textContent = expanded
                    ? (item.openLabel || 'SYSTEM DETAIL ARCHITECTURE 닫기')
                    : (item.label || 'SYSTEM DETAIL ARCHITECTURE 보기');
                action.setAttribute('aria-expanded', String(expanded));
                action.setAttribute('aria-controls', targetId);
            };

            action.addEventListener('click', () => {
                const target = resolveTarget();
                if (!target) {
                    return;
                }

                const nextHidden = !target.classList.contains('is-panel-hidden');
                target.classList.toggle('is-panel-hidden', nextHidden);
                target.setAttribute('aria-hidden', String(nextHidden));
                if (!nextHidden) {
                    void renderVisibleMermaidNodes(Array.from(target.querySelectorAll('.mermaid')));
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                syncState();
            });

            syncState();
            setTrackData(action, {
                area: 'hero',
                component: 'button',
                label: item.label || 'SYSTEM DETAIL ARCHITECTURE 보기',
                action: item.action || 'toggle_panel',
                destination: `#${targetId}`,
                sectionId
            });
            actionsContainer.appendChild(action);
            return;
        }

        const action = document.createElement('a');
        action.className = 'hero-action-btn';
        action.href = targetSelector;
        action.textContent = item.label || 'OPEN_DETAIL';
        if (!String(action.href).startsWith('#') && !String(action.href).startsWith('mailto:')) {
            action.target = '_blank';
            action.rel = 'noopener noreferrer';
        }

        setTrackData(action, {
            area: 'hero',
            component: 'button_link',
            label: item.label || 'OPEN_DETAIL',
            action: item.action || 'open_architecture_detail',
            destination: action.href,
            sectionId
        });

        actionsContainer.appendChild(action);
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
        const panelElement = createTopPanel(panel, index);
        panelElement.hidden = false;
        if (panel.defaultHidden === true) {
            panelElement.classList.add('is-panel-hidden');
            panelElement.setAttribute('aria-hidden', 'true');
        } else {
            panelElement.setAttribute('aria-hidden', 'false');
        }
        container.appendChild(panelElement);
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

function createSectionToggleSummary(sectionConfig) {
    const summary = document.createElement('summary');
    summary.className = 'section-toggle-summary';

    const title = document.createElement('span');
    title.className = 'section-toggle-title';
    title.textContent = sectionConfig.toggleLabel || `${sectionConfig.title ?? 'SECTION'} DETAILS`;

    const hint = document.createElement('span');
    hint.className = 'section-toggle-hint';
    hint.textContent = sectionConfig.toggleHint || 'CLICK TO EXPAND';

    summary.append(title, hint);
    setTrackData(summary, {
        area: 'service_section',
        component: 'toggle',
        label: title.textContent,
        action: 'toggle_section',
        destination: normalizeHashTarget(sectionConfig.id || ''),
        sectionId: sectionConfig.id || ''
    });

    return summary;
}

function createGroupToggleSummary(group, sectionConfig) {
    const summary = document.createElement('summary');
    summary.className = 'group-toggle-summary';

    const title = document.createElement('span');
    title.className = 'group-toggle-title';
    title.textContent = group.title || 'GROUP DETAILS';

    const hint = document.createElement('span');
    hint.className = 'group-toggle-hint';
    hint.textContent = group.desc || 'CLICK TO EXPAND';

    summary.append(title, hint);
    setTrackData(summary, {
        area: 'service_group',
        component: 'toggle',
        label: group.title || 'GROUP DETAILS',
        action: 'toggle_group',
        destination: normalizeHashTarget(sectionConfig?.id || ''),
        sectionId: sectionConfig?.id || ''
    });

    return summary;
}

function createMetaLine(label, value) {
    if (!value) {
        return null;
    }

    const line = document.createElement('p');
    line.className = 'card-meta-line';

    const key = document.createElement('span');
    key.className = 'meta-label';
    key.textContent = `${label}:`;

    const text = document.createElement('span');
    text.className = 'meta-value';
    text.textContent = value;

    line.append(key, text);
    return line;
}

function createTagList(tags) {
    const normalizedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
    if (normalizedTags.length === 0) {
        return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'card-tags';

    normalizedTags.forEach((tag) => {
        const item = document.createElement('span');
        item.className = 'card-tag';
        item.textContent = tag;
        wrapper.appendChild(item);
    });

    return wrapper;
}

function createHighlightList(items) {
    const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (normalizedItems.length === 0) {
        return null;
    }

    const list = document.createElement('ul');
    list.className = 'card-highlights';
    normalizedItems.forEach((item) => {
        const line = document.createElement('li');
        const parsed = String(item).match(/^(Choice|Result|Trade-off):\s*(.+)$/i);
        if (!parsed) {
            line.textContent = String(item);
            list.appendChild(line);
            return;
        }

        const label = document.createElement('span');
        label.className = 'highlight-label';
        label.textContent = `${parsed[1]}:`;

        const value = document.createElement('span');
        value.className = 'highlight-value';
        if (parsed[1].toLowerCase() === 'result') {
            value.classList.add('is-result');
        }
        value.textContent = parsed[2];

        line.append(label, value);
        list.appendChild(line);
    });
    return list;
}

function createCardLinks(card, sectionConfig) {
    const links = Array.isArray(card.links) ? card.links.filter((item) => item?.href) : [];
    if (links.length === 0 && card.learnMore && card.learnMore !== '#') {
        links.push({ label: card.linkLabel ?? 'LEARN MORE', href: card.learnMore });
    }

    if (links.length === 0) {
        return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'card-links';

    links.forEach((item) => {
        const link = document.createElement('a');
        link.className = 'card-link';
        const variant = String(item.variant ?? '').trim().toLowerCase();
        if (variant) {
            link.classList.add(`is-${variant}`);
        }
        link.href = item.href;
        link.textContent = item.label || 'LINK';
        if (!String(item.href).startsWith('mailto:')) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }

        setTrackData(link, {
            area: 'service_card',
            component: 'link',
            label: item.label || 'LINK',
            action: 'open_case_link',
            destination: item.href || '',
            cardId: card.mermaidId || '',
            cardTitle: card.title || '',
            sectionId: sectionConfig?.id || ''
        });

        // GA4 Event Tracking
        link.addEventListener('click', () => {
            pushDataLayerEvent('select_content', {
                content_type: 'case_link',
                item_id: card.mermaidId || card.title || 'unknown_case',
                item_name: card.title || 'unknown_case',
                section_name: sectionConfig?.id || 'unknown',
                element_label: item.label || 'LINK',
                link_label: item.label,
                link_url: item.href
            });
        });

        wrapper.appendChild(link);
    });

    return wrapper;
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

    const subtitleText = card.subtitle ?? card.period ?? '';
    const subtitle = document.createElement('p');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = subtitleText;

    const description = document.createElement('p');
    description.className = 'card-desc';
    const descriptionText = String(card.overview ?? card.description ?? '');
    const parsedProblem = descriptionText.match(/^Problem:\s*(.+)$/i);
    if (parsedProblem) {
        description.classList.add('problem-line');
        const problemLabel = document.createElement('span');
        problemLabel.className = 'problem-label';
        problemLabel.textContent = 'Problem:';

        const problemValue = document.createElement('span');
        problemValue.className = 'problem-value';
        problemValue.textContent = parsedProblem[1];

        description.append(problemLabel, problemValue);
    } else {
        description.textContent = descriptionText;
    }

    const whyLine = createMetaLine('WHY', card.why);
    const roleLine = createMetaLine('ROLE', card.role);
    const stackLine = createMetaLine('STACK', card.stackSummary);
    const tags = createTagList(card.skills);
    const highlights = createHighlightList(card.highlights);
    const links = createCardLinks(card, sectionConfig);

    content.append(title);
    if (subtitleText) {
        content.append(subtitle);
    }
    content.append(description);
    if (whyLine) {
        content.append(whyLine);
    }
    if (roleLine) {
        content.append(roleLine);
    }
    if (stackLine) {
        content.append(stackLine);
    }
    if (tags) {
        content.append(tags);
    }
    if (highlights) {
        content.append(highlights);
    }
    if (links) {
        content.append(links);
    }
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

        if (sectionConfig.summary) {
            const summary = document.createElement('p');
            summary.className = 'section-summary';
            summary.textContent = sectionConfig.summary;
            header.appendChild(summary);
        }

        const groupsContainer = document.createElement('div');
        groupsContainer.className = 'service-groups';

        const groups = Array.isArray(sectionConfig.groups) && sectionConfig.groups.length > 0
            ? sectionConfig.groups
            : [{ title: '', desc: '', cards: sectionConfig.cards ?? [] }];

        groups.forEach((group) => {
            const groupSection = document.createElement('div');
            groupSection.className = 'service-group';

            const groupGrid = document.createElement('div');
            groupGrid.className = 'service-grid';

            const cards = Array.isArray(group.cards) ? group.cards : [];
            cards.forEach((card) => {
                groupGrid.appendChild(createServiceCard(card, sectionConfig));
            });

            if (group.collapsible) {
                const groupToggle = document.createElement('details');
                groupToggle.className = 'group-toggle';
                groupToggle.setAttribute('data-theme', sectionConfig.theme || 'blue');
                groupToggle.open = group.defaultCollapsed !== true;
                groupToggle.append(createGroupToggleSummary(group, sectionConfig), groupGrid);
                groupSection.appendChild(groupToggle);
            } else {
                if (group.title || group.desc) {
                    groupSection.appendChild(createGroupDivider(group, sectionConfig.theme));
                }
                groupSection.appendChild(groupGrid);
            }
            groupsContainer.appendChild(groupSection);
        });

        if (sectionConfig.collapsible) {
            const sectionToggle = document.createElement('details');
            sectionToggle.className = 'section-toggle';
            sectionToggle.setAttribute('data-theme', sectionConfig.theme || 'blue');
            sectionToggle.open = sectionConfig.defaultCollapsed !== true;
            sectionToggle.append(createSectionToggleSummary(sectionConfig), groupsContainer);
            sectionWrapper.append(header, sectionToggle);
        } else {
            sectionWrapper.append(header, groupsContainer);
        }
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
        setTrackData(action, {
            area: 'contact',
            component: 'button_link',
            label: item.label || 'LINK',
            action: 'open_contact_link',
            destination: item.href || '',
            sectionId: contact.sectionId || 'contact'
        });
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
    const serviceSections = Array.isArray(templateConfig.serviceSections) ? templateConfig.serviceSections : [];
    const candidates = [];
    let sequence = 0;

    topPanels.forEach((panel, index) => {
        if (panel.showInNav === false) {
            return;
        }
        candidates.push({
            label: panel.navLabel || panel.panelTitle || `TOP_PANEL_${index + 1}`,
            target: normalizeHashTarget(panel.sectionId || `top-panel-${index + 1}`),
            sequence: sequence += 1
        });
    });

    candidates.push({
        label: skills.panelTitle || 'SKILL_SET',
        target: normalizeHashTarget(skills.sectionId || 'skill-set'),
        sequence: sequence += 1
    });

    serviceSections.forEach((section) => {
        candidates.push({
            label: section.navLabel || section.title || section.id || 'SERVICES',
            target: normalizeHashTarget(section.id || ''),
            sequence: sequence += 1
        });
    });

    const resolveTargetTop = (target) => {
        const targetId = String(target || '').replace(/^#/, '');
        if (!targetId) {
            return Number.POSITIVE_INFINITY;
        }
        const targetElement = byId(targetId);
        if (!targetElement) {
            return Number.POSITIVE_INFINITY;
        }
        return targetElement.getBoundingClientRect().top + window.scrollY;
    };

    candidates
        .sort((left, right) => {
            const topDiff = resolveTargetTop(left.target) - resolveTargetTop(right.target);
            if (Math.abs(topDiff) > 0.5) {
                return topDiff;
            }
            return left.sequence - right.sequence;
        })
        .forEach((item) => {
            items.push({
                label: item.label,
                target: item.target
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
        const targetId = String(link.href).includes('#') ? String(item.target || '').replace(/^#/, '') : '';
        setTrackData(link, {
            area: 'header_nav',
            component: 'link',
            label: item.label || 'SECTION',
            action: 'navigate_section',
            destination: normalizeHashTarget(item.target),
            sectionId: targetId || 'header-nav'
        });
        nav.appendChild(link);
    });
}

function setupScrollSpy() {
    const nav = byId('header-nav');
    if (!nav) {
        return;
    }

    const links = Array.from(nav.querySelectorAll('.nav-item, .nav-sub-item'));
    if (links.length === 0) {
        return;
    }

    const targetMap = new Map();
    links.forEach((link) => {
        const href = String(link.getAttribute('href') || '');
        if (!href.startsWith('#') || href.length < 2) {
            return;
        }

        const targetId = href.slice(1);
        const targetElement = byId(targetId);
        if (!targetElement) {
            return;
        }

        if (!targetMap.has(targetId)) {
            targetMap.set(targetId, {
                element: targetElement,
                links: []
            });
        }
        targetMap.get(targetId).links.push(link);
    });

    if (targetMap.size === 0) {
        return;
    }

    let sortedTargets = [];
    let currentActiveId = '';
    let rafToken = 0;

    const clearActive = () => {
        links.forEach((link) => link.classList.remove('is-active'));
    };

    const activateTarget = (targetId) => {
        if (!targetId || currentActiveId === targetId) {
            return;
        }
        currentActiveId = targetId;
        clearActive();

        const matched = targetMap.get(targetId);
        if (!matched) {
            return;
        }

        matched.links.forEach((link) => link.classList.add('is-active'));
    };

    const rebuildTargetOrder = () => {
        sortedTargets = Array.from(targetMap.entries())
            .map(([targetId, payload]) => ({
                targetId,
                top: payload.element.getBoundingClientRect().top + window.scrollY
            }))
            .sort((left, right) => left.top - right.top);
    };

    const applyByScrollPosition = () => {
        if (sortedTargets.length === 0) {
            return;
        }

        const headerHeight = document.querySelector('.status-bar')?.offsetHeight ?? 0;
        const baseline = window.scrollY + headerHeight + 28;
        let activeId = sortedTargets[0].targetId;

        for (let index = 0; index < sortedTargets.length; index += 1) {
            if (baseline >= sortedTargets[index].top) {
                activeId = sortedTargets[index].targetId;
            } else {
                break;
            }
        }

        activateTarget(activeId);
    };

    const scheduleUpdate = () => {
        if (rafToken !== 0) {
            return;
        }
        rafToken = window.requestAnimationFrame(() => {
            rafToken = 0;
            applyByScrollPosition();
        });
    };

    rebuildTargetOrder();
    applyByScrollPosition();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', () => {
        rebuildTargetOrder();
        scheduleUpdate();
    });
    window.addEventListener('hashchange', scheduleUpdate);

    window.setTimeout(() => {
        rebuildTargetOrder();
        scheduleUpdate();
    }, 160);
    window.setTimeout(() => {
        rebuildTargetOrder();
        scheduleUpdate();
    }, 720);
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

function shouldDeferMermaidNode(node) {
    if (!(node instanceof HTMLElement)) {
        return true;
    }
    if (node.closest('.is-panel-hidden')) {
        return true;
    }
    if (node.closest('details:not([open])')) {
        return true;
    }
    return false;
}

async function renderMermaidNode(node) {
    if (!(node instanceof HTMLElement)) {
        return;
    }
    if (node.querySelector('svg')) {
        return;
    }

    const tempClass = `mermaid-render-target-${mermaidRenderCounter += 1}`;
    node.classList.add(tempClass);
    try {
        await mermaid.run({ querySelector: `.${tempClass}` });
    } catch (error) {
        console.error('Mermaid render failed for node:', node, error);
        const failedId = node.getAttribute('data-mermaid-id') || 'unknown';
        node.innerHTML = `<p style="margin:0;color:#ffb4b4;">Diagram render failed: ${failedId}</p>`;
    } finally {
        node.classList.remove(tempClass);
    }
}

async function renderVisibleMermaidNodes(nodes) {
    for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (shouldDeferMermaidNode(node)) {
            continue;
        }
        // hidden 상태에서 실패한 다이어그램은 열릴 때 재시도한다.
        await renderMermaidNode(node);
    }
}

function setupDeferredMermaidRender() {
    document.addEventListener('toggle', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLDetailsElement)) {
            return;
        }
        if (!target.open) {
            return;
        }
        void renderVisibleMermaidNodes(Array.from(target.querySelectorAll('.mermaid')));
    }, true);
}

function setupMermaidModal() {
    const modal = byId('mermaid-modal');
    const modalContent = byId('mermaid-modal-content');
    const modalTitle = byId('mermaid-modal-title');
    const modalDialog = modal?.querySelector('.mermaid-modal-dialog') ?? null;

    if (!modal || !modalContent || !modalTitle || !modalDialog) {
        return;
    }

    const targets = document.querySelectorAll('.graph-container, .card-visual');
    const ZOOM_STEP = 0.15;
    const ZOOM_MIN = 0.55;
    const ZOOM_MAX = 3;

    let zoom = 1;
    let activeSvg = null;
    let activeCanvas = null;
    let baseSvgWidth = 0;
    let baseSvgHeight = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panStartScrollLeft = 0;
    let panStartScrollTop = 0;

    let controls = modal.querySelector('.mermaid-modal-controls');
    if (!controls) {
        controls = document.createElement('div');
        controls.className = 'mermaid-modal-controls';
        controls.innerHTML = `
            <button class="mermaid-zoom-btn" type="button" data-mermaid-zoom="out" aria-label="Zoom out">-</button>
            <button class="mermaid-zoom-btn" type="button" data-mermaid-zoom="reset" aria-label="Reset zoom">RESET</button>
            <button class="mermaid-zoom-btn" type="button" data-mermaid-zoom="in" aria-label="Zoom in">+</button>
            <span class="mermaid-zoom-value" aria-live="polite">100%</span>
        `;
        modalDialog.appendChild(controls);
    }

    const zoomValue = controls.querySelector('.mermaid-zoom-value');

    const centerModalView = () => {
        const maxLeft = modalContent.scrollWidth - modalContent.clientWidth;
        if (maxLeft > 0) {
            modalContent.scrollLeft = Math.floor(maxLeft / 2);
            return;
        }
        modalContent.scrollLeft = 0;
    };

    const scheduleCenterModalView = () => {
        window.requestAnimationFrame(() => {
            centerModalView();
            window.requestAnimationFrame(centerModalView);
        });
    };

    const endPan = () => {
        if (!isPanning) {
            return;
        }
        isPanning = false;
        modalContent.classList.remove('is-panning');
    };

    const applyZoom = () => {
        if (!activeSvg || !activeCanvas) {
            return;
        }

        const nextWidth = Math.max(1, Math.round(baseSvgWidth * zoom));
        const nextHeight = Math.max(1, Math.round(baseSvgHeight * zoom));
        activeCanvas.style.width = `${nextWidth}px`;
        activeCanvas.style.height = `${nextHeight}px`;
        activeSvg.style.maxWidth = 'none';
        activeSvg.style.width = '100%';
        activeSvg.style.height = '100%';
        activeSvg.setAttribute('width', String(baseSvgWidth));
        activeSvg.setAttribute('height', String(baseSvgHeight));

        if (zoom > 1.001) {
            modalContent.classList.add('can-pan');
        } else {
            endPan();
            modalContent.classList.remove('can-pan');
        }

        if (zoomValue) {
            zoomValue.textContent = `${Math.round(zoom * 100)}%`;
        }
    };

    const setZoom = (nextZoom) => {
        const clampedZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextZoom));
        if (Math.abs(clampedZoom - zoom) < 0.0001) {
            return;
        }
        zoom = clampedZoom;
        applyZoom();
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        modalContent.replaceChildren();
        endPan();
        modalContent.classList.remove('can-pan');
        activeSvg = null;
        activeCanvas = null;
        baseSvgWidth = 0;
        baseSvgHeight = 0;
        zoom = 1;
        if (zoomValue) {
            zoomValue.textContent = '100%';
        }
        document.body.classList.remove('modal-open');
    };

    const resolveDiagramLabel = (target) =>
        target.closest('.service-card')?.querySelector('.card-title')?.textContent?.trim() ||
        target.closest('.hero-panel')?.querySelector('.panel-title')?.textContent?.trim() ||
        'Mermaid Diagram';

    const openModal = (target) => {
        const sourceSvg = target.querySelector('.mermaid svg');
        if (!sourceSvg) {
            return;
        }

        const clonedSvg = sourceSvg.cloneNode(true);
        clonedSvg.style.maxWidth = 'none';
        clonedSvg.style.width = '100%';
        clonedSvg.style.height = '100%';

        const viewBox = sourceSvg.getAttribute('viewBox');
        let calculatedBaseWidth = 0;
        let calculatedBaseHeight = 0;
        if (viewBox) {
            const parts = viewBox.trim().split(/\s+/).map(Number);
            if (parts.length === 4 && parts.every(Number.isFinite)) {
                const modalBaseScale = 1.08;
                calculatedBaseWidth = Math.round(parts[2] * modalBaseScale);
                calculatedBaseHeight = Math.round(parts[3] * modalBaseScale);
            }
        }

        if (calculatedBaseWidth <= 0 || calculatedBaseHeight <= 0) {
            const rect = sourceSvg.getBoundingClientRect();
            const modalBaseScale = 1.08;
            calculatedBaseWidth = Math.max(1, Math.round(rect.width * modalBaseScale));
            calculatedBaseHeight = Math.max(1, Math.round(rect.height * modalBaseScale));
        }

        baseSvgWidth = calculatedBaseWidth;
        baseSvgHeight = calculatedBaseHeight;

        clonedSvg.setAttribute('width', String(baseSvgWidth));
        clonedSvg.setAttribute('height', String(baseSvgHeight));

        const canvas = document.createElement('div');
        canvas.className = 'mermaid-modal-canvas';
        canvas.style.width = `${baseSvgWidth}px`;
        canvas.style.height = `${baseSvgHeight}px`;
        canvas.appendChild(clonedSvg);

        modalContent.replaceChildren(canvas);
        modalContent.scrollLeft = 0;
        modalContent.scrollTop = 0;
        activeCanvas = canvas;
        activeSvg = clonedSvg;
        zoom = 1;
        applyZoom();

        const titleText = resolveDiagramLabel(target);
        modalTitle.textContent = titleText;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        scheduleCenterModalView();
    };

    controls.querySelectorAll('[data-mermaid-zoom]').forEach((button) => {
        const controlAction = button.getAttribute('data-mermaid-zoom') || 'zoom';
        setTrackData(button, {
            area: 'diagram_modal',
            component: 'button',
            label: `ZOOM_${controlAction.toUpperCase()}`,
            action: `diagram_${controlAction}`,
            destination: 'mermaid-modal'
        });

        button.addEventListener('click', (event) => {
            const control = event.currentTarget;
            if (!(control instanceof HTMLElement)) {
                return;
            }
            const action = control.getAttribute('data-mermaid-zoom');
            if (!action || !modal.classList.contains('is-open')) {
                return;
            }

            if (action === 'in') {
                setZoom(zoom + ZOOM_STEP);
                return;
            }
            if (action === 'out') {
                setZoom(zoom - ZOOM_STEP);
                return;
            }
            zoom = 1;
            applyZoom();
            scheduleCenterModalView();
        });
    });

    modalContent.addEventListener('wheel', (event) => {
        if (!modal.classList.contains('is-open') || !activeSvg || !event.ctrlKey) {
            return;
        }
        event.preventDefault();
        if (event.deltaY < 0) {
            setZoom(zoom + ZOOM_STEP);
            return;
        }
        setZoom(zoom - ZOOM_STEP);
    }, { passive: false });

    modalContent.addEventListener('pointerdown', (event) => {
        if (!modal.classList.contains('is-open') || !activeSvg || zoom <= 1.001) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        isPanning = true;
        panStartX = event.clientX;
        panStartY = event.clientY;
        panStartScrollLeft = modalContent.scrollLeft;
        panStartScrollTop = modalContent.scrollTop;
        modalContent.classList.add('is-panning');
        event.preventDefault();
    });

    modalContent.addEventListener('pointermove', (event) => {
        if (!isPanning) {
            return;
        }
        const deltaX = event.clientX - panStartX;
        const deltaY = event.clientY - panStartY;
        modalContent.scrollLeft = panStartScrollLeft - deltaX;
        modalContent.scrollTop = panStartScrollTop - deltaY;
        event.preventDefault();
    });

    modalContent.addEventListener('pointerup', endPan);
    modalContent.addEventListener('pointercancel', endPan);
    modalContent.addEventListener('pointerleave', (event) => {
        if (isPanning && !(event.buttons & 1)) {
            endPan();
        }
    });

    targets.forEach((target) => {
        target.classList.add('mermaid-zoom-target');
        target.setAttribute('tabindex', '0');
        target.setAttribute('role', 'button');
        target.setAttribute('aria-label', 'Open expanded Mermaid diagram');

        const diagramId = target.querySelector('.mermaid')?.getAttribute('data-mermaid-id') || '';
        setTrackData(target, {
            area: 'diagram',
            component: 'diagram',
            label: resolveDiagramLabel(target),
            action: 'open_diagram_modal',
            destination: diagramId
        });

        target.addEventListener('click', () => openModal(target));
        target.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                trackElementInteraction(target, 'keyboard');
                openModal(target);
            }
        });
    });

    modal.querySelectorAll('[data-mermaid-close]').forEach((closeButton) => {
        const isButton = closeButton instanceof HTMLButtonElement;
        setTrackData(closeButton, {
            area: 'diagram_modal',
            component: isButton ? 'button' : 'backdrop',
            label: isButton ? 'CLOSE_MODAL_BUTTON' : 'CLOSE_MODAL_BACKDROP',
            action: 'close_diagram_modal',
            destination: 'mermaid-modal'
        });
        closeButton.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('is-open')) {
            return;
        }
        if (event.key === 'Escape') {
            trackUiClick({
                ui_area: 'diagram_modal',
                ui_component: 'keyboard',
                ui_label: 'ESCAPE',
                ui_action: 'close_diagram_modal',
                ui_destination: 'mermaid-modal',
                ui_interaction: 'keyboard'
            });
            closeModal();
            return;
        }
        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            trackUiClick({
                ui_area: 'diagram_modal',
                ui_component: 'keyboard',
                ui_label: 'KEY_PLUS',
                ui_action: 'diagram_in',
                ui_destination: 'mermaid-modal',
                ui_interaction: 'keyboard'
            });
            setZoom(zoom + ZOOM_STEP);
            return;
        }
        if (event.key === '-' || event.key === '_') {
            event.preventDefault();
            trackUiClick({
                ui_area: 'diagram_modal',
                ui_component: 'keyboard',
                ui_label: 'KEY_MINUS',
                ui_action: 'diagram_out',
                ui_destination: 'mermaid-modal',
                ui_interaction: 'keyboard'
            });
            setZoom(zoom - ZOOM_STEP);
            return;
        }
        if (event.key === '0') {
            event.preventDefault();
            trackUiClick({
                ui_area: 'diagram_modal',
                ui_component: 'keyboard',
                ui_label: 'KEY_ZERO',
                ui_action: 'diagram_reset',
                ui_destination: 'mermaid-modal',
                ui_interaction: 'keyboard'
            });
            zoom = 1;
            applyZoom();
            scheduleCenterModalView();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    setSystemInfo();
    renderTopPanels();
    renderHero();
    renderSkills();
    renderServiceSections();
    renderContact();
    renderNavigation();
    setupUptime();
    setupMobileNav();

    const mermaidNodes = injectMermaidSources();
    await renderVisibleMermaidNodes(mermaidNodes);
    setupDeferredMermaidRender();

    setupMermaidModal();
    setupScrollSpy();
    setupInteractionTracking();
});
