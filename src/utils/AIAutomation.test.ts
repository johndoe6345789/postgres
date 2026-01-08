import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('AI Automation Validation', () => {
  const rootDir = path.resolve(__dirname, '..', '..');
  const configPath = path.join(rootDir, '.coderabbit.yaml');
  const readmePath = path.join(rootDir, 'README.md');

  describe('CodeRabbit Configuration', () => {
    it('should have .coderabbit.yaml configuration file', () => {
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should have valid CodeRabbit YAML configuration', () => {
      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Validate required fields exist in the YAML content
      expect(configContent).toBeDefined();
      expect(configContent).toContain('language:');
      expect(configContent).toContain('reviews:');
      expect(configContent).toContain('CodeRabbit');
    });

    it('should have reviews auto_review enabled', () => {
      const configContent = fs.readFileSync(configPath, 'utf-8');

      // Check that auto_review section exists with enabled: true
      // Using a pattern that ensures we're checking the auto_review section specifically
      expect(configContent).toMatch(/auto_review:\s+enabled:\s+true/);
    });
  });

  describe('README Documentation', () => {
    it('should mention AI automation in README', () => {
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');

      // Check for AI-related mentions
      expect(readmeContent.toLowerCase()).toContain('ai');
      expect(readmeContent.toLowerCase()).toContain('coderabbit');
    });

    it('should have AI-powered code reviews feature listed', () => {
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');

      // Check for specific feature mention
      expect(readmeContent).toContain('AI-powered code reviews');
    });
  });
});
