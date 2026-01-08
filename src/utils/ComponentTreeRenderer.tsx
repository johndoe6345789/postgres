'use client';

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpeedIcon from '@mui/icons-material/Speed';
import { ComponentNode } from './featureConfig';

// Map of component names to actual components
const componentMap: Record<string, React.ComponentType<any>> = {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
};

// Map of icon names to icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  Add: AddIcon,
  Delete: DeleteIcon,
  Edit: EditIcon,
  TableChart: TableChartIcon,
  Speed: SpeedIcon,
};

type ComponentTreeRendererProps = {
  tree: ComponentNode;
  data?: Record<string, any>;
  handlers?: Record<string, (...args: any[]) => void>;
};

/**
 * Evaluate a condition string with the provided data context
 */
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    // Create a function that evaluates the condition in the data context
    const func = new Function(...Object.keys(data), `return ${condition}`);
    return func(...Object.values(data));
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
}

/**
 * Interpolate template strings like {{variable}} with actual values from data
 */
function interpolateValue(value: any, data: Record<string, any>): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Check if it's a template string
  const templateMatch = value.match(/^\{\{(.+)\}\}$/);
  if (templateMatch) {
    const expression = templateMatch[1].trim();
    try {
      const func = new Function(...Object.keys(data), `return ${expression}`);
      return func(...Object.values(data));
    } catch (error) {
      console.error('Error evaluating expression:', expression, error);
      return value;
    }
  }

  // Replace inline templates
  return value.replace(/\{\{(.+?)\}\}/g, (_, expression) => {
    try {
      const func = new Function(...Object.keys(data), `return ${expression.trim()}`);
      return func(...Object.values(data));
    } catch (error) {
      console.error('Error evaluating inline expression:', expression, error);
      return '';
    }
  });
}

/**
 * Interpolate all props in an object
 */
function interpolateProps(
  props: Record<string, any> | undefined,
  data: Record<string, any>,
  handlers: Record<string, (...args: any[]) => void>
): Record<string, any> {
  if (!props) return {};

  const interpolated: Record<string, any> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'string' && handlers[value]) {
      // If the value is a handler function name, use the handler
      interpolated[key] = handlers[value];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively interpolate nested objects
      interpolated[key] = interpolateProps(value, data, handlers);
    } else {
      // Interpolate the value
      interpolated[key] = interpolateValue(value, data);
    }
  });

  return interpolated;
}

/**
 * Get the singular form of a plural word (simple implementation)
 */
function getSingular(plural: string): string {
  if (plural.endsWith('ies')) {
    return plural.slice(0, -3) + 'y';
  }
  if (plural.endsWith('es')) {
    return plural.slice(0, -2);
  }
  if (plural.endsWith('s')) {
    return plural.slice(0, -1);
  }
  return plural;
}

/**
 * Render a single component node
 */
function renderNode(
  node: ComponentNode,
  data: Record<string, any>,
  handlers: Record<string, (...args: any[]) => void>,
  key: string | number
): React.ReactNode {
  // Evaluate condition
  if (node.condition && !evaluateCondition(node.condition, data)) {
    return null;
  }

  // Handle forEach loops
  if (node.forEach) {
    const items = data[node.forEach];
    if (!Array.isArray(items)) {
      console.warn(`forEach data "${node.forEach}" is not an array`);
      return null;
    }

    const singularName = getSingular(node.forEach);
    return items.map((item, index) => {
      const itemData = { ...data, [singularName]: item, index };
      // Remove forEach from node to avoid infinite loop
      const nodeWithoutForEach = { ...node, forEach: undefined };
      return renderNode(nodeWithoutForEach, itemData, handlers, `${key}-${index}`);
    });
  }

  // Get the component
  const componentName = interpolateValue(node.component, data);
  const Component = componentMap[componentName];

  if (!Component) {
    console.warn(`Component "${componentName}" not found in componentMap`);
    return null;
  }

  // Interpolate props
  const props = interpolateProps(node.props, data, handlers);

  // Handle special props
  if (props.startIcon && typeof props.startIcon === 'string') {
    const IconComponent = iconMap[props.startIcon];
    if (IconComponent) {
      props.startIcon = <IconComponent />;
    }
  }

  if (props.endIcon && typeof props.endIcon === 'string') {
    const IconComponent = iconMap[props.endIcon];
    if (IconComponent) {
      props.endIcon = <IconComponent />;
    }
  }

  // Handle 'text' prop for Typography and Button
  let textContent = null;
  if (props.text !== undefined) {
    textContent = props.text;
    delete props.text;
  }

  // Render children
  const children = node.children?.map((child, index) =>
    renderNode(child, data, handlers, `${key}-child-${index}`)
  );

  return (
    <Component key={key} {...props}>
      {textContent}
      {children}
    </Component>
  );
}

/**
 * ComponentTreeRenderer - Renders a component tree from JSON configuration
 */
export default function ComponentTreeRenderer({
  tree,
  data = {},
  handlers = {},
}: ComponentTreeRendererProps) {
  if (!tree) {
    return null;
  }

  return <>{renderNode(tree, data, handlers, 'root')}</>;
}
