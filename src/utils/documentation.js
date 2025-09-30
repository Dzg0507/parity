// DOCUMENTATION AND KNOWLEDGE BASE SYSTEM
// This is going to make the app SELF-DOCUMENTING! 📚

import { storage } from './storage';
import { analyticsManager } from './analytics';

// 1. DOCUMENTATION TYPES
export const DOCUMENTATION_TYPES = {
  API: 'api',
  COMPONENT: 'component',
  FEATURE: 'feature',
  TUTORIAL: 'tutorial',
  FAQ: 'faq',
  TROUBLESHOOTING: 'troubleshooting',
  CHANGELOG: 'changelog',
  ROADMAP: 'roadmap',
};

// 2. DOCUMENTATION MANAGER
export class DocumentationManager {
  constructor() {
    this.documentation = new Map();
    this.searchIndex = new Map();
    this.categories = new Map();
  }

  // Add documentation
  async addDocumentation(doc) {
    const documentation = {
      id: this.generateDocId(),
      type: doc.type,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tags: doc.tags || [],
      author: doc.author || 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: doc.version || '1.0.0',
      status: doc.status || 'draft',
      visibility: doc.visibility || 'public',
      ...doc,
    };

    this.documentation.set(documentation.id, documentation);
    await this.indexDocumentation(documentation);
    await this.storeDocumentation(documentation);
    
    return documentation;
  }

  // Get documentation
  async getDocumentation(id) {
    if (this.documentation.has(id)) {
      return this.documentation.get(id);
    }

    const stored = await storage.getItem(`doc_${id}`);
    if (stored) {
      const doc = JSON.parse(stored);
      this.documentation.set(id, doc);
      return doc;
    }

    return null;
  }

  // Search documentation
  async searchDocumentation(query, filters = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [id, doc] of this.documentation) {
      if (this.matchesQuery(doc, queryLower, filters)) {
        results.push({
          id: doc.id,
          title: doc.title,
          content: this.extractSnippet(doc.content, queryLower),
          type: doc.type,
          category: doc.category,
          tags: doc.tags,
          relevance: this.calculateRelevance(doc, queryLower),
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Check if document matches query
  matchesQuery(doc, query, filters) {
    // Check filters
    if (filters.type && doc.type !== filters.type) return false;
    if (filters.category && doc.category !== filters.category) return false;
    if (filters.status && doc.status !== filters.status) return false;
    if (filters.visibility && doc.visibility !== filters.visibility) return false;
    
    // Check query match
    const titleMatch = doc.title.toLowerCase().includes(query);
    const contentMatch = doc.content.toLowerCase().includes(query);
    const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(query));
    
    return titleMatch || contentMatch || tagMatch;
  }

  // Calculate relevance score
  calculateRelevance(doc, query) {
    let score = 0;
    
    // Title match gets highest score
    if (doc.title.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // Tag match gets medium score
    if (doc.tags.some(tag => tag.toLowerCase().includes(query))) {
      score += 5;
    }
    
    // Content match gets lower score
    if (doc.content.toLowerCase().includes(query)) {
      score += 1;
    }
    
    return score;
  }

  // Extract content snippet
  extractSnippet(content, query) {
    const index = content.toLowerCase().indexOf(query);
    if (index === -1) return content.substring(0, 200) + '...';
    
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    
    return content.substring(start, end) + '...';
  }

  // Index documentation for search
  async indexDocumentation(doc) {
    const words = this.extractWords(doc.title + ' ' + doc.content);
    
    for (const word of words) {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      this.searchIndex.get(word).push(doc.id);
    }
  }

  // Extract words from text
  extractWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  // Store documentation
  async storeDocumentation(doc) {
    await storage.setItem(`doc_${doc.id}`, JSON.stringify(doc));
  }

  // Generate document ID
  generateDocId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get documentation by type
  async getDocumentationByType(type) {
    const results = [];
    
    for (const [id, doc] of this.documentation) {
      if (doc.type === type) {
        results.push(doc);
      }
    }
    
    return results;
  }

  // Get documentation by category
  async getDocumentationByCategory(category) {
    const results = [];
    
    for (const [id, doc] of this.documentation) {
      if (doc.category === category) {
        results.push(doc);
      }
    }
    
    return results;
  }

  // Update documentation
  async updateDocumentation(id, updates) {
    const doc = await this.getDocumentation(id);
    if (!doc) return null;
    
    const updated = {
      ...doc,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.documentation.set(id, updated);
    await this.storeDocumentation(updated);
    
    return updated;
  }

  // Delete documentation
  async deleteDocumentation(id) {
    this.documentation.delete(id);
    await storage.removeItem(`doc_${id}`);
  }
}

export const documentationManager = new DocumentationManager();

// 3. API DOCUMENTATION GENERATOR
export class APIDocumentationGenerator {
  constructor() {
    this.documentationManager = documentationManager;
  }

  // Generate API documentation
  async generateAPIDocumentation(apiRoutes) {
    const docs = [];
    
    for (const route of apiRoutes) {
      const doc = await this.generateRouteDocumentation(route);
      docs.push(doc);
    }
    
    return docs;
  }

  // Generate route documentation
  async generateRouteDocumentation(route) {
    const doc = {
      type: DOCUMENTATION_TYPES.API,
      title: `${route.method.toUpperCase()} ${route.path}`,
      content: this.generateRouteContent(route),
      category: 'API',
      tags: ['api', route.method, route.path.split('/')[1]],
      author: 'system',
      status: 'published',
      visibility: 'public',
    };
    
    return await this.documentationManager.addDocumentation(doc);
  }

  // Generate route content
  generateRouteContent(route) {
    return `
# ${route.method.toUpperCase()} ${route.path}

## Description
${route.description || 'No description available'}

## Parameters
${this.generateParametersTable(route.parameters || [])}

## Request Body
${this.generateRequestBodySchema(route.requestBody || {})}

## Response
${this.generateResponseSchema(route.response || {})}

## Examples
${this.generateExamples(route.examples || [])}

## Error Codes
${this.generateErrorCodes(route.errorCodes || [])}
    `.trim();
  }

  // Generate parameters table
  generateParametersTable(parameters) {
    if (parameters.length === 0) return 'No parameters';
    
    return `
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
${parameters.map(param => 
  `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || 'No description'} |`
).join('\n')}
    `.trim();
  }

  // Generate request body schema
  generateRequestBodySchema(requestBody) {
    if (!requestBody || Object.keys(requestBody).length === 0) {
      return 'No request body';
    }
    
    return `
\`\`\`json
${JSON.stringify(requestBody, null, 2)}
\`\`\`
    `.trim();
  }

  // Generate response schema
  generateResponseSchema(response) {
    if (!response || Object.keys(response).length === 0) {
      return 'No response schema available';
    }
    
    return `
\`\`\`json
${JSON.stringify(response, null, 2)}
\`\`\`
    `.trim();
  }

  // Generate examples
  generateExamples(examples) {
    if (examples.length === 0) return 'No examples available';
    
    return examples.map((example, index) => `
### Example ${index + 1}
\`\`\`javascript
${example.code}
\`\`\`
    `).join('\n');
  }

  // Generate error codes
  generateErrorCodes(errorCodes) {
    if (errorCodes.length === 0) return 'No error codes documented';
    
    return `
| Code | Description |
|------|-------------|
${errorCodes.map(error => 
  `| ${error.code} | ${error.description} |`
).join('\n')}
    `.trim();
  }
}

export const apiDocumentationGenerator = new APIDocumentationGenerator();

// 4. COMPONENT DOCUMENTATION GENERATOR
export class ComponentDocumentationGenerator {
  constructor() {
    this.documentationManager = documentationManager;
  }

  // Generate component documentation
  async generateComponentDocumentation(component) {
    const doc = {
      type: DOCUMENTATION_TYPES.COMPONENT,
      title: component.name,
      content: this.generateComponentContent(component),
      category: 'Components',
      tags: ['component', 'react', component.name.toLowerCase()],
      author: 'system',
      status: 'published',
      visibility: 'public',
    };
    
    return await this.documentationManager.addDocumentation(doc);
  }

  // Generate component content
  generateComponentContent(component) {
    return `
# ${component.name}

## Description
${component.description || 'No description available'}

## Props
${this.generatePropsTable(component.props || [])}

## Usage
${this.generateUsageExample(component.usage || '')}

## Examples
${this.generateComponentExamples(component.examples || [])}

## Styling
${this.generateStylingInfo(component.styling || {})}
    `.trim();
  }

  // Generate props table
  generatePropsTable(props) {
    if (props.length === 0) return 'No props documented';
    
    return `
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
${props.map(prop => 
  `| ${prop.name} | ${prop.type} | ${prop.default || 'None'} | ${prop.required ? 'Yes' : 'No'} | ${prop.description || 'No description'} |`
).join('\n')}
    `.trim();
  }

  // Generate usage example
  generateUsageExample(usage) {
    if (!usage) return 'No usage example available';
    
    return `
\`\`\`jsx
${usage}
\`\`\`
    `.trim();
  }

  // Generate component examples
  generateComponentExamples(examples) {
    if (examples.length === 0) return 'No examples available';
    
    return examples.map((example, index) => `
### Example ${index + 1}
\`\`\`jsx
${example.code}
\`\`\`
    `).join('\n');
  }

  // Generate styling info
  generateStylingInfo(styling) {
    if (!styling || Object.keys(styling).length === 0) {
      return 'No styling information available';
    }
    
    return `
\`\`\`css
${styling.css || 'No CSS available'}
\`\`\`
    `.trim();
  }
}

export const componentDocumentationGenerator = new ComponentDocumentationGenerator();

// 5. TUTORIAL SYSTEM
export class TutorialSystem {
  constructor() {
    this.documentationManager = documentationManager;
    this.tutorials = new Map();
  }

  // Create tutorial
  async createTutorial(tutorial) {
    const tutorialDoc = {
      type: DOCUMENTATION_TYPES.TUTORIAL,
      title: tutorial.title,
      content: this.generateTutorialContent(tutorial),
      category: 'Tutorials',
      tags: ['tutorial', ...(tutorial.tags || [])],
      author: tutorial.author || 'system',
      status: 'published',
      visibility: 'public',
      difficulty: tutorial.difficulty || 'beginner',
      estimatedTime: tutorial.estimatedTime || '10 minutes',
      prerequisites: tutorial.prerequisites || [],
      steps: tutorial.steps || [],
    };
    
    return await this.documentationManager.addDocumentation(tutorialDoc);
  }

  // Generate tutorial content
  generateTutorialContent(tutorial) {
    return `
# ${tutorial.title}

## Overview
${tutorial.overview || 'No overview available'}

## Prerequisites
${this.generatePrerequisitesList(tutorial.prerequisites || [])}

## Estimated Time
${tutorial.estimatedTime || 'Not specified'}

## Steps
${this.generateTutorialSteps(tutorial.steps || [])}

## Next Steps
${tutorial.nextSteps || 'No next steps available'}
    `.trim();
  }

  // Generate prerequisites list
  generatePrerequisitesList(prerequisites) {
    if (prerequisites.length === 0) return 'No prerequisites';
    
    return prerequisites.map(prereq => `- ${prereq}`).join('\n');
  }

  // Generate tutorial steps
  generateTutorialSteps(steps) {
    if (steps.length === 0) return 'No steps available';
    
    return steps.map((step, index) => `
### Step ${index + 1}: ${step.title}

${step.description || 'No description'}

${step.code ? `\`\`\`${step.language || 'javascript'}\n${step.code}\n\`\`\`` : ''}

${step.image ? `![${step.title}](${step.image})` : ''}
    `).join('\n');
  }

  // Get tutorial by difficulty
  async getTutorialsByDifficulty(difficulty) {
    const tutorials = await this.documentationManager.getDocumentationByType(DOCUMENTATION_TYPES.TUTORIAL);
    return tutorials.filter(tutorial => tutorial.difficulty === difficulty);
  }

  // Get tutorial progress
  async getTutorialProgress(userId, tutorialId) {
    const stored = await storage.getItem(`tutorial_progress_${userId}_${tutorialId}`);
    return stored ? JSON.parse(stored) : {
      completed: false,
      currentStep: 0,
      startedAt: null,
      completedAt: null,
    };
  }

  // Update tutorial progress
  async updateTutorialProgress(userId, tutorialId, progress) {
    const currentProgress = await this.getTutorialProgress(userId, tutorialId);
    const updatedProgress = {
      ...currentProgress,
      ...progress,
      updatedAt: Date.now(),
    };
    
    await storage.setItem(`tutorial_progress_${userId}_${tutorialId}`, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
}

export const tutorialSystem = new TutorialSystem();

// 6. FAQ SYSTEM
export class FAQSystem {
  constructor() {
    this.documentationManager = documentationManager;
  }

  // Add FAQ
  async addFAQ(faq) {
    const faqDoc = {
      type: DOCUMENTATION_TYPES.FAQ,
      title: faq.question,
      content: this.generateFAQContent(faq),
      category: 'FAQ',
      tags: ['faq', ...(faq.tags || [])],
      author: 'system',
      status: 'published',
      visibility: 'public',
      category: faq.category || 'General',
      priority: faq.priority || 'medium',
    };
    
    return await this.documentationManager.addDocumentation(faqDoc);
  }

  // Generate FAQ content
  generateFAQContent(faq) {
    return `
# ${faq.question}

## Answer
${faq.answer}

## Related Questions
${this.generateRelatedQuestions(faq.relatedQuestions || [])}

## Tags
${faq.tags ? faq.tags.map(tag => `#${tag}`).join(' ') : 'No tags'}
    `.trim();
  }

  // Generate related questions
  generateRelatedQuestions(relatedQuestions) {
    if (relatedQuestions.length === 0) return 'No related questions';
    
    return relatedQuestions.map(q => `- ${q}`).join('\n');
  }

  // Get FAQ by category
  async getFAQByCategory(category) {
    const faqs = await this.documentationManager.getDocumentationByType(DOCUMENTATION_TYPES.FAQ);
    return faqs.filter(faq => faq.category === category);
  }

  // Get popular FAQs
  async getPopularFAQs(limit = 10) {
    const faqs = await this.documentationManager.getDocumentationByType(DOCUMENTATION_TYPES.FAQ);
    return faqs
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
}

export const faqSystem = new FAQSystem();

// 7. CHANGELOG SYSTEM
export class ChangelogSystem {
  constructor() {
    this.documentationManager = documentationManager;
  }

  // Add changelog entry
  async addChangelogEntry(entry) {
    const changelogDoc = {
      type: DOCUMENTATION_TYPES.CHANGELOG,
      title: `Version ${entry.version}`,
      content: this.generateChangelogContent(entry),
      category: 'Changelog',
      tags: ['changelog', entry.version],
      author: entry.author || 'system',
      status: 'published',
      visibility: 'public',
      version: entry.version,
      releaseDate: entry.releaseDate || Date.now(),
    };
    
    return await this.documentationManager.addDocumentation(changelogDoc);
  }

  // Generate changelog content
  generateChangelogContent(entry) {
    return `
# Version ${entry.version}

## Release Date
${new Date(entry.releaseDate || Date.now()).toLocaleDateString()}

## New Features
${this.generateChangeList(entry.newFeatures || [])}

## Improvements
${this.generateChangeList(entry.improvements || [])}

## Bug Fixes
${this.generateChangeList(entry.bugFixes || [])}

## Breaking Changes
${this.generateChangeList(entry.breakingChanges || [])}

## Deprecations
${this.generateChangeList(entry.deprecations || [])}
    `.trim();
  }

  // Generate change list
  generateChangeList(changes) {
    if (changes.length === 0) return 'No changes in this category';
    
    return changes.map(change => `- ${change}`).join('\n');
  }

  // Get changelog by version
  async getChangelogByVersion(version) {
    const changelogs = await this.documentationManager.getDocumentationByType(DOCUMENTATION_TYPES.CHANGELOG);
    return changelogs.find(changelog => changelog.version === version);
  }

  // Get recent changelogs
  async getRecentChangelogs(limit = 5) {
    const changelogs = await this.documentationManager.getDocumentationByType(DOCUMENTATION_TYPES.CHANGELOG);
    return changelogs
      .sort((a, b) => b.releaseDate - a.releaseDate)
      .slice(0, limit);
  }
}

export const changelogSystem = new ChangelogSystem();

// 8. KNOWLEDGE BASE SEARCH
export class KnowledgeBaseSearch {
  constructor() {
    this.documentationManager = documentationManager;
  }

  // Search knowledge base
  async searchKnowledgeBase(query, filters = {}) {
    const results = await this.documentationManager.searchDocumentation(query, filters);
    
    // Group results by type
    const groupedResults = this.groupResultsByType(results);
    
    return {
      query,
      totalResults: results.length,
      groupedResults,
      suggestions: this.generateSuggestions(query, results),
    };
  }

  // Group results by type
  groupResultsByType(results) {
    const grouped = {};
    
    results.forEach(result => {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      grouped[result.type].push(result);
    });
    
    return grouped;
  }

  // Generate search suggestions
  generateSuggestions(query, results) {
    const suggestions = [];
    
    // Add type suggestions
    const types = [...new Set(results.map(r => r.type))];
    types.forEach(type => {
      suggestions.push({
        type: 'category',
        text: `Search in ${type}`,
        query: `${query} type:${type}`,
      });
    });
    
    // Add tag suggestions
    const tags = [...new Set(results.flatMap(r => r.tags))];
    tags.slice(0, 5).forEach(tag => {
      suggestions.push({
        type: 'tag',
        text: `Search for ${tag}`,
        query: `${query} tag:${tag}`,
      });
    });
    
    return suggestions;
  }

  // Get search analytics
  async getSearchAnalytics() {
    const searches = await storage.getItem('search_analytics');
    return searches ? JSON.parse(searches) : {
      totalSearches: 0,
      popularQueries: [],
      noResultsQueries: [],
    };
  }

  // Track search
  async trackSearch(query, results) {
    const analytics = await this.getSearchAnalytics();
    
    analytics.totalSearches++;
    
    // Track popular queries
    const existingQuery = analytics.popularQueries.find(q => q.query === query);
    if (existingQuery) {
      existingQuery.count++;
    } else {
      analytics.popularQueries.push({ query, count: 1 });
    }
    
    // Track no results queries
    if (results.length === 0) {
      analytics.noResultsQueries.push(query);
    }
    
    // Keep only top 100 popular queries
    analytics.popularQueries = analytics.popularQueries
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);
    
    await storage.setItem('search_analytics', JSON.stringify(analytics));
  }
}

export const knowledgeBaseSearch = new KnowledgeBaseSearch();

export default {
  documentationManager,
  apiDocumentationGenerator,
  componentDocumentationGenerator,
  tutorialSystem,
  faqSystem,
  changelogSystem,
  knowledgeBaseSearch,
  DOCUMENTATION_TYPES,
};
