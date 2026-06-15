const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const footerLinksContainers = document.querySelectorAll(".footer-links");
const featuredResourcesContainer = document.querySelector("#featured-resources");
const resourceListContainer = document.querySelector("#resource-list");
const resourceEmpty = document.querySelector("#resource-empty");
const resourceCount = document.querySelector("#resource-count");
const resourceSearch = document.querySelector("#resource-search");
const gradeFilter = document.querySelector("#grade-filter");
const typeFilter = document.querySelector("#type-filter");
const levelFilter = document.querySelector("#level-filter");
const fixedResourceGrade = resourceListContainer ? resourceListContainer.dataset.grade : "";
const homeTopicGroupsContainer = document.querySelector("#home-topic-groups");
const topicNavGroupsContainer = document.querySelector("#topic-nav-groups");
const topicGroupsContainer = document.querySelector("#topic-resource-groups");
const topicSearch = document.querySelector("#topic-search");
const resourceDetailContent = document.querySelector("#resource-detail-content");
const resourceDetailTitle = document.querySelector("#resource-detail-title");
const resourceDetailDescription = document.querySelector("#resource-detail-description");
const articleListContainer = document.querySelector("#article-list");
const homeArticlesContainer = document.querySelector("#home-articles");
const homeVocabularyFeatureContainer = document.querySelector("#home-vocabulary-feature");
const vocabCategoryGrid = document.querySelector("#vocab-category-grid");
const vocabResourceList = document.querySelector("#vocab-resource-list");
const vocabResourceCount = document.querySelector("#vocab-resource-count");
const vocabEmpty = document.querySelector("#vocab-empty");
const vocabSearch = document.querySelector("#vocab-search");
const vocabGradeFilter = document.querySelector("#vocab-grade-filter");
const vocabCategoryFilter = document.querySelector("#vocab-category-filter");
const articleSearch = document.querySelector("#article-search");
const articleCategoryFilter = document.querySelector("#article-category-filter");
const articleCount = document.querySelector("#article-count");
const articleDetailContent = document.querySelector("#article-detail-content");
const articleDetailTitle = document.querySelector("#article-detail-title");
const articleDetailDescription = document.querySelector("#article-detail-description");
const diagnosisForm = document.querySelector("#diagnosis-form");
const diagnosisError = document.querySelector("#diagnosis-error");
const diagnosisResult = document.querySelector("#diagnosis-result");
const waitlistForm = document.querySelector("#waitlist-form");
const waitlistError = document.querySelector("#waitlist-error");
const waitlistResult = document.querySelector("#waitlist-result");
const waitlistInterest = document.querySelector("#waitlist-interest");
const backToTopButton = document.createElement("button");
const defaultTopicGroups = [
  {
    group: "A卷题型",
    description: "A卷重点考查听力理解、基础语言运用、完形填空和阅读理解。",
    items: [
      "一、听句子选答语",
      "二、听句子选图片",
      "三、听对话选答案",
      "四、听短文填信息",
      "五、选短语",
      "六、补全对话",
      "七、完形填空",
      "八、阅读理解",
    ],
  },
  {
    group: "B卷题型",
    description: "B卷重点考查综合语言运用、篇章理解、信息提取和书面表达。",
    items: [
      "一、短文填空（十二选十）",
      "二、补全短文（六选五）",
      "三、阅读表达：A完成图表；B回答问题",
      "四、书面表达（写作）",
    ],
  },
];
let appResources = getAppDataList("resources");
let appArticles = getAppDataList("articles");
let appSiteConfig = getAppSiteConfig();
let appTopicGroups = getTopicGroups();
let topicTypes = appTopicGroups.flatMap((group) => group.items);
const vocabCategories = [
  {
    title: "同步词汇",
    items: ["七年级词汇", "八年级词汇", "九年级词汇"],
    description: "按七、八、九年级整理课内核心词汇和短语。",
  },
  {
    title: "中考高频词",
    items: ["高频动词", "高频名词", "高频形容词副词", "高频短语"],
    description: "整理中考阅读、完形、短文填空和作文中高频出现的词汇。",
  },
  {
    title: "易错易混词",
    items: ["近义词辨析", "固定搭配", "一词多义"],
    description: "辨析容易混淆、容易写错、容易用错的词。",
  },
  {
    title: "词汇训练",
    items: ["默写表", "听写表", "选择题", "句子填词", "作文表达升级"],
    description: "提供默写表、听写表、句子填词和表达升级训练。",
  },
];

function getAppDataList(key) {
  const fallback = window.STATIC_DATA_FALLBACK && window.STATIC_DATA_FALLBACK[key];

  const fallbackItems = normalizeDataList(fallback, key);

  if (fallbackItems) {
    return getPublishedItems(fallbackItems);
  }

  if (key === "resources" && typeof resources !== "undefined" && Array.isArray(resources)) {
    return getPublishedItems(resources);
  }

  if (key === "articles" && typeof articles !== "undefined" && Array.isArray(articles)) {
    return getPublishedItems(articles);
  }

  return [];
}

function normalizeDataList(data, key) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  if (Array.isArray(data[key])) {
    return data[key];
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return null;
}

function getPublishedItems(items) {
  return items.filter((item) => !item.status || item.status === "published");
}

function mergeArticleLists(baseArticles, markdownArticles) {
  const articleMap = new Map();

  [...(baseArticles || []), ...(markdownArticles || [])].forEach((article) => {
    if (article && article.id) {
      articleMap.set(article.id, article);
    }
  });

  return [...articleMap.values()];
}

function getAppSiteConfig() {
  if (window.STATIC_DATA_FALLBACK && window.STATIC_DATA_FALLBACK.siteConfig) {
    return window.STATIC_DATA_FALLBACK.siteConfig;
  }

  if (typeof siteConfig !== "undefined") {
    return siteConfig;
  }

  return {};
}

function getTopicGroups() {
  if (Array.isArray(appSiteConfig.topicGroups) && appSiteConfig.topicGroups.length) {
    return appSiteConfig.topicGroups;
  }

  return defaultTopicGroups;
}

function canFetchJsonData() {
  return typeof window !== "undefined" && window.location.protocol !== "file:" && typeof fetch === "function";
}

async function fetchJsonData(endpoint) {
  if (!endpoint || !canFetchJsonData()) {
    return null;
  }

  try {
    const response = await fetch(endpoint, { cache: "no-cache" });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

async function loadConfiguredData() {
  const endpoints = window.DATA_ENDPOINTS || {};
  const markdownArticlesEndpoint = endpoints.markdownArticles || "data/markdown-articles.json";
  const [resourcesData, articlesData, markdownArticlesData, siteConfigData] = await Promise.all([
    fetchJsonData(endpoints.resources),
    fetchJsonData(endpoints.articles),
    fetchJsonData(markdownArticlesEndpoint),
    fetchJsonData(endpoints.siteConfig),
  ]);

  const loadedResources = normalizeDataList(resourcesData, "resources");
  const loadedArticles = normalizeDataList(articlesData, "articles");
  const loadedMarkdownArticles = normalizeDataList(markdownArticlesData, "articles") || [];

  if (loadedResources) {
    appResources = getPublishedItems(loadedResources);
  }

  if (loadedArticles || loadedMarkdownArticles.length) {
    appArticles = getPublishedItems(mergeArticleLists(loadedArticles || appArticles, loadedMarkdownArticles));
  }

  if (siteConfigData && typeof siteConfigData === "object") {
    appSiteConfig = siteConfigData;
  }

  appTopicGroups = getTopicGroups();
  topicTypes = appTopicGroups.flatMap((group) => group.items);
}

function getCurrentPageName() {
  if (typeof window === "undefined") {
    return "index.html";
  }

  const currentPage = window.location.pathname.split("/").pop();
  return currentPage || "index.html";
}

function renderNavigationFromConfig() {
  if (!navMenu || !Array.isArray(appSiteConfig.navItems)) {
    return;
  }

  const currentPage = getCurrentPageName();
  const resourceCenterPages = new Set(["resources.html", "resource-detail.html", "grade-7.html", "grade-8.html", "grade-9.html", "topics.html", "premium.html"]);
  const items = appSiteConfig.navItems
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);

  navMenu.innerHTML = items
    .map((item) => {
      const children = Array.isArray(item.children)
        ? item.children.filter((child) => child.enabled).sort((a, b) => a.order - b.order)
        : [];
      const isResourceCenter = item.label === "资料中心" && resourceCenterPages.has(currentPage);
      const isCurrent = item.url === currentPage || isResourceCenter;
      const currentAttr = isCurrent ? ' aria-current="page"' : "";

      if (children.length) {
        return `
          <li class="nav-dropdown">
            <a class="nav-dropdown-link" href="${escapeHTML(item.url)}"${currentAttr}>${escapeHTML(item.label)}</a>
            <div class="nav-submenu" aria-label="${escapeHTML(item.label)}子导航">
              ${children.map((child) => `<a href="${escapeHTML(child.url)}">${escapeHTML(child.label)}</a>`).join("")}
            </div>
          </li>
        `;
      }

      return `<li><a href="${escapeHTML(item.url)}"${currentAttr}>${escapeHTML(item.label)}</a></li>`;
    })
    .join("");
}

function renderFooterLinksFromConfig() {
  // 页脚保持极简，不再动态追加和主导航重复或过多的入口。
}

function initPageBackLinks() {
  const currentPage = getCurrentPageName();
  const heroInner = document.querySelector(".page-hero-inner");

  if (!heroInner || currentPage === "index.html" || heroInner.querySelector(".page-back-actions")) {
    return;
  }

  const actions = document.createElement("div");
  actions.className = "page-back-actions";
  actions.innerHTML = `
    <button class="page-back-link" type="button">返回上一页</button>
    <a class="page-back-link" href="index.html">返回首页</a>
  `;

  const backButton = actions.querySelector("button");
  backButton.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "index.html";
  });

  heroInner.appendChild(actions);
}

function applyHomeSectionConfig() {
  if (!Array.isArray(appSiteConfig.homeSections)) {
    return;
  }

  const main = document.querySelector("main");
  const homeSections = [...document.querySelectorAll("[data-home-section]")];

  if (!main || !homeSections.length) {
    return;
  }

  const configById = new Map(appSiteConfig.homeSections.map((section) => [section.id, section]));

  homeSections.forEach((section) => {
    const config = configById.get(section.dataset.homeSection);

    if (!config) {
      return;
    }

    section.hidden = config.enabled === false;
  });

  homeSections
    .filter((section) => configById.has(section.dataset.homeSection))
    .sort((a, b) => {
      const aConfig = configById.get(a.dataset.homeSection);
      const bConfig = configById.get(b.dataset.homeSection);
      return Number(aConfig.order || 0) - Number(bConfig.order || 0);
    })
    .forEach((section) => main.appendChild(section));
}

if (navToggle && navMenu) {
  // 控制移动端菜单展开与收起，同时同步无障碍状态。
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
  });

  navMenu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) {
      return;
    }

    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeMarkdownUrl(url) {
  const trimmed = String(url || "").trim();

  if (/^(https?:\/\/|mailto:|#|\.{0,2}\/|[A-Za-z0-9_-]+[A-Za-z0-9_./#?=&%-]*$)/.test(trimmed)) {
    return escapeHTML(trimmed);
  }

  return "#";
}

function renderInlineMarkdown(value) {
  let html = escapeHTML(value);

  html = html.replace(/^ +/, (spaces) => spaces.replace(/ {2}/g, "&emsp;").replace(/ /g, "&nbsp;"));
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    return `<a href="${sanitizeMarkdownUrl(url)}" target="_blank" rel="noopener">${text}</a>`;
  });

  return html;
}

function normalizeMarkdownLine(line) {
  return String(line).replace(/^\\(?=\s)/, "");
}

function renderMarkdownArticle(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }

    const tag = listType === "ol" ? "ol" : "ul";
    blocks.push(`<${tag}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${tag}>`);
    listItems = [];
    listType = "";
  }

  lines.forEach((line) => {
    const normalizedLine = normalizeMarkdownLine(line);
    const trimmed = normalizedLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(Math.max(headingMatch[1].length, 2), 3);
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    const blockquoteMatch = trimmed.match(/^>\s+(.+)$/);

    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote><p>${renderInlineMarkdown(blockquoteMatch[1])}</p></blockquote>`);
      return;
    }

    const unorderedListMatch = trimmed.match(/^[-*+]\s+(.+)$/);

    if (unorderedListMatch) {
      flushParagraph();

      if (listType && listType !== "ul") {
        flushList();
      }

      listType = "ul";
      listItems.push(unorderedListMatch[1]);
      return;
    }

    const orderedListMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (orderedListMatch) {
      flushParagraph();

      if (listType && listType !== "ol") {
        flushList();
      }

      listType = "ol";
      listItems.push(orderedListMatch[1]);
      return;
    }

    flushList();
    paragraph.push(normalizedLine.trimEnd());
  });

  flushParagraph();
  flushList();

  return blocks.join("");
}

function createTopicUrl(type) {
  return `topics.html?type=${encodeURIComponent(type)}`;
}

function getSelectedTopicType() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("type") || "";
}

function renderTopicGroupCards(groups, options = {}) {
  const { activeType = "", linkToQuery = true } = options;

  return groups
    .map(
      (group) => `
        <section class="topic-group-card" aria-label="${escapeHTML(group.group)}">
          <div class="topic-group-heading">
            <h3>${escapeHTML(group.group)}</h3>
            <p>${escapeHTML(group.description)}</p>
          </div>
          <div class="topic-card-grid">
            ${group.items
              .map((type) => {
                const href = linkToQuery ? createTopicUrl(type) : `#${encodeURIComponent(type)}`;
                const activeClass = type === activeType ? " is-active" : "";
                return `<a class="topic-card${activeClass}" href="${href}" data-topic-type="${escapeHTML(type)}">${escapeHTML(type)}</a>`;
              })
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderHomeTopicGroups() {
  if (!homeTopicGroupsContainer) {
    return;
  }

  homeTopicGroupsContainer.innerHTML = renderTopicGroupCards(appTopicGroups);
}

function populateTypeFilterOptions() {
  if (!typeFilter) {
    return;
  }

  const currentValue = typeFilter.value || "全部";
  typeFilter.innerHTML = `<option value="全部">全部题型</option>${appTopicGroups
    .map(
      (group) => `
        <optgroup label="${escapeHTML(group.group)}">
          ${group.items.map((item) => `<option value="${escapeHTML(item)}">${escapeHTML(item)}</option>`).join("")}
        </optgroup>
      `
    )
    .join("")}`;

  if ([...typeFilter.options].some((option) => option.value === currentValue)) {
    typeFilter.value = currentValue;
  }
}

function createVocabCategoryUrl(category) {
  return `vocabulary.html?vocabCategory=${encodeURIComponent(category)}`;
}

function getSelectedVocabCategory() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("vocabCategory") || "";
}

function createVocabCategoryCard(category) {
  return `
    <a class="vocab-category-card" href="${createVocabCategoryUrl(category.title)}">
      <span>${escapeHTML(category.title)}</span>
      <strong>${escapeHTML(category.description)}</strong>
      <small>${category.items.map((item) => escapeHTML(item)).join(" / ")}</small>
    </a>
  `;
}

function renderHomeVocabularyFeature() {
  if (!homeVocabularyFeatureContainer) {
    return;
  }

  const sectionConfig = (appSiteConfig.homeSections || []).find((section) => section.id === "vocabulary-feature");

  if (sectionConfig && !sectionConfig.enabled) {
    const section = homeVocabularyFeatureContainer.closest("[data-home-section='vocabulary-feature']");
    if (section) {
      section.hidden = true;
    }
    return;
  }

  homeVocabularyFeatureContainer.innerHTML = vocabCategories.map(createVocabCategoryCard).join("");
}

function renderVocabCategoryGrid() {
  if (!vocabCategoryGrid) {
    return;
  }

  const selectedCategory = getSelectedVocabCategory();
  vocabCategoryGrid.innerHTML = vocabCategories
    .map((category) => {
      const activeClass = selectedCategory === category.title ? " is-active" : "";
      return createVocabCategoryCard(category).replace("vocab-category-card", `vocab-category-card${activeClass}`);
    })
    .join("");
}

function getVocabularyResources() {
  return appResources.filter((resource) => resource.category === "词汇中心" || resource.skill === "词汇");
}

function getFilteredVocabularyResources() {
  const keyword = vocabSearch ? vocabSearch.value.trim().toLowerCase() : "";
  const selectedGrade = vocabGradeFilter ? vocabGradeFilter.value : "全部";
  const selectedCategory = vocabCategoryFilter ? vocabCategoryFilter.value : "全部";

  return getVocabularyResources().filter((resource) => {
    const searchableText = [
      resource.title,
      resource.description,
      resource.target,
      resource.vocabCategory,
      ...(resource.tags || []),
    ]
      .join(" ")
      .toLowerCase();
    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesGrade = selectedGrade === "全部" || resource.grade === selectedGrade;
    const matchesCategory = selectedCategory === "全部" || resource.vocabCategory === selectedCategory;

    return matchesKeyword && matchesGrade && matchesCategory;
  });
}

function renderVocabularyResources() {
  if (!vocabResourceList) {
    return;
  }

  const filteredResources = getFilteredVocabularyResources();
  vocabResourceList.innerHTML = filteredResources
    .map((resource) => createResourceCard(resource, { showDetail: true }))
    .join("");

  if (vocabResourceCount) {
    vocabResourceCount.textContent = `共 ${filteredResources.length} 份词汇资料`;
  }

  if (vocabEmpty) {
    vocabEmpty.hidden = filteredResources.length > 0;
  }
}

function initVocabularyPage() {
  if (!vocabResourceList) {
    return;
  }

  const selectedCategory = getSelectedVocabCategory();
  if (selectedCategory && vocabCategoryFilter) {
    vocabCategoryFilter.value = selectedCategory;
  }

  renderVocabCategoryGrid();
  renderVocabularyResources();

  [vocabSearch, vocabGradeFilter, vocabCategoryFilter].forEach((control) => {
    if (control) {
      control.addEventListener("input", renderVocabularyResources);
      control.addEventListener("change", renderVocabularyResources);
    }
  });
}

function renderFeaturedResources() {
  if (!featuredResourcesContainer || !appResources.length) {
    return;
  }

  const featuredResources = appResources.filter((resource) => resource.featured).slice(0, 6);

  featuredResourcesContainer.innerHTML = featuredResources
    .map((resource) => createResourceCard(resource, { showDetail: true }))
    .join("");
}

function normalizeGradeFilter(grade) {
  return grade === "通用" ? "全学段" : grade;
}

function createResourceCard(resource, options = {}) {
  const { showDetail = true, showType = true } = options;
  const detailButton = showDetail
    ? `<a class="btn btn-secondary" href="resource-detail.html?id=${encodeURIComponent(resource.id)}">查看详情</a>`
    : "";
  const typeBadge = showType ? `<span>${escapeHTML(resource.type)}</span>` : "";

  return `
    <article class="resource-card">
      <div class="resource-meta">
        <span>${escapeHTML(resource.grade)}</span>
        ${typeBadge}
        <span>${escapeHTML(resource.level)}</span>
      </div>
      <h3>${escapeHTML(resource.title)}</h3>
      <p class="resource-target">适合对象：${escapeHTML(resource.target)}</p>
      <p class="resource-description">${escapeHTML(resource.description)}</p>
      <div class="resource-actions${showDetail ? "" : " resource-actions-single"}">
        ${detailButton}
        <a class="btn btn-primary download-link" href="${escapeHTML(resource.file)}" data-file="${escapeHTML(resource.file)}">
          下载资料
        </a>
      </div>
    </article>
  `;
}

function getFilteredResources() {
  if (!appResources.length) {
    return [];
  }

  const keyword = resourceSearch ? resourceSearch.value.trim().toLowerCase() : "";
  const selectedGrade = fixedResourceGrade || normalizeGradeFilter(gradeFilter ? gradeFilter.value : "全部");
  const selectedType = typeFilter ? typeFilter.value : "全部";
  const selectedLevel = levelFilter ? levelFilter.value : "全部";

  return appResources.filter((resource) => {
    const searchableText = [resource.title, resource.description, resource.target]
      .join(" ")
      .toLowerCase();
    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesGrade = selectedGrade === "全部" || resource.grade === selectedGrade;
    const matchesType = selectedType === "全部" || resource.type === selectedType;
    const matchesLevel = selectedLevel === "全部" || resource.level === selectedLevel;

    return matchesKeyword && matchesGrade && matchesType && matchesLevel;
  });
}

function renderResourceList() {
  if (!resourceListContainer) {
    return;
  }

  const filteredResources = getFilteredResources();
  resourceListContainer.innerHTML = filteredResources
    .map((resource) => createResourceCard(resource, { showDetail: true }))
    .join("");

  if (resourceCount) {
    resourceCount.textContent = `共 ${filteredResources.length} 份资料`;
  }

  if (resourceEmpty) {
    resourceEmpty.hidden = filteredResources.length > 0;
  }
}

function bindResourceFilters() {
  [resourceSearch, gradeFilter, typeFilter, levelFilter].forEach((control) => {
    if (control) {
      control.addEventListener("input", renderResourceList);
      control.addEventListener("change", renderResourceList);
    }
  });
}

function getTopicSearchKeyword() {
  return topicSearch ? topicSearch.value.trim().toLowerCase() : "";
}

function matchesTopicSearch(resource, keyword) {
  if (!keyword) {
    return true;
  }

  return [resource.title, resource.description, resource.target, resource.type, resource.category, ...(resource.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

function renderTopicResourceGroups() {
  if (!topicGroupsContainer) {
    return;
  }

  const keyword = getTopicSearchKeyword();
  const selectedType = getSelectedTopicType();
  const visibleGroups = selectedType
    ? appTopicGroups
        .map((group) => ({ ...group, items: group.items.filter((item) => item === selectedType) }))
        .filter((group) => group.items.length)
    : appTopicGroups;

  if (topicNavGroupsContainer) {
    topicNavGroupsContainer.innerHTML = renderTopicGroupCards(appTopicGroups, { activeType: selectedType });
  }

  if (!visibleGroups.length) {
    topicGroupsContainer.innerHTML = `<p class="empty-state">该题型资料正在整理中，后续会持续更新。</p>`;
    return;
  }

  topicGroupsContainer.innerHTML = visibleGroups
    .map(
      (group) => `
        <section class="topic-section" aria-label="${escapeHTML(group.group)}">
          <div class="topic-section-header">
            <div>
              <h2>${escapeHTML(group.group)}</h2>
              <p>${escapeHTML(group.description)}</p>
            </div>
          </div>
          ${group.items
            .map((type) => {
              const topicResources = appResources.filter(
                (resource) => resource.type === type && matchesTopicSearch(resource, keyword)
              );
              return `
                <section class="topic-type-block" id="${encodeURIComponent(type)}" aria-label="${escapeHTML(type)}">
                  <div class="topic-section-header">
                    <div>
                      <h3>${escapeHTML(type)}</h3>
                      <p>${topicResources.length ? "已整理对应专项资料，可按需查看详情或下载。" : "该题型资料正在整理中，后续会持续更新。"}</p>
                    </div>
                    <span class="topic-count">${topicResources.length} 份资料</span>
                  </div>
                  <div class="resource-grid resource-list-grid">
                    ${
                      topicResources.length
                        ? topicResources
                            .map((resource) => createResourceCard(resource, { showDetail: true, showType: false }))
                            .join("")
                        : `<p class="empty-state">该题型资料正在整理中，后续会持续更新。</p>`
                    }
                  </div>
                </section>
              `;
            })
            .join("")}
        </section>
      `
    )
    .join("");
}

function getResourceDetailId() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("id") || "";
}

function getRelatedResources(resource) {
  const related = appResources.filter(
    (item) => item.id !== resource.id && (item.grade === resource.grade || item.type === resource.type)
  );
  const fallback = appResources.filter(
    (item) => item.id !== resource.id && !related.some((relatedItem) => relatedItem.id === item.id)
  );

  return [...related, ...fallback].slice(0, 3);
}

function renderResourceNotFound() {
  document.title = "未找到资料 - 成都中考英语加油站";

  if (resourceDetailTitle) {
    resourceDetailTitle.textContent = "未找到该资料";
  }

  if (resourceDetailDescription) {
    resourceDetailDescription.textContent = "未找到该资料，请返回免费资料页查看。";
  }

  if (resourceDetailContent) {
    resourceDetailContent.innerHTML = `
      <div class="empty-state">
        <p>未找到该资料，请返回免费资料页查看。</p>
        <p><a class="btn btn-primary" href="resources.html">返回免费资料页</a></p>
      </div>
    `;
  }
}

function renderResourceDetail() {
  if (!resourceDetailContent || !appResources.length) {
    return;
  }

  const resourceId = getResourceDetailId();
  const resource = appResources.find((item) => item.id === resourceId);

  if (!resource) {
    renderResourceNotFound();
    return;
  }

  const relatedResources = getRelatedResources(resource);
  const metaDescription = document.querySelector("meta[name='description']");
  const resourceContents = Array.isArray(resource.contents) && resource.contents.length
    ? resource.contents
    : ["资料内容正在整理中，后续会持续补充。"];
  const resourceUsage = resource.usage || "建议先通读资料说明，再按题目顺序完成练习，最后结合错题进行复盘。";

  document.title = `${resource.title} - 成都中考英语加油站`;

  if (metaDescription) {
    metaDescription.setAttribute("content", `${resource.description} 适合对象：${resource.target}`);
  }

  if (resourceDetailTitle) {
    resourceDetailTitle.textContent = resource.title;
  }

  if (resourceDetailDescription) {
    resourceDetailDescription.textContent = resource.description;
  }

  resourceDetailContent.innerHTML = `
    <div class="detail-layout">
      <article class="detail-panel">
        <div class="detail-tags">
          <span>${escapeHTML(resource.grade)}</span>
          <span>${escapeHTML(resource.type)}</span>
          <span>${escapeHTML(resource.level)}</span>
        </div>

        <section aria-labelledby="detail-target-title">
          <h2 id="detail-target-title">适合对象</h2>
          <p>${escapeHTML(resource.target)}</p>
        </section>

        <section aria-labelledby="detail-description-title">
          <h2 id="detail-description-title">资料简介</h2>
          <p>${escapeHTML(resource.description)}</p>
        </section>

        <section aria-labelledby="detail-usage-title">
          <h2 id="detail-usage-title">使用方法</h2>
          <p>${escapeHTML(resourceUsage)}</p>
        </section>

        <section aria-labelledby="detail-contents-title">
          <h2 id="detail-contents-title">包含内容列表</h2>
          <ul class="content-list">
            ${resourceContents.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
          </ul>
        </section>
      </article>

      <aside class="detail-side" aria-label="资料下载和提示">
        <div class="detail-side-card">
          <h2>下载资料</h2>
          <p>建议下载后打印使用，完成后结合错题本复盘。</p>
          <a class="btn btn-primary download-link" href="${escapeHTML(resource.file)}" data-file="${escapeHTML(resource.file)}">
            下载资料
          </a>
        </div>

        <div class="detail-side-card detail-step-card">
          <h2>建议使用顺序</h2>
          <ol class="detail-step-list">
            <li>先看适合对象，确认是否符合孩子当前阶段。</li>
            <li>按资料要求限时完成，不建议边看答案边做。</li>
            <li>完成后标出错题原因，再决定是否进入下一份资料。</li>
          </ol>
        </div>

        <div class="copyright-note">
          本站优先发布原创资料，资料仅供学习交流使用，禁止未经授权的商业转售。
        </div>
      </aside>
    </div>

    <section class="related-section" aria-labelledby="related-title">
      <div class="section-heading section-heading-row resources-heading">
        <div>
          <p class="section-kicker">相关推荐</p>
          <h2 id="related-title">同年级或同题型资料</h2>
        </div>
      </div>
      <div class="resource-grid resource-list-grid">
        ${relatedResources.map((item) => createResourceCard(item, { showDetail: true })).join("")}
      </div>
    </section>

    <section class="community-cta" aria-labelledby="community-title">
      <div>
        <p class="section-kicker">持续更新</p>
        <h2 id="community-title">想持续获取成都中考英语资料更新？</h2>
        <p>可以关注后续资料包或加入家长资料群。</p>
      </div>
      <div class="community-actions">
        <a class="btn btn-secondary" href="resources.html">返回免费资料页</a>
        <a class="btn btn-primary" href="diagnosis.html">做一次学习诊断</a>
      </div>
    </section>
  `;
}

function createArticleCard(article) {
  const articleDate = article.date || article.updatedAt || "";
  const articleUrl = article.url || `article-detail.html?id=${encodeURIComponent(article.id)}`;
  const pinnedBadge = article.pinned ? `<span class="article-pin-badge">置顶推荐</span>` : "";
  const featuredBadge = article.featured && !article.pinned ? `<span class="article-featured-badge">重点文章</span>` : "";

  return `
    <article class="article-card${article.pinned ? " is-pinned" : ""}">
      <div class="article-meta">
        <span>${escapeHTML(article.category)}</span>
        <time datetime="${escapeHTML(articleDate)}">${escapeHTML(articleDate)}</time>
      </div>
      <div class="article-badges">
        ${pinnedBadge}
        ${featuredBadge}
      </div>
      <h3>${escapeHTML(article.title)}</h3>
      <p class="article-target">适合人群：${escapeHTML(article.target)}</p>
      <p>${escapeHTML(article.description)}</p>
      <a class="btn btn-primary" href="${escapeHTML(articleUrl)}">阅读文章</a>
    </article>
  `;
}

function getArticleSortTime(article) {
  const value = article.updatedAt || article.date || "";
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function getSortedArticles(articles) {
  return [...articles].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }

    if (Boolean(a.featured) !== Boolean(b.featured)) {
      return a.featured ? -1 : 1;
    }

    return getArticleSortTime(b) - getArticleSortTime(a);
  });
}

function initArticleCategoryFilter() {
  if (!articleCategoryFilter || !appArticles.length) {
    return;
  }

  const categories = [...new Set(appArticles.map((article) => article.category))];
  articleCategoryFilter.innerHTML = `<option value="全部">全部</option>${categories
    .map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`)
    .join("")}`;
  articleCategoryFilter.addEventListener("change", renderArticleList);

  if (articleSearch) {
    articleSearch.addEventListener("input", renderArticleList);
  }
}

function renderArticleList() {
  if (!articleListContainer || !appArticles.length) {
    return;
  }

  const keyword = articleSearch ? articleSearch.value.trim().toLowerCase() : "";
  const selectedCategory = articleCategoryFilter && articleCategoryFilter.value ? articleCategoryFilter.value : "全部";
  const filteredArticles = appArticles.filter((article) => {
    const searchableText = [article.title, article.description, article.target, article.category, ...(article.tags || [])]
      .join(" ")
      .toLowerCase();
    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesCategory = selectedCategory === "全部" || article.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  articleListContainer.innerHTML = getSortedArticles(filteredArticles).map(createArticleCard).join("");

  if (articleCount) {
    articleCount.textContent = `共 ${filteredArticles.length} 篇文章`;
  }
}

function renderHomeArticles() {
  if (!homeArticlesContainer || !appArticles.length) {
    return;
  }

  homeArticlesContainer.innerHTML = getSortedArticles(appArticles).slice(0, 3).map(createArticleCard).join("");
}

function getArticleDetailId() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("id") || "";
}

function renderArticleNotFound() {
  document.title = "未找到文章 - 成都中考英语加油站";

  if (articleDetailTitle) {
    articleDetailTitle.textContent = "未找到文章";
  }

  if (articleDetailDescription) {
    articleDetailDescription.textContent = "未找到文章，请返回备考文章页查看。";
  }

  if (articleDetailContent) {
    articleDetailContent.innerHTML = `
      <div class="empty-state">
        <p>未找到文章，请返回备考文章页查看。</p>
        <p><a class="btn btn-primary" href="articles.html">返回备考文章页</a></p>
      </div>
    `;
  }
}

function getArticleRelatedResources(article) {
  const relatedTypes = Array.isArray(article.relatedResourceTypes) ? article.relatedResourceTypes : [];

  return appResources
    .filter((resource) => relatedTypes.includes(resource.type))
    .slice(0, 3);
}

function renderArticleBody(article) {
  if (article.contentMarkdown) {
    return renderMarkdownArticle(article.contentMarkdown);
  }

  if (Array.isArray(article.content)) {
    return article.content
      .map((section) => {
        const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
        return `
          <section>
            <h2>${escapeHTML(section.heading || "正文")}</h2>
            ${paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
          </section>
        `;
      })
      .join("");
  }

  if (typeof article.content === "string") {
    return `<p>${escapeHTML(article.content)}</p>`;
  }

  return `<p>${escapeHTML(article.description || "这篇文章内容正在整理中。")}</p>`;
}

function stripHTMLText(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&emsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function buildArticleBodyWithToc(bodyHtml) {
  const tocItems = [];
  let headingIndex = 0;
  const html = String(bodyHtml || "").replace(/<h([23])>(.*?)<\/h\1>/g, (match, level, headingHtml) => {
    headingIndex += 1;
    const id = `article-section-${headingIndex}`;
    const text = stripHTMLText(headingHtml);

    if (text) {
      tocItems.push({ id, level, text });
    }

    return `<h${level} id="${id}">${headingHtml}</h${level}>`;
  });

  if (tocItems.length < 2) {
    return { html, toc: "" };
  }

  const toc = `
    <nav class="article-toc" aria-label="文章目录">
      <h2>本文目录</h2>
      <ol>
        ${tocItems
          .map(
            (item) => `
              <li class="toc-level-${escapeHTML(item.level)}">
                <a href="#${escapeHTML(item.id)}">${escapeHTML(item.text)}</a>
              </li>
            `
          )
          .join("")}
      </ol>
    </nav>
  `;

  return { html, toc };
}

function renderArticleFaq(article) {
  if (!Array.isArray(article.faq) || !article.faq.length) {
    return "";
  }

  return `
    <section class="faq-section" aria-labelledby="article-faq-title">
      <h2 id="article-faq-title">FAQ 问答区</h2>
      ${article.faq
        .map(
          (item) => `
            <article class="faq-item">
              <h3>${escapeHTML(item.question)}</h3>
              <p>${escapeHTML(item.answer)}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderArticleDetail() {
  if (!articleDetailContent || !appArticles.length) {
    return;
  }

  const articleId = getArticleDetailId();
  const article = appArticles.find((item) => item.id === articleId);

  if (!article) {
    renderArticleNotFound();
    return;
  }

  const metaDescription = document.querySelector("meta[name='description']");
  const relatedResources = getArticleRelatedResources(article);
  const articleDate = article.date || article.updatedAt || "";
  const articleBadges = [
    article.pinned ? `<span class="article-pin-badge">置顶推荐</span>` : "",
    article.featured && !article.pinned ? `<span class="article-featured-badge">重点文章</span>` : "",
  ].join("");
  const articleBody = buildArticleBodyWithToc(renderArticleBody(article));

  document.title = `${article.title} - 成都中考英语加油站`;

  if (metaDescription) {
    metaDescription.setAttribute("content", article.description);
  }

  if (articleDetailTitle) {
    articleDetailTitle.textContent = article.title;
  }

  if (articleDetailDescription) {
    articleDetailDescription.textContent = article.description;
  }

  articleDetailContent.innerHTML = `
    <article class="article-detail-layout">
      <div class="article-body">
        <div class="article-meta article-detail-meta">
          <span>${escapeHTML(article.category)}</span>
          <time datetime="${escapeHTML(articleDate)}">${escapeHTML(articleDate)}</time>
        </div>
        <div class="article-badges article-detail-badges">${articleBadges}</div>
        <p class="article-target">适合人群：${escapeHTML(article.target)}</p>
        ${articleBody.toc}
        ${articleBody.html}
        ${renderArticleFaq(article)}
      </div>
    </article>

    <section class="related-section" aria-labelledby="article-related-title">
      <div class="section-heading section-heading-row resources-heading">
        <div>
          <p class="section-kicker">配套练习</p>
          <h2 id="article-related-title">相关推荐资料</h2>
        </div>
      </div>
      <div class="resource-grid resource-list-grid">
        ${relatedResources.map((resource) => createResourceCard(resource, { showDetail: true })).join("")}
      </div>
    </section>

    <section class="community-cta" aria-labelledby="article-resource-cta-title">
      <div>
        <p class="section-kicker">方法配合练习</p>
        <h2 id="article-resource-cta-title">看完方法后，建议配合对应资料练习。</h2>
        <p>可以前往免费资料区下载。</p>
      </div>
      <div class="community-actions">
        <a class="btn btn-primary" href="resources.html">前往免费资料区</a>
      </div>
    </section>

    <section class="community-cta" aria-labelledby="article-diagnosis-cta-title">
      <div>
        <p class="section-kicker">先诊断再规划</p>
        <h2 id="article-diagnosis-cta-title">不确定孩子该先补哪里？可以做一次学习诊断。</h2>
      </div>
      <div class="community-actions">
        <a class="btn btn-secondary" href="diagnosis.html">做一次学习诊断</a>
      </div>
    </section>
  `;
}

const scoreAdvice = {
  "60分以下": "先补单词、基础句型和课本内容。",
  "60-80分": "重点补词汇、基础语法和简单阅读。",
  "80-100分": "补语法漏洞、阅读方法和作文基本表达。",
  "100-110分": "提高准确率、限时训练和作文升级。",
  "110分以上": "冲刺细节、速度、复杂句和高级表达。",
};

function handleDiagnosisSubmit(event) {
  event.preventDefault();

  if (!diagnosisForm || !diagnosisResult || !diagnosisError) {
    return;
  }

  const formData = new FormData(diagnosisForm);
  const isValid =
    formData.get("grade") &&
    formData.get("score") &&
    formData.get("weakness") &&
    formData.get("goal") &&
    formData.get("contact") &&
    formData.get("updates") &&
    formData.get("privacy");

  diagnosisError.hidden = Boolean(isValid);

  if (!isValid) {
    diagnosisResult.hidden = true;
    return;
  }

  const score = formData.get("score");
  diagnosisResult.hidden = false;
  diagnosisResult.innerHTML = `
    <h2>诊断表已模拟提交</h2>
    <p>正式上线后可接入飞书表单、腾讯问卷、金数据或后端数据库。</p>
    <h3>初步学习建议</h3>
    <p>${escapeHTML(scoreAdvice[score] || "建议先根据错题和薄弱题型做一次系统梳理。")}</p>
  `;
}

function initWaitlistPage() {
  if (!waitlistForm || !waitlistInterest) {
    return;
  }

  const interest = new URLSearchParams(window.location.search).get("interest");

  if (interest && [...waitlistInterest.options].some((option) => option.value === interest)) {
    waitlistInterest.value = interest;
  }
}

function handleWaitlistSubmit(event) {
  event.preventDefault();

  if (!waitlistForm || !waitlistResult || !waitlistError) {
    return;
  }

  const formData = new FormData(waitlistForm);
  const isValid =
    formData.get("parentName") &&
    formData.get("grade") &&
    formData.get("score") &&
    formData.get("interest") &&
    formData.get("contact") &&
    formData.get("updates");

  waitlistError.hidden = Boolean(isValid);

  if (!isValid) {
    waitlistResult.hidden = true;
    return;
  }

  waitlistResult.hidden = false;
  waitlistResult.innerHTML = `
    <h2>预约信息已模拟提交</h2>
    <p>正式上线后可接入飞书表单、腾讯问卷、金数据或后端数据库。</p>
    <p>第一版不会真实保存信息。正式收集信息前，会明确说明用途并征得同意。</p>
  `;
}

if (topicSearch) {
  topicSearch.addEventListener("input", renderTopicResourceGroups);
}

if (diagnosisForm) {
  diagnosisForm.addEventListener("submit", handleDiagnosisSubmit);
}

if (waitlistForm) {
  waitlistForm.addEventListener("submit", handleWaitlistSubmit);
}

function initBackToTop() {
  backToTopButton.className = "back-to-top";
  backToTopButton.type = "button";
  backToTopButton.setAttribute("aria-label", "返回顶部");
  backToTopButton.textContent = "↑";
  document.body.appendChild(backToTopButton);

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const updateBackToTop = () => {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 420);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
}

document.addEventListener("click", (event) => {
  const downloadLink = event.target.closest(".download-link");

  if (!downloadLink) {
    return;
  }

  if (downloadLink.dataset.file === "#") {
    event.preventDefault();
    alert("示例资料暂未上传，后续可替换为真实 PDF 链接。");
    return;
  }

  event.preventDefault();
  verifyAndOpenDownload(downloadLink.dataset.file);
});

async function verifyAndOpenDownload(file) {
  try {
    const response = await fetch(file, { method: "HEAD" });

    if (!response.ok) {
      throw new Error("File not found");
    }

    window.open(file, "_blank", "noopener");
  } catch (error) {
    alert("资料文件暂未上传，请稍后再试。");
  }
}

async function initApp() {
  await loadConfiguredData();
  renderNavigationFromConfig();
  renderFooterLinksFromConfig();
  initPageBackLinks();
  applyHomeSectionConfig();
  renderFeaturedResources();
  renderHomeArticles();
  renderHomeTopicGroups();
  renderHomeVocabularyFeature();
  populateTypeFilterOptions();
  bindResourceFilters();
  renderResourceList();
  renderTopicResourceGroups();
  renderResourceDetail();
  initVocabularyPage();
  initArticleCategoryFilter();
  renderArticleList();
  renderArticleDetail();
  initWaitlistPage();
  initBackToTop();
}

initApp();
