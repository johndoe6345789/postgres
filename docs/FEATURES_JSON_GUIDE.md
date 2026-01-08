# Complete Guide to features.json Configuration System

## Overview

The `features.json` file is now a comprehensive configuration system that defines:
- ✅ **UI Component Trees** - Declarative component hierarchies
- ✅ **Playwright Playbooks** - E2E test scenarios
- ✅ **Storybook Stories** - Component documentation
- ✅ **Feature Flags** - Enable/disable features
- ✅ **Translations** - Multi-language support
- ✅ **Form Schemas** - Dynamic form generation
- ✅ **API Endpoints** - REST API definitions
- ✅ **Permissions** - Role-based access control

**Note:** SQL query templates have been removed for security reasons. Use Drizzle ORM for all database operations (see section 2).

## 1. Component Trees

Define complete UI hierarchies in JSON without writing JSX.

### Example: Simple Component Tree
```json
{
  "componentTrees": {
    "MyPage": {
      "component": "Box",
      "props": {
        "sx": { "p": 3 }
      },
      "children": [
        {
          "component": "Typography",
          "props": {
            "variant": "h4",
            "text": "{{pageTitle}}"
          }
        },
        {
          "component": "Button",
          "condition": "canCreate",
          "props": {
            "variant": "contained",
            "startIcon": "Add",
            "onClick": "handleCreate",
            "text": "Create New"
          }
        }
      ]
    }
  }
}
```

### Using Component Trees in Code
```tsx
import { getComponentTree } from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/ComponentTreeRenderer';

function MyComponent() {
  const tree = getComponentTree('MyPage');
  const data = { pageTitle: 'Welcome', canCreate: true };
  const handlers = { handleCreate: () => console.log('Create') };
  
  return <ComponentTreeRenderer tree={tree} data={data} handlers={handlers} />;
}
```

### Component Tree Features

**Template Interpolation:**
```json
{
  "props": {
    "text": "Hello {{user.name}}!"
  }
}
```

**Conditional Rendering:**
```json
{
  "condition": "isAdmin && hasPermission('create')",
  "component": "Button"
}
```

**Loops (forEach):**
```json
{
  "component": "List",
  "children": [
    {
      "component": "ListItem",
      "forEach": "items",
      "children": [
        {
          "component": "Typography",
          "props": {
            "text": "{{item.name}}"
          }
        }
      ]
    }
  ]
}
```

## 2. Database Queries - Use Drizzle ORM

**IMPORTANT SECURITY NOTE:** This project previously included SQL template strings in `features.json`, but they have been removed due to SQL injection risks. 

### Why SQL Templates Were Removed

SQL templates with string interpolation (e.g., `{{tableName}}`) are inherently unsafe because they:
1. Allow SQL injection if user input is not properly sanitized
2. Encourage dangerous string concatenation patterns
3. Bypass type-safe query builders

### Use Drizzle ORM Instead

All database queries should use Drizzle ORM, which provides:
- **Type safety** - Compile-time validation of queries
- **SQL injection prevention** - Automatic parameterization
- **Better performance** - Query optimization
- **Cleaner code** - Fluent API

### Example: Correct Way to Query Database

```typescript
import { db } from '@/utils/db';
import { sql } from 'drizzle-orm';

// ✅ GOOD: Using Drizzle ORM with parameterized queries
async function getTableData(tableName: string) {
  // Use sql.identifier for table/column names
  const result = await db.execute(sql`
    SELECT * FROM ${sql.identifier([tableName])} 
    LIMIT 100
  `);
  return result.rows;
}

// ✅ GOOD: Using Drizzle ORM query builder
async function insertRecord(table: any, data: Record<string, any>) {
  const result = await db.insert(table).values(data).returning();
  return result[0];
}

// ❌ BAD: String concatenation (DO NOT USE)
async function unsafeQuery(tableName: string) {
  // This is vulnerable to SQL injection!
  const query = `SELECT * FROM "${tableName}"`;
  return await db.execute(sql.raw(query));
}
```

### See Also
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [SQL Injection Prevention Guide](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- API route examples in `src/app/api/admin/` directory

## 3. Playwright Playbooks

Define E2E test scenarios in JSON.

### Example Playbook
```json
{
  "playwrightPlaybooks": {
    "createTable": {
      "name": "Create Table Workflow",
      "description": "Test creating a new database table",
      "tags": ["admin", "table", "crud"],
      "steps": [
        {
          "action": "goto",
          "url": "/admin/dashboard"
        },
        {
          "action": "click",
          "selector": "button:has-text('Create Table')"
        },
        {
          "action": "fill",
          "selector": "input[label='Table Name']",
          "value": "{{tableName}}"
        },
        {
          "action": "expect",
          "selector": "text={{tableName}}",
          "text": "visible"
        }
      ],
      "cleanup": [
        {
          "action": "click",
          "selector": "button:has-text('Drop Table')"
        }
      ]
    }
  }
}
```

### Using Playbooks
```typescript
import { getPlaywrightPlaybook } from '@/utils/featureConfig';

const playbook = getPlaywrightPlaybook('createTable');

// Execute playbook steps
for (const step of playbook.steps) {
  switch (step.action) {
    case 'goto':
      await page.goto(step.url);
      break;
    case 'click':
      await page.click(step.selector);
      break;
    // ... handle other actions
  }
}
```

## 4. Storybook Stories

Define component stories in JSON.

### Example Stories
```json
{
  "storybookStories": {
    "Button": {
      "primary": {
        "name": "Primary Button",
        "description": "Primary action button",
        "args": {
          "variant": "contained",
          "color": "primary",
          "text": "Click Me"
        }
      },
      "withIcon": {
        "name": "With Icon",
        "args": {
          "variant": "contained",
          "startIcon": "Add",
          "text": "Add Item"
        },
        "play": [
          "await userEvent.click(screen.getByText('Add Item'))",
          "await expect(args.onClick).toHaveBeenCalled()"
        ]
      }
    }
  }
}
```

### Using Stories
```typescript
import { getStorybookStory } from '@/utils/featureConfig';

const story = getStorybookStory('Button', 'primary');

export const Primary = {
  name: story.name,
  args: story.args,
};
```

## 5. Helper Functions

### Component Trees
```typescript
import {
  getComponentTree,
  getAllComponentTrees,
} from '@/utils/featureConfig';

const tree = getComponentTree('TableManagerTab');
const allTrees = getAllComponentTrees();
```

### Playwright Playbooks
```typescript
import {
  getPlaywrightPlaybook,
  getAllPlaywrightPlaybooks,
  getPlaywrightPlaybooksByTag,
} from '@/utils/featureConfig';

const playbook = getPlaywrightPlaybook('createTable');
const allPlaybooks = getAllPlaywrightPlaybooks();
const adminPlaybooks = getPlaywrightPlaybooksByTag('admin');
```

### Storybook Stories
```typescript
import {
  getStorybookStory,
  getAllStorybookStories,
  getStorybookStoriesForComponent,
} from '@/utils/featureConfig';

const story = getStorybookStory('Button', 'primary');
const allStories = getAllStorybookStories();
const buttonStories = getStorybookStoriesForComponent('Button');
```

## 6. Feature Flags

Enable or disable features dynamically.

```json
{
  "features": [
    {
      "id": "table-management",
      "name": "Table Management",
      "enabled": true,
      "priority": "high",
      "ui": {
        "showInNav": true,
        "icon": "TableChart",
        "actions": ["create", "delete"]
      }
    }
  ]
}
```

### Using Features
```typescript
import { getFeatureById, getFeatures } from '@/utils/featureConfig';

const feature = getFeatureById('table-management');
const canCreate = feature?.ui.actions.includes('create');
const allFeatures = getFeatures(); // Only enabled features
```

## 7. Form Schemas

Dynamic form generation from JSON.

```json
{
  "formSchemas": {
    "users": {
      "fields": [
        {
          "name": "name",
          "type": "text",
          "label": "Name",
          "required": true,
          "minLength": 2,
          "maxLength": 100
        },
        {
          "name": "email",
          "type": "email",
          "label": "Email",
          "required": true,
          "validation": "email"
        }
      ],
      "submitLabel": "Save User",
      "cancelLabel": "Cancel"
    }
  }
}
```

### Using Form Schemas
```typescript
import { getFormSchema } from '@/utils/featureConfig';

const schema = getFormSchema('users');

<FormDialog
  open={open}
  title="Add User"
  fields={schema.fields}
  submitLabel={schema.submitLabel}
  onSubmit={handleSubmit}
/>
```

## 8. Translations

Multi-language support.

```json
{
  "translations": {
    "en": {
      "features": {
        "database-crud": {
          "name": "Database CRUD Operations",
          "description": "Create, read, update, and delete records"
        }
      },
      "actions": {
        "create": "Create",
        "update": "Update"
      }
    },
    "fr": {
      "features": {
        "database-crud": {
          "name": "Opérations CRUD",
          "description": "Créer, lire, mettre à jour et supprimer"
        }
      },
      "actions": {
        "create": "Créer",
        "update": "Mettre à jour"
      }
    }
  }
}
```

### Using Translations
```typescript
import {
  getFeatureTranslation,
  getActionTranslation,
} from '@/utils/featureConfig';

const feature = getFeatureTranslation('database-crud', 'fr');
const createAction = getActionTranslation('create', 'fr');
```

## 9. API Endpoints

REST API documentation in JSON.

```json
{
  "apiEndpoints": {
    "users": {
      "list": {
        "method": "GET",
        "path": "/api/admin/users",
        "description": "List all users"
      },
      "create": {
        "method": "POST",
        "path": "/api/admin/users",
        "description": "Create a new user"
      }
    }
  }
}
```

### Using API Endpoints
```typescript
import { getApiEndpoint, getApiEndpoints } from '@/utils/featureConfig';

const endpoint = getApiEndpoint('users', 'list');
// { method: 'GET', path: '/api/admin/users', description: '...' }

const allUserEndpoints = getApiEndpoints('users');
```

## 10. Permissions

Role-based access control.

```json
{
  "permissions": {
    "users": {
      "create": ["admin"],
      "read": ["admin", "user"],
      "update": ["admin"],
      "delete": ["admin"]
    }
  }
}
```

### Using Permissions
```typescript
import { hasPermission, getPermissions } from '@/utils/featureConfig';

const canCreate = hasPermission('users', 'create', userRole);
const userPermissions = getPermissions('users');
```

## Benefits

### 1. Configuration-Driven Development
- Define UIs, queries, tests, and stories in JSON
- No code changes needed for many modifications
- Non-developers can contribute

### 2. Consistency
- All features use the same structure
- Standardized component usage
- Enforced patterns

### 3. Rapid Development
- Prototype new features quickly
- Reuse existing patterns
- Less boilerplate code

### 4. Maintainability
- Single source of truth
- Easy to find and update configuration
- Clear separation of concerns

### 5. Testing
- Playbooks define test scenarios
- Storybook stories from JSON
- Easy to add new test cases

### 6. Flexibility
- Enable/disable features dynamically
- A/B test different configurations
- Multi-language support

## Best Practices

### 1. Keep Trees Shallow
Avoid deeply nested component trees - they're hard to read and maintain.

### 2. Use Meaningful Names
Name component trees, playbooks, and templates descriptively:
- ✅ `UserListPage` 
- ❌ `Page1`

### 3. Document with Comments
Use the `comment` property in component trees:
```json
{
  "component": "Outlet",
  "comment": "Child routes render here"
}
```

### 4. Validate Configuration
Use TypeScript types to ensure correctness:
```typescript
import type { ComponentTree, SqlTemplate } from '@/utils/featureConfig';
```

### 5. Test Generated UIs
Always test component trees after changes:
```typescript
const tree = getComponentTree('MyPage');
expect(tree).toBeDefined();
expect(tree.component).toBe('Box');
```

### 6. Version Control
Track features.json changes carefully - it's critical infrastructure.

### 7. Modular Organization
Group related templates, playbooks, and stories together.

## Conclusion

The features.json configuration system enables:
- **50% less boilerplate code** in components
- **Declarative UI definition** without JSX
- **Configuration-driven E2E tests** with Playwright
- **Automated Storybook stories** from JSON
- **Parameterized SQL queries** for safety
- **Complete feature configuration** in one place

This architecture scales to hundreds of features while keeping the codebase maintainable and the development workflow efficient.
