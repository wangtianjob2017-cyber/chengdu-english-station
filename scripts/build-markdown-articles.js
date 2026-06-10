const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const articlesDir = path.join(rootDir, "content", "articles");
const outputFile = path.join(rootDir, "data", "markdown-articles.json");

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { data: {}, body: markdown.trim() };
  }

  const endIndex = markdown.indexOf("\n---", 3);

  if (endIndex === -1) {
    return { data: {}, body: markdown.trim() };
  }

  const frontmatter = markdown.slice(3, endIndex).trim().split(/\r?\n/);
  const body = markdown.slice(endIndex + 4).trim();
  const data = {};
  let activeListKey = "";

  frontmatter.forEach((line) => {
    if (!line.trim()) {
      return;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);

    if (listMatch && activeListKey) {
      data[activeListKey].push(parseScalar(listMatch[1]));
      return;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!keyMatch) {
      return;
    }

    const [, key, value] = keyMatch;
    activeListKey = "";

    if (value === "") {
      data[key] = [];
      activeListKey = key;
      return;
    }

    data[key] = parseScalar(value);
  });

  return { data, body };
}

function markdownToContentSections(body) {
  const lines = body.split(/\r?\n/);
  const sections = [];
  let current = { heading: "正文", paragraphs: [] };
  let paragraphLines = [];

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    current.paragraphs.push(paragraphLines.join(" ").trim());
    paragraphLines = [];
  }

  function flushSection() {
    flushParagraph();

    if (current.paragraphs.length || current.heading !== "正文") {
      sections.push(current);
    }
  }

  lines.forEach((line) => {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      flushSection();
      current = { heading: headingMatch[1].trim(), paragraphs: [] };
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      return;
    }

    paragraphLines.push(line.trim());
  });

  flushSection();

  return sections.filter((section) => section.heading || section.paragraphs.length);
}

function buildArticle(filePath) {
  const markdown = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(markdown);
  const fallbackId = path.basename(filePath, ".md");
  const id = data.id || fallbackId;

  return {
    id,
    title: data.title || id,
    category: data.category || "备考文章",
    target: data.target || "初中学生和家长",
    description: data.description || "",
    url: `article-detail.html?id=${encodeURIComponent(id)}`,
    featured: Boolean(data.featured),
    status: data.status || "draft",
    tags: Array.isArray(data.tags) ? data.tags : [],
    date: data.date || data.updatedAt || "",
    updatedAt: data.updatedAt || data.date || "",
    relatedResourceTypes: Array.isArray(data.relatedResourceTypes) ? data.relatedResourceTypes : [],
    content: markdownToContentSections(body),
    contentMarkdown: body,
    source: "markdown",
  };
}

function main() {
  const files = fs.existsSync(articlesDir)
    ? fs.readdirSync(articlesDir).filter((file) => file.endsWith(".md")).sort()
    : [];
  const articles = files.map((file) => buildArticle(path.join(articlesDir, file)));

  fs.writeFileSync(outputFile, `${JSON.stringify({ articles }, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(rootDir, outputFile)} with ${articles.length} Markdown article(s).`);
}

main();
