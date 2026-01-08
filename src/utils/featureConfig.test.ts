import { describe, expect, it } from 'vitest';
import {
  getConstraintTypes,
  getDataTypes,
  getEnabledFeaturesByPriority,
  getFeatureById,
  getFeatures,
  getNavItems,
  getTranslations,
  getFeatureTranslation,
  getActionTranslation,
  getTableTranslation,
  getColumnTranslation,
  getActionFunctionName,
  getTableLayout,
  getColumnLayout,
  getTableFeatures,
  getColumnFeatures,
  getComponentLayout,
} from './featureConfig';

describe('FeatureConfig', () => {
  describe('getFeatures', () => {
    it('should return only enabled features', () => {
      const features = getFeatures();
      
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      
      // All returned features should be enabled
      features.forEach(feature => {
        expect(feature.enabled).toBe(true);
      });
    });

    it('should return features with required properties', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(feature).toHaveProperty('id');
        expect(feature).toHaveProperty('name');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('enabled');
        expect(feature).toHaveProperty('priority');
        expect(feature).toHaveProperty('endpoints');
        expect(feature).toHaveProperty('ui');
      });
    });

    it('should return features with valid UI configuration', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(feature.ui).toHaveProperty('showInNav');
        expect(feature.ui).toHaveProperty('icon');
        expect(feature.ui).toHaveProperty('actions');
        expect(Array.isArray(feature.ui.actions)).toBe(true);
      });
    });
  });

  describe('getFeatureById', () => {
    it('should return feature when ID exists and is enabled', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('database-crud');
      expect(feature?.enabled).toBe(true);
    });

    it('should return feature for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('table-management');
      expect(feature?.name).toBe('Table Management');
    });

    it('should return feature for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('column-management');
      expect(feature?.name).toBe('Column Management');
    });

    it('should return feature for sql-query', () => {
      const feature = getFeatureById('sql-query');
      
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('sql-query');
      expect(feature?.name).toBe('SQL Query Interface');
    });

    it('should return undefined for non-existent feature ID', () => {
      const feature = getFeatureById('non-existent-feature');
      
      expect(feature).toBeUndefined();
    });

    it('should return undefined for disabled feature', () => {
      // This test assumes there might be disabled features in the config
      const features = getFeatures();
      const _enabledIds = features.map(f => f.id);

      // Try to get a feature that doesn't exist in enabled list
      const disabledFeature = getFeatureById('disabled-test-feature');
      expect(disabledFeature).toBeUndefined();
    });
  });

  describe('getDataTypes', () => {
    it('should return array of data types', () => {
      const dataTypes = getDataTypes();
      
      expect(dataTypes).toBeDefined();
      expect(Array.isArray(dataTypes)).toBe(true);
      expect(dataTypes.length).toBeGreaterThan(0);
    });

    it('should return data types with required properties', () => {
      const dataTypes = getDataTypes();
      
      dataTypes.forEach(dataType => {
        expect(dataType).toHaveProperty('name');
        expect(dataType).toHaveProperty('category');
        expect(dataType).toHaveProperty('requiresLength');
        expect(typeof dataType.name).toBe('string');
        expect(typeof dataType.category).toBe('string');
        expect(typeof dataType.requiresLength).toBe('boolean');
      });
    });

    it('should include common PostgreSQL data types', () => {
      const dataTypes = getDataTypes();
      const typeNames = dataTypes.map(dt => dt.name);
      
      // Check for essential PostgreSQL types
      expect(typeNames).toContain('INTEGER');
      expect(typeNames).toContain('VARCHAR');
      expect(typeNames).toContain('TEXT');
      expect(typeNames).toContain('BOOLEAN');
      expect(typeNames).toContain('TIMESTAMP');
    });

    it('should have VARCHAR with requiresLength = true', () => {
      const dataTypes = getDataTypes();
      const varchar = dataTypes.find(dt => dt.name === 'VARCHAR');
      
      expect(varchar).toBeDefined();
      expect(varchar?.requiresLength).toBe(true);
      expect(varchar?.defaultLength).toBeDefined();
    });

    it('should have INTEGER with requiresLength = false', () => {
      const dataTypes = getDataTypes();
      const integer = dataTypes.find(dt => dt.name === 'INTEGER');
      
      expect(integer).toBeDefined();
      expect(integer?.requiresLength).toBe(false);
    });

    it('should categorize data types correctly', () => {
      const dataTypes = getDataTypes();
      
      const integer = dataTypes.find(dt => dt.name === 'INTEGER');
      expect(integer?.category).toBe('numeric');
      
      const varchar = dataTypes.find(dt => dt.name === 'VARCHAR');
      expect(varchar?.category).toBe('text');
      
      const boolean = dataTypes.find(dt => dt.name === 'BOOLEAN');
      expect(boolean?.category).toBe('boolean');
    });
  });

  describe('getNavItems', () => {
    it('should return array of navigation items', () => {
      const navItems = getNavItems();
      
      expect(navItems).toBeDefined();
      expect(Array.isArray(navItems)).toBe(true);
    });

    it('should return nav items with required properties', () => {
      const navItems = getNavItems();
      
      navItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('featureId');
      });
    });

    it('should only return nav items for enabled features', () => {
      const navItems = getNavItems();
      
      navItems.forEach(item => {
        const feature = getFeatureById(item.featureId);
        expect(feature).toBeDefined();
        expect(feature?.enabled).toBe(true);
      });
    });

    it('should include Tables nav item', () => {
      const navItems = getNavItems();
      const tablesItem = navItems.find(item => item.id === 'tables');
      
      expect(tablesItem).toBeDefined();
      expect(tablesItem?.featureId).toBe('database-crud');
    });

    it('should include SQL Query nav item', () => {
      const navItems = getNavItems();
      const queryItem = navItems.find(item => item.id === 'query');
      
      expect(queryItem).toBeDefined();
      expect(queryItem?.featureId).toBe('sql-query');
    });

    it('should include Table Manager nav item', () => {
      const navItems = getNavItems();
      const tableManagerItem = navItems.find(item => item.id === 'table-manager');
      
      expect(tableManagerItem).toBeDefined();
      expect(tableManagerItem?.featureId).toBe('table-management');
    });
  });

  describe('getEnabledFeaturesByPriority', () => {
    it('should return features with high priority', () => {
      const highPriorityFeatures = getEnabledFeaturesByPriority('high');
      
      expect(Array.isArray(highPriorityFeatures)).toBe(true);
      
      highPriorityFeatures.forEach(feature => {
        expect(feature.priority).toBe('high');
        expect(feature.enabled).toBe(true);
      });
    });

    it('should return all enabled features have high priority', () => {
      const highPriorityFeatures = getEnabledFeaturesByPriority('high');
      
      // All current features should have high priority
      expect(highPriorityFeatures.length).toBeGreaterThan(0);
      
      const ids = highPriorityFeatures.map(f => f.id);
      expect(ids).toContain('database-crud');
      expect(ids).toContain('table-management');
      expect(ids).toContain('column-management');
      expect(ids).toContain('sql-query');
    });

    it('should return empty array for non-existent priority', () => {
      const features = getEnabledFeaturesByPriority('non-existent-priority');
      
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBe(0);
    });

    it('should return empty array for low priority (if none exist)', () => {
      const lowPriorityFeatures = getEnabledFeaturesByPriority('low');
      
      expect(Array.isArray(lowPriorityFeatures)).toBe(true);
      // Expecting 0 since current config has all high priority
      expect(lowPriorityFeatures.length).toBe(0);
    });
  });

  describe('getConstraintTypes', () => {
    it('should return array of constraint types', () => {
      const constraintTypes = getConstraintTypes();
      
      expect(Array.isArray(constraintTypes)).toBe(true);
    });

    it('should return constraint types with required properties', () => {
      const constraintTypes = getConstraintTypes();
      
      constraintTypes.forEach(constraintType => {
        expect(constraintType).toHaveProperty('name');
        expect(constraintType).toHaveProperty('description');
        expect(constraintType).toHaveProperty('requiresColumn');
        expect(constraintType).toHaveProperty('requiresExpression');
        expect(typeof constraintType.name).toBe('string');
        expect(typeof constraintType.description).toBe('string');
        expect(typeof constraintType.requiresColumn).toBe('boolean');
        expect(typeof constraintType.requiresExpression).toBe('boolean');
      });
    });

    it('should include PRIMARY KEY constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const primaryKeyConstraint = constraintTypes.find(ct => ct.name === 'PRIMARY KEY');
      
      expect(primaryKeyConstraint).toBeDefined();
      expect(primaryKeyConstraint?.requiresColumn).toBe(true);
      expect(primaryKeyConstraint?.requiresExpression).toBe(false);
    });

    it('should include UNIQUE constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const uniqueConstraint = constraintTypes.find(ct => ct.name === 'UNIQUE');
      
      expect(uniqueConstraint).toBeDefined();
      expect(uniqueConstraint?.requiresColumn).toBe(true);
      expect(uniqueConstraint?.requiresExpression).toBe(false);
    });

    it('should include CHECK constraint type', () => {
      const constraintTypes = getConstraintTypes();
      const checkConstraint = constraintTypes.find(ct => ct.name === 'CHECK');
      
      expect(checkConstraint).toBeDefined();
      expect(checkConstraint?.requiresColumn).toBe(false);
      expect(checkConstraint?.requiresExpression).toBe(true);
    });
  });

  describe('Feature endpoints', () => {
    it('should have valid endpoint structure for database-crud', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature?.endpoints).toBeDefined();
      expect(Array.isArray(feature?.endpoints)).toBe(true);
      expect(feature?.endpoints.length).toBeGreaterThan(0);
      
      feature?.endpoints.forEach(endpoint => {
        expect(endpoint).toHaveProperty('path');
        expect(endpoint).toHaveProperty('methods');
        expect(endpoint).toHaveProperty('description');
        expect(endpoint.path).toMatch(/^\/api\//);
      });
    });

    it('should have valid endpoint structure for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature?.endpoints).toBeDefined();
      const tableManageEndpoint = feature?.endpoints.find(
        ep => ep.path === '/api/admin/table-manage'
      );
      
      expect(tableManageEndpoint).toBeDefined();
      expect(tableManageEndpoint?.methods).toContain('POST');
      expect(tableManageEndpoint?.methods).toContain('DELETE');
    });

    it('should have valid endpoint structure for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature?.endpoints).toBeDefined();
      const columnManageEndpoint = feature?.endpoints.find(
        ep => ep.path === '/api/admin/column-manage'
      );
      
      expect(columnManageEndpoint).toBeDefined();
      expect(columnManageEndpoint?.methods).toContain('POST');
      expect(columnManageEndpoint?.methods).toContain('PUT');
      expect(columnManageEndpoint?.methods).toContain('DELETE');
    });
  });

  describe('Feature UI configuration', () => {
    it('should have correct UI actions for database-crud', () => {
      const feature = getFeatureById('database-crud');
      
      expect(feature?.ui.actions).toContain('create');
      expect(feature?.ui.actions).toContain('read');
      expect(feature?.ui.actions).toContain('update');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should have correct UI actions for table-management', () => {
      const feature = getFeatureById('table-management');
      
      expect(feature?.ui.actions).toContain('create');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should have correct UI actions for column-management', () => {
      const feature = getFeatureById('column-management');
      
      expect(feature?.ui.actions).toContain('add');
      expect(feature?.ui.actions).toContain('modify');
      expect(feature?.ui.actions).toContain('delete');
    });

    it('should all features have showInNav in UI config', () => {
      const features = getFeatures();
      
      features.forEach(feature => {
        expect(typeof feature.ui.showInNav).toBe('boolean');
      });
    });
  });

  describe('getTranslations', () => {
    it('should return English translations by default', () => {
      const translations = getTranslations();
      
      expect(translations).toBeDefined();
      expect(translations).toHaveProperty('features');
      expect(translations).toHaveProperty('actions');
      expect(translations).toHaveProperty('tables');
      expect(translations).toHaveProperty('columns');
    });

    it('should return French translations when locale is fr', () => {
      const translations = getTranslations('fr');
      
      expect(translations).toBeDefined();
      expect(translations).toHaveProperty('features');
      expect(translations).toHaveProperty('actions');
    });
  });

  describe('getFeatureTranslation', () => {
    it('should return English translation for database-crud', () => {
      const translation = getFeatureTranslation('database-crud', 'en');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Database CRUD Operations');
      expect(translation?.description).toContain('Create, read, update, and delete');
    });

    it('should return French translation for database-crud', () => {
      const translation = getFeatureTranslation('database-crud', 'fr');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Opérations CRUD de base de données');
    });

    it('should return undefined for non-existent feature', () => {
      const translation = getFeatureTranslation('non-existent', 'en');
      
      expect(translation).toBeUndefined();
    });
  });

  describe('getActionTranslation', () => {
    it('should return English translation for create action', () => {
      const translation = getActionTranslation('create', 'en');
      
      expect(translation).toBe('Create');
    });

    it('should return French translation for create action', () => {
      const translation = getActionTranslation('create', 'fr');
      
      expect(translation).toBe('Créer');
    });

    it('should return English translation for delete action', () => {
      const translation = getActionTranslation('delete', 'en');
      
      expect(translation).toBe('Delete');
    });

    it('should return French translation for delete action', () => {
      const translation = getActionTranslation('delete', 'fr');
      
      expect(translation).toBe('Supprimer');
    });
  });

  describe('getTableTranslation', () => {
    it('should return English translation for users table', () => {
      const translation = getTableTranslation('users', 'en');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Users');
      expect(translation?.description).toBe('User accounts and profiles');
    });

    it('should return French translation for users table', () => {
      const translation = getTableTranslation('users', 'fr');
      
      expect(translation).toBeDefined();
      expect(translation?.name).toBe('Utilisateurs');
    });
  });

  describe('getColumnTranslation', () => {
    it('should return English translation for name column', () => {
      const translation = getColumnTranslation('name', 'en');
      
      expect(translation).toBe('Name');
    });

    it('should return French translation for name column', () => {
      const translation = getColumnTranslation('name', 'fr');
      
      expect(translation).toBe('Nom');
    });

    it('should return English translation for email column', () => {
      const translation = getColumnTranslation('email', 'en');
      
      expect(translation).toBe('Email');
    });
  });

  describe('getActionFunctionName', () => {
    it('should return function name for database-crud create action', () => {
      const functionName = getActionFunctionName('database-crud', 'create');
      
      expect(functionName).toBe('createRecord');
    });

    it('should return function name for table-management create action', () => {
      const functionName = getActionFunctionName('table-management', 'create');
      
      expect(functionName).toBe('createTable');
    });

    it('should return function name for column-management add action', () => {
      const functionName = getActionFunctionName('column-management', 'add');
      
      expect(functionName).toBe('addColumn');
    });

    it('should return undefined for non-existent feature', () => {
      const functionName = getActionFunctionName('non-existent', 'create');
      
      expect(functionName).toBeUndefined();
    });
  });

  describe('getTableLayout', () => {
    it('should return layout configuration for users table', () => {
      const layout = getTableLayout('users');
      
      expect(layout).toBeDefined();
      expect(layout?.columns).toContain('id');
      expect(layout?.columns).toContain('name');
      expect(layout?.columns).toContain('email');
      expect(layout?.columnWidths).toHaveProperty('id');
      expect(layout?.defaultSort).toHaveProperty('column');
      expect(layout?.defaultSort).toHaveProperty('direction');
    });

    it('should return layout configuration for products table', () => {
      const layout = getTableLayout('products');
      
      expect(layout).toBeDefined();
      expect(layout?.columns).toContain('id');
      expect(layout?.columns).toContain('name');
      expect(layout?.defaultSort.column).toBe('name');
      expect(layout?.defaultSort.direction).toBe('asc');
    });

    it('should return undefined for non-existent table', () => {
      const layout = getTableLayout('non-existent');
      
      expect(layout).toBeUndefined();
    });
  });

  describe('getColumnLayout', () => {
    it('should return layout configuration for id column', () => {
      const layout = getColumnLayout('id');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('left');
      expect(layout?.format).toBe('number');
      expect(layout?.editable).toBe(false);
    });

    it('should return layout configuration for email column', () => {
      const layout = getColumnLayout('email');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('left');
      expect(layout?.format).toBe('email');
      expect(layout?.editable).toBe(true);
    });

    it('should return layout configuration for price column', () => {
      const layout = getColumnLayout('price');
      
      expect(layout).toBeDefined();
      expect(layout?.align).toBe('right');
      expect(layout?.format).toBe('currency');
    });
  });

  describe('getTableFeatures', () => {
    it('should return features configuration for users table', () => {
      const features = getTableFeatures('users');
      
      expect(features).toBeDefined();
      expect(features?.enablePagination).toBe(true);
      expect(features?.enableSearch).toBe(true);
      expect(features?.enableExport).toBe(true);
      expect(features?.enableFilters).toBe(true);
      expect(features?.rowsPerPage).toBe(25);
      expect(features?.allowedActions).toContain('create');
      expect(features?.allowedActions).toContain('read');
    });

    it('should return features configuration for products table', () => {
      const features = getTableFeatures('products');
      
      expect(features).toBeDefined();
      expect(features?.rowsPerPage).toBe(50);
    });

    it('should return undefined for non-existent table', () => {
      const features = getTableFeatures('non-existent');
      
      expect(features).toBeUndefined();
    });
  });

  describe('getColumnFeatures', () => {
    it('should return features configuration for id column', () => {
      const features = getColumnFeatures('id');
      
      expect(features).toBeDefined();
      expect(features?.searchable).toBe(true);
      expect(features?.sortable).toBe(true);
      expect(features?.filterable).toBe(true);
      expect(features?.required).toBe(true);
    });

    it('should return features configuration for email column with validation', () => {
      const features = getColumnFeatures('email');
      
      expect(features).toBeDefined();
      expect(features?.validation).toBe('email');
      expect(features?.required).toBe(true);
    });

    it('should return features configuration for created_at column', () => {
      const features = getColumnFeatures('created_at');
      
      expect(features).toBeDefined();
      expect(features?.searchable).toBe(false);
      expect(features?.sortable).toBe(true);
    });
  });

  describe('getComponentLayout', () => {
    it('should return layout configuration for DataGrid component', () => {
      const layout = getComponentLayout('DataGrid');
      
      expect(layout).toBeDefined();
      expect(layout?.headerHeight).toBe(56);
      expect(layout?.rowHeight).toBe(48);
      expect(layout?.density).toBe('standard');
      expect(layout?.showBorders).toBe(true);
    });

    it('should return layout configuration for FormDialog component', () => {
      const layout = getComponentLayout('FormDialog');
      
      expect(layout).toBeDefined();
      expect(layout?.width).toBe('md');
      expect(layout?.fullScreen).toBe(false);
      expect(layout?.showCloseButton).toBe(true);
    });

    it('should return layout configuration for Sidebar component', () => {
      const layout = getComponentLayout('Sidebar');
      
      expect(layout).toBeDefined();
      expect(layout?.width).toBe(240);
      expect(layout?.collapsible).toBe(true);
      expect(layout?.defaultOpen).toBe(true);
    });

    it('should return undefined for non-existent component', () => {
      const layout = getComponentLayout('NonExistentComponent');
      
      expect(layout).toBeUndefined();
    });
  });
});
