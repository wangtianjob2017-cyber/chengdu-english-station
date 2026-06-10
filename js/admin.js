const STORAGE_KEY = "chengduEnglishStationAdminDraft";
const CORE_HOME_SECTIONS = new Set([
  "hero",
  "value-cards",
  "grade-cards",
  "topic-cards",
  "vocabulary-feature",
  "featured-resources",
  "resource-list",
  "parent-articles",
  "article-list",
  "score-path",
  "home-diagnosis-cta",
  "home-ad-placeholder",
]);

let adminState = {
  resources: [],
  articles: [],
  siteConfig: {},
};

let pendingImportType = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const importFileInput = $("#admin-import-file");
const statusEl = $("#admin-status");
const summaryEl = $("#admin-summary");

const articleListEl = $("#article-admin-list");
const articleEditorEl = $("#article-editor");
const resourceListEl = $("#resource-admin-list");
const resourceEditorEl = $("#resource-editor");
const homeSectionListEl = $("#home-section-list");
const homeSectionEditorEl = $("#home-section-editor");
const navItemListEl = $("#nav-item-list");
const navItemEditorEl = $("#nav-item-editor");
const topicGroupEditorEl = $("#topic-group-editor");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseList(value) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(value) {
  return Array.isArray(value) ? value.join("，") : "";
}

function normalizeContentInput(value) {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [
      {
        heading: "正文",
        paragraphs: ["请在这里补充文章内容。"],
      },
    ];
  }

  return [
    {
      heading: "正文",
      paragraphs: lines,
    },
  ];
}

function contentToText(content) {
  if (Array.isArray(content)) {
    return content
      .map((section) => {
        if (typeof section === "string") {
          return section;
        }

        return [section.heading, ...(section.paragraphs || [])].filter(Boolean).join("\n");
      })
      .join("\n\n");
  }

  return String(content || "");
}

function setStatus(message, type = "info") {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function getFallbackData() {
  const fallback = window.STATIC_DATA_FALLBACK || {};

  return {
    resources: clone(normalizeDataList(fallback.resources, "resources") || []),
    articles: clone(normalizeDataList(fallback.articles, "articles") || []),
    siteConfig: fallback.siteConfig ? clone(fallback.siteConfig) : {},
  };
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

function normalizeExportData(type) {
  if (type === "resources") {
    return { resources: adminState.resources };
  }

  if (type === "articles") {
    return { articles: adminState.articles };
  }

  return adminState[type];
}

async function fetchJson(url) {
  if (window.location.protocol === "file:") {
    return null;
  }

  try {
    const response = await fetch(url, { cache: "no-cache" });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

async function loadInitialData() {
  const fallback = getFallbackData();
  const endpoints = window.DATA_ENDPOINTS || {};
  const [resourcesData, articlesData, siteConfigData] = await Promise.all([
    fetchJson(endpoints.resources),
    fetchJson(endpoints.articles),
    fetchJson(endpoints.siteConfig),
  ]);

  adminState = {
    resources: normalizeDataList(resourcesData, "resources") || fallback.resources,
    articles: normalizeDataList(articlesData, "articles") || fallback.articles,
    siteConfig: siteConfigData && typeof siteConfigData === "object" ? siteConfigData : fallback.siteConfig,
  };
}

function renderSummary() {
  if (!summaryEl) {
    return;
  }

  const homeSections = adminState.siteConfig.homeSections || [];
  const navItems = adminState.siteConfig.navItems || [];

  summaryEl.innerHTML = `
    <article><strong>${adminState.resources.length}</strong><span>资料</span></article>
    <article><strong>${adminState.articles.length}</strong><span>文章</span></article>
    <article><strong>${homeSections.length}</strong><span>首页板块</span></article>
    <article><strong>${navItems.length}</strong><span>导航项</span></article>
  `;
}

function rerenderAll() {
  renderSummary();
  populateArticleFilters();
  renderArticles();
  populateResourceFilters();
  renderResources();
  renderHomeSections();
  renderNavItems();
  renderTopicGroups();
}

function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saveLocalDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminState));
  setStatus("已保存到本浏览器。本地草稿不会自动更新 GitHub。", "success");
}

function restoreLocalDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    setStatus("未找到本地草稿。", "warn");
    return;
  }

  try {
    const draft = JSON.parse(raw);
    adminState = {
      resources: normalizeDataList(draft.resources, "resources") || [],
      articles: normalizeDataList(draft.articles, "articles") || [],
      siteConfig: draft.siteConfig && typeof draft.siteConfig === "object" ? draft.siteConfig : {},
    };
    rerenderAll();
    setStatus("已从本浏览器恢复草稿。", "success");
  } catch (error) {
    setStatus("本地草稿解析失败，请清空后重新保存。", "error");
  }
}

function clearLocalDraft() {
  if (!confirm("确定要清空本地草稿吗？这不会影响 data 目录中的 JSON 文件。")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  setStatus("已清空本地草稿。", "success");
}

function handleImportClick(type) {
  pendingImportType = type;
  importFileInput.value = "";
  importFileInput.click();
}

function handleImportFile(event) {
  const file = event.target.files && event.target.files[0];

  if (!file || !pendingImportType) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (pendingImportType === "resources" && !normalizeDataList(data, "resources")) {
        throw new Error("resources.json 必须包含资料数组");
      }

      if (pendingImportType === "articles" && !normalizeDataList(data, "articles")) {
        throw new Error("articles.json 必须包含文章数组");
      }

      if (pendingImportType === "siteConfig" && (!data || typeof data !== "object" || Array.isArray(data))) {
        throw new Error("site-config.json 必须是对象");
      }

      if (pendingImportType === "resources" || pendingImportType === "articles") {
        adminState[pendingImportType] = normalizeDataList(data, pendingImportType);
      } else {
        adminState[pendingImportType] = data;
      }
      rerenderAll();
      setStatus(`已导入 ${file.name}。`, "success");
    } catch (error) {
      setStatus(`导入失败：${error.message}`, "error");
    }
  };
  reader.readAsText(file, "utf-8");
}

function bindTopControls() {
  $$("[data-import]").forEach((button) => {
    button.addEventListener("click", () => handleImportClick(button.dataset.import));
  });

  $$("[data-export]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.export;
      const filename = type === "siteConfig" ? "site-config.json" : `${type}.json`;
      downloadJson(filename, normalizeExportData(type));
    });
  });

  if (importFileInput) {
    importFileInput.addEventListener("change", handleImportFile);
  }

  $("#admin-save-local").addEventListener("click", saveLocalDraft);
  $("#admin-restore-local").addEventListener("click", restoreLocalDraft);
  $("#admin-clear-local").addEventListener("click", clearLocalDraft);
}

function bindTabs() {
  $$("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      $$("[data-admin-tab]").forEach((tab) => tab.classList.remove("is-active"));
      $$(".admin-panel").forEach((panel) => panel.classList.remove("is-active"));
      button.classList.add("is-active");
      $(`#admin-tab-${button.dataset.adminTab}`).classList.add("is-active");
    });
  });
}

function fillSelect(select, values, current = "全部") {
  if (!select) {
    return;
  }

  const uniqueValues = ["全部", ...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== ""))];
  select.innerHTML = uniqueValues.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");

  if (uniqueValues.includes(current)) {
    select.value = current;
  }
}

function populateArticleFilters() {
  fillSelect($("#article-admin-category"), adminState.articles.map((article) => article.category), $("#article-admin-category")?.value || "全部");
}

function getFilteredArticles() {
  const keyword = ($("#article-admin-search")?.value || "").trim().toLowerCase();
  const category = $("#article-admin-category")?.value || "全部";
  const status = $("#article-admin-status")?.value || "全部";

  return adminState.articles.filter((article) => {
    const text = [article.title, article.description, article.target, article.category, ...(article.tags || [])]
      .join(" ")
      .toLowerCase();
    return (!keyword || text.includes(keyword)) && (category === "全部" || article.category === category) && (status === "全部" || article.status === status);
  });
}

function renderArticles() {
  if (!articleListEl) {
    return;
  }

  const articles = getFilteredArticles();

  articleListEl.innerHTML = articles
    .map((article) => {
      const index = adminState.articles.indexOf(article);
      return `
        <tr>
          <td><strong>${escapeHTML(article.title)}</strong><small>${escapeHTML(article.id)}</small></td>
          <td>${escapeHTML(article.category)}</td>
          <td>${escapeHTML(article.target)}</td>
          <td>${article.featured ? "是" : "否"}</td>
          <td><span class="admin-status-pill">${escapeHTML(article.status || "published")}</span></td>
          <td>${escapeHTML(article.updatedAt || article.date || "")}</td>
          <td>
            <div class="admin-row-actions">
              <button type="button" data-article-edit="${index}">编辑</button>
              <button type="button" data-article-copy="${index}">复制</button>
              <button class="is-danger" type="button" data-article-delete="${index}">删除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function createEmptyArticle() {
  const id = `article-${Date.now()}`;
  return {
    id,
    title: "",
    category: "备考规划",
    target: "",
    description: "",
    date: today(),
    url: `article-detail.html?id=${id}`,
    featured: false,
    status: "draft",
    tags: [],
    updatedAt: today(),
    content: [
      {
        heading: "正文",
        paragraphs: ["请补充文章正文。"],
      },
    ],
    faq: [],
    relatedResourceTypes: [],
  };
}

function showArticleEditor(article, index = -1) {
  articleEditorEl.hidden = false;
  articleEditorEl.innerHTML = `
    <form id="article-admin-form">
      <div class="admin-form-grid">
        <label><span>id *</span><input name="id" value="${escapeHTML(article.id)}" required /></label>
        <label><span>title *</span><input name="title" value="${escapeHTML(article.title)}" required /></label>
        <label><span>category</span><input name="category" value="${escapeHTML(article.category)}" /></label>
        <label><span>target</span><input name="target" value="${escapeHTML(article.target)}" /></label>
        <label class="admin-form-wide"><span>description</span><textarea name="description">${escapeHTML(article.description)}</textarea></label>
        <label><span>url</span><input name="url" value="${escapeHTML(article.url || `article-detail.html?id=${article.id}`)}" /></label>
        <label><span>status</span><select name="status"><option value="published">published</option><option value="draft">draft</option></select></label>
        <label><span>updatedAt</span><input name="updatedAt" value="${escapeHTML(article.updatedAt || today())}" /></label>
        <label class="admin-check"><input name="featured" type="checkbox" ${article.featured ? "checked" : ""} /> featured 推荐</label>
        <label class="admin-form-wide"><span>tags（逗号分隔）</span><input name="tags" value="${escapeHTML(listToText(article.tags))}" /></label>
        <label class="admin-form-wide"><span>relatedResourceTypes（逗号分隔，可选）</span><input name="relatedResourceTypes" value="${escapeHTML(listToText(article.relatedResourceTypes))}" /></label>
        <label class="admin-form-wide"><span>content（每行一段）</span><textarea name="content" rows="9">${escapeHTML(contentToText(article.content))}</textarea></label>
      </div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">保存文章</button>
        <button class="btn btn-secondary" type="button" data-editor-cancel>取消</button>
      </div>
    </form>
  `;
  articleEditorEl.querySelector("[name='status']").value = article.status || "published";

  $("#article-admin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = form.get("id").trim();
    const title = form.get("title").trim();

    if (!id || !title) {
      setStatus("文章 id 和 title 必填。", "error");
      return;
    }

    const duplicate = adminState.articles.some((item, itemIndex) => item.id === id && itemIndex !== index);
    if (duplicate) {
      setStatus("文章 id 已存在，请换一个唯一 id。", "error");
      return;
    }

    const saved = {
      ...article,
      id,
      title,
      category: form.get("category").trim(),
      target: form.get("target").trim(),
      description: form.get("description").trim(),
      date: article.date || today(),
      url: form.get("url").trim() || `article-detail.html?id=${id}`,
      featured: Boolean(form.get("featured")),
      status: form.get("status"),
      tags: parseList(form.get("tags")),
      updatedAt: form.get("updatedAt").trim() || today(),
      content: normalizeContentInput(form.get("content")),
      faq: Array.isArray(article.faq) ? article.faq : [],
      relatedResourceTypes: parseList(form.get("relatedResourceTypes")),
    };

    if (index >= 0) {
      adminState.articles[index] = saved;
    } else {
      adminState.articles.unshift(saved);
    }

    articleEditorEl.hidden = true;
    rerenderAll();
    setStatus("文章已保存到管理台当前数据。记得导出 articles.json。", "success");
  });
  articleEditorEl.querySelector("[data-editor-cancel]").addEventListener("click", () => {
    articleEditorEl.hidden = true;
  });
}

function bindArticleControls() {
  $("#article-new").addEventListener("click", () => showArticleEditor(createEmptyArticle()));
  ["#article-admin-search", "#article-admin-category", "#article-admin-status"].forEach((selector) => {
    $(selector).addEventListener("input", renderArticles);
    $(selector).addEventListener("change", renderArticles);
  });

  articleListEl.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-article-edit]");
    const copyButton = event.target.closest("[data-article-copy]");
    const deleteButton = event.target.closest("[data-article-delete]");

    if (editButton) {
      const index = Number(editButton.dataset.articleEdit);
      showArticleEditor(clone(adminState.articles[index]), index);
    }

    if (copyButton) {
      const index = Number(copyButton.dataset.articleCopy);
      const copied = clone(adminState.articles[index]);
      copied.id = `${copied.id}-copy-${Date.now()}`;
      copied.title = `${copied.title}（副本）`;
      copied.url = `article-detail.html?id=${copied.id}`;
      copied.featured = false;
      copied.status = "draft";
      copied.updatedAt = today();
      adminState.articles.unshift(copied);
      rerenderAll();
      setStatus("已复制文章副本。", "success");
    }

    if (deleteButton) {
      const index = Number(deleteButton.dataset.articleDelete);
      if (!confirm("确定要删除这篇文章吗？此操作只会删除管理台当前数据，正式网站需导出 JSON 并替换文件后才会生效。")) {
        return;
      }
      adminState.articles.splice(index, 1);
      rerenderAll();
      setStatus("文章已从管理台当前数据中删除。", "success");
    }
  });
}

function populateResourceFilters() {
  fillSelect($("#resource-admin-grade"), adminState.resources.map((resource) => resource.grade), $("#resource-admin-grade")?.value || "全部");
  fillSelect($("#resource-admin-type"), adminState.resources.map((resource) => resource.type), $("#resource-admin-type")?.value || "全部");
  fillSelect($("#resource-admin-category"), adminState.resources.map((resource) => resource.category), $("#resource-admin-category")?.value || "全部");
}

function getFilteredResources() {
  const keyword = ($("#resource-admin-search")?.value || "").trim().toLowerCase();
  const grade = $("#resource-admin-grade")?.value || "全部";
  const type = $("#resource-admin-type")?.value || "全部";
  const category = $("#resource-admin-category")?.value || "全部";
  const status = $("#resource-admin-status")?.value || "全部";

  return adminState.resources.filter((resource) => {
    const text = [resource.title, resource.description, resource.target, resource.grade, resource.type, resource.category, ...(resource.tags || [])]
      .join(" ")
      .toLowerCase();
    return (
      (!keyword || text.includes(keyword)) &&
      (grade === "全部" || resource.grade === grade) &&
      (type === "全部" || resource.type === type) &&
      (category === "全部" || resource.category === category) &&
      (status === "全部" || resource.status === status)
    );
  });
}

function renderResources() {
  if (!resourceListEl) {
    return;
  }

  resourceListEl.innerHTML = getFilteredResources()
    .map((resource) => {
      const index = adminState.resources.indexOf(resource);
      return `
        <tr>
          <td><strong>${escapeHTML(resource.title)}</strong><small>${escapeHTML(resource.id)}</small></td>
          <td>${escapeHTML(resource.grade)}</td>
          <td>${escapeHTML(resource.type)}</td>
          <td>${escapeHTML(resource.category)}</td>
          <td>${resource.featured ? "是" : "否"}</td>
          <td><span class="admin-status-pill">${escapeHTML(resource.status || "published")}</span></td>
          <td>
            <div class="admin-row-actions">
              <button type="button" data-resource-edit="${index}">编辑</button>
              <button type="button" data-resource-copy="${index}">复制</button>
              <button class="is-danger" type="button" data-resource-delete="${index}">删除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function createEmptyResource() {
  return {
    id: `resource-${Date.now()}`,
    title: "",
    grade: "全学段",
    type: "",
    level: "基础",
    target: "",
    description: "",
    usage: "建议下载后按步骤完成，并记录错因。",
    contents: ["练习页", "复盘记录区"],
    file: "#",
    featured: false,
    status: "draft",
    tags: [],
    updatedAt: today(),
    category: "基础能力",
    skill: "",
    vocabCategory: "",
  };
}

function showResourceEditor(resource, index = -1) {
  resourceEditorEl.hidden = false;
  resourceEditorEl.innerHTML = `
    <form id="resource-admin-form">
      <div class="admin-form-grid">
        <label><span>id *</span><input name="id" value="${escapeHTML(resource.id)}" required /></label>
        <label><span>title *</span><input name="title" value="${escapeHTML(resource.title)}" required /></label>
        <label><span>grade</span><input name="grade" value="${escapeHTML(resource.grade)}" /></label>
        <label><span>type</span><input name="type" value="${escapeHTML(resource.type)}" /></label>
        <label><span>level</span><input name="level" value="${escapeHTML(resource.level)}" /></label>
        <label><span>category</span><input name="category" value="${escapeHTML(resource.category)}" /></label>
        <label><span>file</span><input name="file" value="${escapeHTML(resource.file || "#")}" /></label>
        <label><span>status</span><select name="status"><option value="published">published</option><option value="draft">draft</option></select></label>
        <label><span>updatedAt</span><input name="updatedAt" value="${escapeHTML(resource.updatedAt || today())}" /></label>
        <label><span>skill</span><input name="skill" value="${escapeHTML(resource.skill || "")}" placeholder="例如：词汇" /></label>
        <label><span>vocabCategory</span><select name="vocabCategory">
          <option value="">无</option>
          <option value="同步词汇">同步词汇</option>
          <option value="中考高频词">中考高频词</option>
          <option value="易错易混词">易错易混词</option>
          <option value="词汇训练">词汇训练</option>
        </select></label>
        <label class="admin-check"><input name="featured" type="checkbox" ${resource.featured ? "checked" : ""} /> featured 推荐</label>
        <label class="admin-form-wide"><span>target</span><input name="target" value="${escapeHTML(resource.target)}" /></label>
        <label class="admin-form-wide"><span>description</span><textarea name="description">${escapeHTML(resource.description)}</textarea></label>
        <label class="admin-form-wide"><span>tags（逗号分隔）</span><input name="tags" value="${escapeHTML(listToText(resource.tags))}" /></label>
      </div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">保存资料</button>
        <button class="btn btn-secondary" type="button" data-editor-cancel>取消</button>
      </div>
    </form>
  `;
  resourceEditorEl.querySelector("[name='status']").value = resource.status || "published";
  resourceEditorEl.querySelector("[name='vocabCategory']").value = resource.vocabCategory || "";

  $("#resource-admin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = form.get("id").trim();
    const title = form.get("title").trim();

    if (!id || !title) {
      setStatus("资料 id 和 title 必填。", "error");
      return;
    }

    const duplicate = adminState.resources.some((item, itemIndex) => item.id === id && itemIndex !== index);
    if (duplicate) {
      setStatus("资料 id 已存在，请换一个唯一 id。", "error");
      return;
    }

    const saved = {
      ...resource,
      id,
      title,
      grade: form.get("grade").trim(),
      type: form.get("type").trim(),
      level: form.get("level").trim(),
      target: form.get("target").trim(),
      description: form.get("description").trim(),
      file: form.get("file").trim() || "#",
      featured: Boolean(form.get("featured")),
      status: form.get("status"),
      tags: parseList(form.get("tags")),
      updatedAt: form.get("updatedAt").trim() || today(),
      category: form.get("category").trim(),
      skill: form.get("skill").trim(),
      vocabCategory: form.get("vocabCategory"),
      usage: resource.usage || "建议下载后按步骤完成，并记录错因。",
      contents: Array.isArray(resource.contents) ? resource.contents : ["练习页", "复盘记录区"],
    };

    if (!saved.skill) {
      delete saved.skill;
    }

    if (!saved.vocabCategory) {
      delete saved.vocabCategory;
    }

    if (index >= 0) {
      adminState.resources[index] = saved;
    } else {
      adminState.resources.unshift(saved);
    }

    resourceEditorEl.hidden = true;
    rerenderAll();
    setStatus("资料已保存到管理台当前数据。记得导出 resources.json。", "success");
  });
  resourceEditorEl.querySelector("[data-editor-cancel]").addEventListener("click", () => {
    resourceEditorEl.hidden = true;
  });
}

function bindResourceControls() {
  $("#resource-new").addEventListener("click", () => showResourceEditor(createEmptyResource()));
  ["#resource-admin-search", "#resource-admin-grade", "#resource-admin-type", "#resource-admin-category", "#resource-admin-status"].forEach((selector) => {
    $(selector).addEventListener("input", renderResources);
    $(selector).addEventListener("change", renderResources);
  });

  resourceListEl.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-resource-edit]");
    const copyButton = event.target.closest("[data-resource-copy]");
    const deleteButton = event.target.closest("[data-resource-delete]");

    if (editButton) {
      const index = Number(editButton.dataset.resourceEdit);
      showResourceEditor(clone(adminState.resources[index]), index);
    }

    if (copyButton) {
      const index = Number(copyButton.dataset.resourceCopy);
      const copied = clone(adminState.resources[index]);
      copied.id = `${copied.id}-copy-${Date.now()}`;
      copied.title = `${copied.title}（副本）`;
      copied.featured = false;
      copied.status = "draft";
      copied.updatedAt = today();
      adminState.resources.unshift(copied);
      rerenderAll();
      setStatus("已复制资料副本。", "success");
    }

    if (deleteButton) {
      const index = Number(deleteButton.dataset.resourceDelete);
      if (!confirm("确定要删除这份资料吗？此操作只会删除管理台当前数据，正式网站需导出 JSON 并替换文件后才会生效。")) {
        return;
      }
      adminState.resources.splice(index, 1);
      rerenderAll();
      setStatus("资料已从管理台当前数据中删除。", "success");
    }
  });
}

function renderHomeSections() {
  if (!homeSectionListEl) {
    return;
  }

  const sections = adminState.siteConfig.homeSections || [];
  homeSectionListEl.innerHTML = sections
    .map((section, index) => `
      <tr>
        <td><strong>${escapeHTML(section.id)}</strong></td>
        <td>${escapeHTML(section.type)}</td>
        <td>${escapeHTML(section.title)}</td>
        <td>${escapeHTML(section.subtitle)}</td>
        <td>${section.enabled ? "true" : "false"}</td>
        <td>${escapeHTML(section.order)}</td>
        <td>${escapeHTML(section.linkText || "")}</td>
        <td>
          <div class="admin-row-actions">
            <button type="button" data-home-edit="${index}">编辑</button>
            <button class="is-danger" type="button" data-home-delete="${index}">删除</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function createHomeSection() {
  return {
    id: `custom-cta-${Date.now()}`,
    type: "diagnosis-cta",
    title: "自定义 CTA 板块",
    subtitle: "请填写板块说明。",
    enabled: true,
    order: 99,
    limit: 0,
    linkText: "查看详情",
    linkUrl: "about.html",
  };
}

function showHomeSectionEditor(section, index = -1) {
  homeSectionEditorEl.hidden = false;
  homeSectionEditorEl.innerHTML = `
    <form id="home-section-form">
      <div class="admin-form-grid">
        <label><span>id</span><input name="id" value="${escapeHTML(section.id)}" ${index >= 0 ? "readonly" : ""} /></label>
        <label><span>type</span><input name="type" value="${escapeHTML(section.type)}" /></label>
        <label><span>title</span><input name="title" value="${escapeHTML(section.title)}" /></label>
        <label><span>subtitle</span><input name="subtitle" value="${escapeHTML(section.subtitle)}" /></label>
        <label><span>order</span><input name="order" type="number" value="${escapeHTML(section.order || 0)}" /></label>
        <label><span>linkText</span><input name="linkText" value="${escapeHTML(section.linkText || "")}" /></label>
        <label><span>linkUrl</span><input name="linkUrl" value="${escapeHTML(section.linkUrl || "")}" /></label>
        <label class="admin-check"><input name="enabled" type="checkbox" ${section.enabled !== false ? "checked" : ""} /> enabled 显示</label>
      </div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">保存板块</button>
        <button class="btn btn-secondary" type="button" data-editor-cancel>取消</button>
      </div>
    </form>
  `;

  $("#home-section-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const saved = {
      ...section,
      id: form.get("id").trim(),
      type: form.get("type").trim(),
      title: form.get("title").trim(),
      subtitle: form.get("subtitle").trim(),
      enabled: Boolean(form.get("enabled")),
      order: Number(form.get("order") || 0),
      linkText: form.get("linkText").trim(),
      linkUrl: form.get("linkUrl").trim(),
    };

    if (!saved.id) {
      setStatus("首页板块 id 必填。", "error");
      return;
    }

    adminState.siteConfig.homeSections = adminState.siteConfig.homeSections || [];
    if (index >= 0) {
      adminState.siteConfig.homeSections[index] = saved;
    } else {
      adminState.siteConfig.homeSections.push(saved);
    }
    homeSectionEditorEl.hidden = true;
    rerenderAll();
    setStatus("首页板块已保存。记得导出 site-config.json。", "success");
  });
  homeSectionEditorEl.querySelector("[data-editor-cancel]").addEventListener("click", () => {
    homeSectionEditorEl.hidden = true;
  });
}

function bindHomeSectionControls() {
  $("#home-section-new").addEventListener("click", () => showHomeSectionEditor(createHomeSection()));
  homeSectionListEl.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-home-edit]");
    const deleteButton = event.target.closest("[data-home-delete]");
    const sections = adminState.siteConfig.homeSections || [];

    if (editButton) {
      const index = Number(editButton.dataset.homeEdit);
      showHomeSectionEditor(clone(sections[index]), index);
    }

    if (deleteButton) {
      const index = Number(deleteButton.dataset.homeDelete);
      const section = sections[index];
      if (CORE_HOME_SECTIONS.has(section.id) || CORE_HOME_SECTIONS.has(section.type)) {
        alert("这是系统核心板块，建议改为隐藏 enabled=false，而不是删除。");
        return;
      }
      if (!confirm("确定要删除这个首页板块吗？正式网站需导出 JSON 并替换文件后才会生效。")) {
        return;
      }
      sections.splice(index, 1);
      rerenderAll();
      setStatus("首页板块已删除。", "success");
    }
  });
}

function renderNavItems() {
  if (!navItemListEl) {
    return;
  }

  const items = adminState.siteConfig.navItems || [];
  navItemListEl.innerHTML = items
    .map((item, index) => `
      <tr>
        <td>${escapeHTML(item.label)}</td>
        <td>${escapeHTML(item.url)}</td>
        <td>${item.enabled ? "true" : "false"}</td>
        <td>${escapeHTML(item.order)}</td>
        <td>
          <div class="admin-row-actions">
            <button type="button" data-nav-edit="${index}">编辑</button>
            <button class="is-danger" type="button" data-nav-delete="${index}">删除</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function createNavItem() {
  return {
    label: "新导航",
    url: "about.html",
    enabled: true,
    order: 99,
  };
}

function showNavItemEditor(item, index = -1) {
  navItemEditorEl.hidden = false;
  navItemEditorEl.innerHTML = `
    <form id="nav-item-form">
      <div class="admin-form-grid">
        <label><span>label</span><input name="label" value="${escapeHTML(item.label)}" required /></label>
        <label><span>url</span><input name="url" value="${escapeHTML(item.url)}" required /></label>
        <label><span>order</span><input name="order" type="number" value="${escapeHTML(item.order || 0)}" /></label>
        <label class="admin-check"><input name="enabled" type="checkbox" ${item.enabled !== false ? "checked" : ""} /> enabled 显示</label>
      </div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">保存导航</button>
        <button class="btn btn-secondary" type="button" data-editor-cancel>取消</button>
      </div>
    </form>
  `;

  $("#nav-item-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const saved = {
      label: form.get("label").trim(),
      url: form.get("url").trim(),
      enabled: Boolean(form.get("enabled")),
      order: Number(form.get("order") || 0),
    };

    if (!saved.label || !saved.url) {
      setStatus("导航 label 和 url 必填。", "error");
      return;
    }

    adminState.siteConfig.navItems = adminState.siteConfig.navItems || [];
    if (index >= 0) {
      adminState.siteConfig.navItems[index] = saved;
    } else {
      adminState.siteConfig.navItems.push(saved);
    }
    navItemEditorEl.hidden = true;
    rerenderAll();
    setStatus("导航项已保存。记得导出 site-config.json。", "success");
  });
  navItemEditorEl.querySelector("[data-editor-cancel]").addEventListener("click", () => {
    navItemEditorEl.hidden = true;
  });
}

function bindNavControls() {
  $("#nav-item-new").addEventListener("click", () => showNavItemEditor(createNavItem()));
  navItemListEl.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-nav-edit]");
    const deleteButton = event.target.closest("[data-nav-delete]");
    const items = adminState.siteConfig.navItems || [];

    if (editButton) {
      const index = Number(editButton.dataset.navEdit);
      showNavItemEditor(clone(items[index]), index);
    }

    if (deleteButton) {
      const index = Number(deleteButton.dataset.navDelete);
      if (!confirm("确定要删除这个导航项吗？正式网站需导出 JSON 并替换文件后才会生效。")) {
        return;
      }
      items.splice(index, 1);
      rerenderAll();
      setStatus("导航项已删除。", "success");
    }
  });
}

function renderTopicGroups() {
  if (!topicGroupEditorEl) {
    return;
  }

  const groups = adminState.siteConfig.topicGroups || [];
  topicGroupEditorEl.innerHTML = groups
    .map((group, groupIndex) => `
      <section class="topic-group-card admin-topic-card">
        <div class="topic-group-heading">
          <h3>${escapeHTML(group.group)}</h3>
          <p>${escapeHTML(group.description)}</p>
        </div>
        <div class="admin-topic-list">
          ${(group.items || [])
            .map((item, itemIndex) => `
              <div class="admin-topic-row">
                <input value="${escapeHTML(item)}" data-topic-input="${groupIndex}-${itemIndex}" />
                <button class="admin-danger-btn" type="button" data-topic-delete="${groupIndex}-${itemIndex}">删除</button>
              </div>
            `)
            .join("")}
        </div>
        <div class="admin-button-row">
          <button class="btn btn-secondary" type="button" data-topic-add="${groupIndex}">添加题型</button>
          <button class="btn btn-primary" type="button" data-topic-save="${groupIndex}">保存本组题型</button>
        </div>
      </section>
    `)
    .join("");
}

function bindTopicControls() {
  topicGroupEditorEl.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-topic-add]");
    const saveButton = event.target.closest("[data-topic-save]");
    const deleteButton = event.target.closest("[data-topic-delete]");
    const groups = adminState.siteConfig.topicGroups || [];

    if (addButton) {
      const groupIndex = Number(addButton.dataset.topicAdd);
      groups[groupIndex].items = groups[groupIndex].items || [];
      groups[groupIndex].items.push("新题型名称");
      renderTopicGroups();
      setStatus("已添加题型。请同步检查资料 type 字段。", "warn");
    }

    if (saveButton) {
      const groupIndex = Number(saveButton.dataset.topicSave);
      groups[groupIndex].items = $$(`[data-topic-input^="${groupIndex}-"]`).map((input) => input.value.trim()).filter(Boolean);
      renderTopicGroups();
      populateResourceFilters();
      setStatus("题型名称已保存到当前配置。请同步修改资料 type 后再导出。", "warn");
    }

    if (deleteButton) {
      const [groupIndex, itemIndex] = deleteButton.dataset.topicDelete.split("-").map(Number);
      if (!confirm("确定要删除这个题型吗？请确认 resources.json 中对应 type 已同步处理。")) {
        return;
      }
      groups[groupIndex].items.splice(itemIndex, 1);
      renderTopicGroups();
      setStatus("题型已删除。请同步检查资料 type 字段。", "warn");
    }
  });
}

function bindControls() {
  bindTopControls();
  bindTabs();
  bindArticleControls();
  bindResourceControls();
  bindHomeSectionControls();
  bindNavControls();
  bindTopicControls();
}

async function initAdmin() {
  await loadInitialData();
  bindControls();
  rerenderAll();
  setStatus("管理台已加载。当前修改只在本地管理台数据中生效。", "success");
}

initAdmin();
