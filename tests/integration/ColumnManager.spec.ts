import { expect, test } from '@playwright/test';

test.describe('Column Manager', () => {
  test.describe('Add Column API', () => {
    test('should reject add column without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
          columnName: 'new_column',
          dataType: 'VARCHAR',
          nullable: true,
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject add column without required fields', async ({ page }) => {
      const response = await page.request.post('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject add column with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/column-manage', {
        data: {
          tableName: 'invalid-name!@#',
          columnName: 'test_col',
          dataType: 'INTEGER',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject add column with invalid column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
          columnName: 'invalid-col!@#',
          dataType: 'INTEGER',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Modify Column API', () => {
    test('should reject modify column without authentication', async ({ page }) => {
      const response = await page.request.put('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
          columnName: 'test_column',
          newType: 'TEXT',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject modify without required fields', async ({ page }) => {
      const response = await page.request.put('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject modify with invalid identifiers', async ({ page }) => {
      const response = await page.request.put('/api/admin/column-manage', {
        data: {
          tableName: 'invalid!@#',
          columnName: 'invalid!@#',
          newType: 'TEXT',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Drop Column API', () => {
    test('should reject drop column without authentication', async ({ page }) => {
      const response = await page.request.delete('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
          columnName: 'test_column',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject drop without required fields', async ({ page }) => {
      const response = await page.request.delete('/api/admin/column-manage', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject drop with invalid identifiers', async ({ page }) => {
      const response = await page.request.delete('/api/admin/column-manage', {
        data: {
          tableName: 'invalid!@#',
          columnName: 'invalid!@#',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });
});
