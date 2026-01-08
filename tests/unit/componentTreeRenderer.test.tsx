/**
 * Unit tests for component tree renderer
 */
import { describe, it, expect, vi } from 'vitest';
import { renderComponentNode } from '@/utils/componentTreeRenderer';
import type { ComponentNode } from '@/utils/featureConfig';

describe('componentTreeRenderer', () => {
  it('should render a simple Box component', () => {
    const node: ComponentNode = {
      component: 'Box',
      props: {
        sx: { p: 2 },
      },
    };

    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);

    expect(result).toBeTruthy();
    expect(result?.type.toString()).toContain('Box');
  });

  it('should render Typography with text prop', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: {
        variant: 'h5',
        text: 'Hello World',
      },
    };

    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);

    expect(result).toBeTruthy();
    expect(result?.props.variant).toBe('h5');
  });

  it('should interpolate template variables', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: {
        text: '{{data.message}}',
      },
    };

    const context = {
      data: { message: 'Test Message' },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });

  it('should render children', () => {
    const node: ComponentNode = {
      component: 'Box',
      children: [
        {
          component: 'Typography',
          props: {
            text: 'Child 1',
          },
        },
        {
          component: 'Typography',
          props: {
            text: 'Child 2',
          },
        },
      ],
    };

    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);

    expect(result).toBeTruthy();
    expect(Array.isArray(result?.props.children)).toBe(true);
  });

  it('should handle condition and not render when false', () => {
    const node: ComponentNode = {
      component: 'Box',
      condition: 'data.show',
      props: {
        sx: { p: 2 },
      },
    };

    const context = {
      data: { show: false },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeNull();
  });

  it('should handle condition and render when true', () => {
    const node: ComponentNode = {
      component: 'Box',
      condition: 'data.show',
      props: {
        sx: { p: 2 },
      },
    };

    const context = {
      data: { show: true },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });

  it('should handle forEach loops', () => {
    const node: ComponentNode = {
      component: 'Box',
      forEach: 'data.items',
      children: [
        {
          component: 'Typography',
          props: {
            text: '{{item.name}}',
          },
        },
      ],
    };

    const context = {
      data: {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' },
          { name: 'Item 3' },
        ],
      },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });

  it('should map onClick to action function', () => {
    const mockAction = vi.fn();
    const node: ComponentNode = {
      component: 'Button',
      props: {
        text: 'Click Me',
        onClick: 'handleClick',
      },
    };

    const context = {
      data: {},
      actions: { handleClick: mockAction },
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
    expect(result?.props.onClick).toBe(mockAction);
  });

  it('should handle nested template interpolation', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: {
        text: 'User: {{data.user.name}}, Age: {{data.user.age}}',
      },
    };

    const context = {
      data: {
        user: {
          name: 'John Doe',
          age: 30,
        },
      },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });
});
