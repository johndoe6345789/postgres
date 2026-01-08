import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Admin/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onConfirm: { action: 'confirm' },
    onCancel: { action: 'cancel' },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories based on features.json storybookStories.ConfirmDialog
export const Default: Story = {
  name: 'Default',
  args: {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export const DeleteWarning: Story = {
  name: 'Delete Warning',
  args: {
    open: true,
    title: 'Delete Item',
    message: 'This action cannot be undone. Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: fn(),
    onCancel: fn(),
  },
};
