import type { Meta, StoryObj } from '@storybook/react';
import featuresConfig from '@/config/features.json';
import Button from './Button';
import TextField from './TextField';
import Typography from './Typography';
import IconButton from './IconButton';
import Icon from './Icon';

// Component mapping
const componentMap = {
  Button,
  TextField,
  Typography,
  IconButton,
  Icon,
};

// Dynamically generate stories from features.json
export function generateStoriesFromConfig() {
  const stories: Record<string, any> = {};
  const storybookStories = featuresConfig.storybookStories;

  Object.entries(storybookStories).forEach(([componentName, componentStories]) => {
    if (componentMap[componentName as keyof typeof componentMap]) {
      const Component = componentMap[componentName as keyof typeof componentMap];
      
      const meta: Meta<typeof Component> = {
        title: `Atoms/${componentName}`,
        component: Component,
        parameters: {
          layout: 'centered',
        },
        tags: ['autodocs'],
      };

      stories[componentName] = {
        meta,
        stories: Object.entries(componentStories).map(([storyName, storyConfig]: [string, any]) => ({
          name: storyConfig.name || storyName,
          args: storyConfig.args,
        })),
      };
    }
  });

  return stories;
}

// Generate stories for Button component from features.json
const buttonStories = featuresConfig.storybookStories.Button;

const meta = {
  title: 'Atoms/Button (Dynamic)',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate stories dynamically from features.json
export const Primary: Story = {
  name: buttonStories.primary.name,
  args: buttonStories.primary.args,
};

export const Secondary: Story = {
  name: buttonStories.secondary.name,
  args: buttonStories.secondary.args,
};

export const WithIcon: Story = {
  name: buttonStories.withIcon.name,
  args: buttonStories.withIcon.args,
};

export const Loading: Story = {
  name: buttonStories.loading.name,
  args: buttonStories.loading.args,
};
