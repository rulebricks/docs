const fs = require('fs')
const path = require('path')

const PAGES_DIR = path.join(__dirname, '..', 'pages')
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'docs-index.json')

// Files/directories to skip
const SKIP_FILES = ['_app.js', '_meta.json', 'api-reference.mdx', 'changelog.mdx']
const SKIP_DIRS = ['api', 'product-updates']

/**
 * Extract title from MDX content
 * Looks for # heading or frontmatter title
 */
function extractTitle(content, filename) {
  // Try to find # heading
  const headingMatch = content.match(/^#\s+(.+)$/m)
  if (headingMatch) {
    return headingMatch[1].trim()
  }

  // Try frontmatter title
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*['"]?([^'"\n]+)['"]?[\s\S]*?---/m)
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim()
  }

  // Fallback to filename
  return filename
    .replace('.mdx', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Extract description from MDX content
 */
function extractDescription(content) {
  // Try frontmatter metaDescription - grab the whole line
  const metaMatch = content.match(/metaDescription:\s*(.+)$/m)
  if (metaMatch) {
    // Remove surrounding quotes if present
    return metaMatch[1].trim().replace(/^['"]|['"]$/g, '')
  }

  // Try to get first paragraph after heading
  const paragraphMatch = content.match(/^#.+\n\n(.+?)(?:\n\n|$)/m)
  if (paragraphMatch) {
    return paragraphMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 200)
  }

  return ''
}

/**
 * Clean MDX content for AI consumption
 * Removes imports and frontmatter, preserves MDX components and code blocks.
 */
function cleanContent(content) {
  return content
    // Remove frontmatter
    .replace(/^---[\s\S]*?---\n*/m, '')
    // Remove multi-line imports (import { ... } from '...')
    .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]\s*$/gm, '')
    // Remove single-line imports
    .replace(/^import\s+.+from\s+['"][^'"]+['"]\s*$/gm, '')
    // Remove JSX comments
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Recursively scan directory for MDX files
 */
function scanDirectory(dir, basePath = '') {
  const docs = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      // Skip certain directories
      if (SKIP_DIRS.includes(entry.name)) continue

      // Recursively scan subdirectories
      docs.push(...scanDirectory(fullPath, relativePath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      // Skip certain files
      if (SKIP_FILES.includes(entry.name)) continue

      try {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const title = extractTitle(content, entry.name)
        const description = extractDescription(content)
        const cleanedContent = cleanContent(content)

        // Convert file path to URL path
        let urlPath = '/' + relativePath.replace('.mdx', '').replace(/\\/g, '/')
        if (urlPath.endsWith('/index')) {
          urlPath = urlPath.replace('/index', '') || '/'
        }

        docs.push({
          title,
          description,
          path: urlPath,
          content: cleanedContent,
        })

        console.log(`✓ Indexed: ${urlPath}`)
      } catch (error) {
        console.error(`✗ Error processing ${fullPath}:`, error.message)
      }
    }
  }

  return docs
}

/**
 * Main function
 */
function buildDocsIndex() {
  console.log('Building documentation index...\n')

  const docs = scanDirectory(PAGES_DIR)

  // Sort by path for consistent output
  docs.sort((a, b) => a.path.localeCompare(b.path))

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(docs, null, 2))

  console.log(`\n✅ Successfully indexed ${docs.length} documents`)
  console.log(`📁 Output: ${OUTPUT_FILE}`)
}

buildDocsIndex()
