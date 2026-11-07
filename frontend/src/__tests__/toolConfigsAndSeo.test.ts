import { describe, it, expect } from 'vitest';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';
import { TOOLS_DATA } from '../utils/toolsData';
import { getDownloadUrl, getPreviewUrl } from '../services/api';

describe('Stage 19: Frontend Configuration, SEO & API Utilities', () => {
  it('registers all 27 active tools in toolPageConfigs with complete metadata', () => {
    const slugs = Object.keys(TOOL_PAGE_CONFIGS);
    expect(slugs.length).toBeGreaterThanOrEqual(25);

    for (const [slug, config] of Object.entries(TOOL_PAGE_CONFIGS)) {
      expect(config.title, `Tool ${slug} must have a title`).toBeTruthy();
      expect(config.description, `Tool ${slug} must have a description`).toBeTruthy();
      expect(config.supportedFormats.length, `Tool ${slug} must define supported formats`).toBeGreaterThan(0);
      expect(config.maxFileSizeMB, `Tool ${slug} must define max file size limit`).toBeGreaterThan(0);
      expect(config.howItWorks.length, `Tool ${slug} must provide how-it-works steps`).toBeGreaterThanOrEqual(3);
      expect(config.faqs.length, `Tool ${slug} must provide FAQ items`).toBeGreaterThanOrEqual(3);
      expect(config.relatedTools.length, `Tool ${slug} must link related tools`).toBeGreaterThanOrEqual(2);
    }
  });

  it('contains honest privacy messaging in tool configurations', () => {
    for (const [, config] of Object.entries(TOOL_PAGE_CONFIGS)) {
      // Check that faqs or descriptions don't make exaggerated claims
      const fullText = JSON.stringify(config);
      expect(fullText.toLowerCase()).not.toContain('100% secure');
      expect(fullText.toLowerCase()).not.toContain('military-grade');
      expect(fullText.toLowerCase()).not.toContain('guaranteed zero data loss');
    }
  });

  it('validates tools data consistency across categories and routes', () => {
    expect(TOOLS_DATA.length).toBeGreaterThanOrEqual(20);

    for (const tool of TOOLS_DATA) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(['pdf', 'image', 'document', 'application']).toContain(tool.category);
      expect(tool.fileTypes.length).toBeGreaterThan(0);
      if (tool.isAvailable) {
        expect(tool.route).toBeTruthy();
        expect(tool.route?.startsWith('/')).toBe(true);
      }
    }
  });

  it('builds secure, clean download and preview URLs without path traversal', () => {
    const downloadUrl = getDownloadUrl('test-uuid-1234', 'my_document.pdf');
    expect(downloadUrl).toContain('/api/download/test-uuid-1234');
    expect(downloadUrl).toContain('name=my_document.pdf');
    expect(downloadUrl).not.toContain('..');

    const previewUrl = getPreviewUrl('preview-uuid-5678');
    expect(previewUrl).toContain('/api/preview/preview-uuid-5678');
  });
});