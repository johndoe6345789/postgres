import type { Meta, StoryObj } from '@storybook/react';
import { getAllStorybookStories, getStorybookStoriesForComponent, StorybookStory } from '@/utils/featureConfig';

/**
 * Generate Storybook meta configuration from features.json
 */
export function generateMeta<T>(
  component: T,
  componentName: string,
  customMeta?: Partial<Meta<T>>
): Meta<T> {
  const stories = getStorybookStoriesForComponent(componentName);
  const defaultStory = stories.default;

  return {
    title: `Components/${componentName}`,
    component: component as any,
    parameters: {
      layout: 'centered',
      ...defaultStory?.parameters,
    },
    tags: ['autodocs'],
    ...customMeta,
  };
}

/**
 * Generate a single story from features.json story definition
 */
export function generateStory<T>(
  storyConfig: StorybookStory
): StoryObj<T> {
  return {
    name: storyConfig.name,
    args: storyConfig.args || {},
    parameters: storyConfig.parameters,
    // Note: play functions would need to be converted from strings to actual functions
    // This is a limitation of JSON - we can only store the play steps as strings
  };
}

/**
 * Generate all stories for a component from features.json
 */
export function generateStories<T>(componentName: string): Record<string, StoryObj<T>> {
  const stories = getStorybookStoriesForComponent(componentName);
  const result: Record<string, StoryObj<T>> = {};

  for (const [key, storyConfig] of Object.entries(stories)) {
    result[key] = generateStory<T>(storyConfig);
  }

  return result;
}

/**
 * Get all available story configurations
 */
export function listStorybookComponents(): string[] {
  return Object.keys(getAllStorybookStories());
}

/**
 * Helper to create mock handlers for stories
 */
export function createMockHandlers(handlerNames: string[]): Record<string, () => void> {
  const handlers: Record<string, () => void> = {};
  
  for (const name of handlerNames) {
    handlers[name] = () => {
      console.log(`Mock handler called: ${name}`);
    };
  }
  
  return handlers;
}
