import { describe, expect, it } from 'vitest';
import {
  getConstraintTypes,
  getDataTypes,
  getEnabledFeaturesByPriority,
  getFeatureById,
  getFeatures,
  getNavItems,
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
      const enabledIds = features.map(f => f.id);
      
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
});
