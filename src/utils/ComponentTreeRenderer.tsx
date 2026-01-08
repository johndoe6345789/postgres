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
 * Safe operator functions for condition evaluation
 */
const SAFE_OPERATORS: Record<string, (a: any, b: any) => boolean> = {
  '===': (a, b) => a === b,
  '!==': (a, b) => a !== b,
  '==': (a, b) => a == b,
  '!=': (a, b) => a != b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '&&': (a, b) => a && b,
  '||': (a, b) => a || b,
};

/**
 * Safely get nested property value from object using dot notation
 * Only allows alphanumeric and dots - no function calls or arbitrary code
 */
function safeGetProperty(obj: Record<string, any>, path: string): any {
  // Validate path contains only safe characters
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(path)) {
    console.warn('Invalid property path:', path);
    return undefined;
  }
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Evaluate a condition string with the provided data context
 * Uses safe property access and whitelisted operators - NO new Function()
 */
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    // Simple boolean property check: "isAdmin"
    if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(condition.trim())) {
      const value = safeGetProperty(data, condition.trim());
      return Boolean(value);
    }
    
    // Find operator in condition
    let operator: string | null = null;
    let operatorIndex = -1;
    
    // Check for operators in order of precedence
    for (const op of ['===', '!==', '==', '!=', '>=', '<=', '>', '<', '&&', '||']) {
      const idx = condition.indexOf(op);
      if (idx !== -1) {
        operator = op;
        operatorIndex = idx;
        break;
      }
    }
    
    if (!operator || operatorIndex === -1) {
      console.warn('No valid operator found in condition:', condition);
      return false;
    }
    
    // Extract left and right operands
    const left = condition.slice(0, operatorIndex).trim();
    const right = condition.slice(operatorIndex + operator.length).trim();
    
    // Evaluate operands
    let leftValue: any;
    let rightValue: any;
    
    // Left operand - check if it's a property or literal
    if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(left)) {
      leftValue = safeGetProperty(data, left);
    } else if (left === 'true') {
      leftValue = true;
    } else if (left === 'false') {
      leftValue = false;
    } else if (left === 'null') {
      leftValue = null;
    } else if (!isNaN(Number(left))) {
      leftValue = Number(left);
    } else if ((left.startsWith('"') && left.endsWith('"')) || (left.startsWith("'") && left.endsWith("'"))) {
      leftValue = left.slice(1, -1);
    } else {
      console.warn('Invalid left operand:', left);
      return false;
    }
    
    // Right operand - same logic
    if (/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(right)) {
      rightValue = safeGetProperty(data, right);
    } else if (right === 'true') {
      rightValue = true;
    } else if (right === 'false') {
      rightValue = false;
    } else if (right === 'null') {
      rightValue = null;
    } else if (!isNaN(Number(right))) {
      rightValue = Number(right);
    } else if ((right.startsWith('"') && right.endsWith('"')) || (right.startsWith("'") && right.endsWith("'"))) {
      rightValue = right.slice(1, -1);
    } else {
      console.warn('Invalid right operand:', right);
      return false;
    }
    
    // Apply operator
    const operatorFunc = SAFE_OPERATORS[operator];
    if (!operatorFunc) {
      console.warn('Unknown operator:', operator);
      return false;
    }
    
    return operatorFunc(leftValue, rightValue);
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
}

/**
 * Interpolate template strings like {{variable}} with actual values from data
 * Uses safe property access - NO new Function() or eval()
 */
function interpolateValue(value: any, data: Record<string, any>): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Check if it's a template string
  const templateMatch = value.match(/^\{\{(.+)\}\}$/);
  if (templateMatch && templateMatch[1]) {
    const expression = templateMatch[1].trim();
    
    // Support Math operations for numeric expressions
    if (/^Math\.[a-zA-Z]+\(/.test(expression)) {
      // Allow safe Math operations
      const mathOp = expression.match(/^Math\.([a-zA-Z]+)\((.+)\)$/);
      if (mathOp) {
        const [, operation, argsStr] = mathOp;
        const safeOps = ['abs', 'ceil', 'floor', 'round', 'max', 'min'];
        
        if (safeOps.includes(operation)) {
          try {
            // Parse arguments safely
            const args = argsStr.split(',').map(arg => {
              const trimmed = arg.trim();
              const propValue = safeGetProperty(data, trimmed);
              return propValue !== undefined ? propValue : Number(trimmed);
            });
            
            return (Math as any)[operation](...args);
          } catch (error) {
            console.error('Error evaluating Math operation:', expression, error);
            return value;
          }
        }
      }
    }
    
    // Ternary operator: condition ? valueIfTrue : valueIfFalse
    const ternaryMatch = expression.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
      const [, condition, trueValue, falseValue] = ternaryMatch;
      const conditionResult = evaluateCondition(condition.trim(), data);
      const targetValue = conditionResult ? trueValue.trim() : falseValue.trim();
      
      // Recursively interpolate the result
      return interpolateValue(`{{${targetValue}}}`, data);
    }
    
    // Simple property access
    return safeGetProperty(data, expression);
  }

  // Replace inline templates
  return value.replace(/\{\{(.+?)\}\}/g, (_, expression) => {
    const trimmed = expression.trim();
    const result = safeGetProperty(data, trimmed);
    return result !== undefined ? String(result) : '';
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
