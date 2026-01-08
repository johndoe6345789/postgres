'use client';

import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import RuleIcon from '@mui/icons-material/Rule';
import StorageIcon from '@mui/icons-material/Storage';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ConstraintManagerTab from '@/components/admin/ConstraintManagerTab';
import { theme } from '@/utils/theme';

const DRAWER_WIDTH = 240;

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dialog states
  const [_openCreateDialog, _setOpenCreateDialog] = useState(false);
  const [_openEditDialog, _setOpenEditDialog] = useState(false);
  const [_openDeleteDialog, _setOpenDeleteDialog] = useState(false);
  const [_editingRecord, _setEditingRecord] = useState<any>(null);
  const [_deletingRecord, _setDeletingRecord] = useState<any>(null);
  const [_formData, _setFormData] = useState<any>({});
  
  // Table Manager states
  const [openCreateTableDialog, setOpenCreateTableDialog] = useState(false);
  const [openDropTableDialog, setOpenDropTableDialog] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [tableColumns, setTableColumns] = useState<any[]>([{ name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false }]);
  const [tableToDelete, setTableToDelete] = useState('');
  
  // Column Manager states
  const [openAddColumnDialog, setOpenAddColumnDialog] = useState(false);
  const [openModifyColumnDialog, setOpenModifyColumnDialog] = useState(false);
  const [openDropColumnDialog, setOpenDropColumnDialog] = useState(false);
  const [selectedTableForColumn, setSelectedTableForColumn] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('VARCHAR');
  const [newColumnNullable, setNewColumnNullable] = useState(true);
  const [newColumnDefault, setNewColumnDefault] = useState('');
  const [columnToModify, setColumnToModify] = useState('');
  const [columnToDelete, setColumnToDelete] = useState('');

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (err: any) {
      setError(err.message);
    }
  }, [router]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (selectedTableForColumn && tabValue === 3) {
      // Fetch schema when a table is selected in Column Manager
      const fetchSchema = async () => {
        try {
          const schemaResponse = await fetch('/api/admin/table-schema', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableName: selectedTableForColumn }),
          });
          
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            setTableSchema(schemaData);
          }
        } catch (err) {
          console.error('Failed to fetch schema:', err);
        }
      };
      fetchSchema();
    }
  }, [selectedTableForColumn, tabValue]);

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setQueryResult(null);

    try {
      // Fetch table data
      const dataResponse = await fetch('/api/admin/table-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName }),
      });

      if (!dataResponse.ok) {
        const data = await dataResponse.json();
        throw new Error(data.error || 'Query failed');
      }

      const data = await dataResponse.json();
      setQueryResult(data);
      
      // Fetch table schema
      const schemaResponse = await fetch('/api/admin/table-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName }),
      });
      
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        setTableSchema(schemaData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!queryText.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setQueryResult(null);

    try {
      const response = await fetch('/api/admin/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      setQueryResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Table Management Handlers
  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      setError('Table name is required');
      return;
    }

    if (tableColumns.length === 0 || !tableColumns[0].name) {
      setError('At least one column is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/table-manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: newTableName,
          columns: tableColumns.filter(col => col.name.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      setSuccessMessage(data.message);
      setOpenCreateTableDialog(false);
      setNewTableName('');
      setTableColumns([{ name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false }]);
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDropTable = async () => {
    if (!tableToDelete) {
      setError('Please select a table to drop');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/table-manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName: tableToDelete }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to drop table');
      }

      setSuccessMessage(data.message);
      setOpenDropTableDialog(false);
      setTableToDelete('');
      if (selectedTable === tableToDelete) {
        setSelectedTable('');
        setQueryResult(null);
      }
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addColumnToTable = () => {
    setTableColumns([...tableColumns, { name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false }]);
  };

  const updateColumnField = (index: number, field: string, value: any) => {
    const updated = [...tableColumns];
    updated[index] = { ...updated[index], [field]: value };
    setTableColumns(updated);
  };

  const removeColumn = (index: number) => {
    if (tableColumns.length > 1) {
      setTableColumns(tableColumns.filter((_, i) => i !== index));
    }
  };

  // Column Management Handlers
  const handleAddColumn = async () => {
    if (!selectedTableForColumn || !newColumnName.trim() || !newColumnType) {
      setError('Table name, column name, and data type are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload: any = {
        tableName: selectedTableForColumn,
        columnName: newColumnName,
        dataType: newColumnType,
        nullable: newColumnNullable,
      };

      if (newColumnDefault) {
        payload.defaultValue = newColumnDefault;
      }

      const response = await fetch('/api/admin/column-manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add column');
      }

      setSuccessMessage(data.message);
      setOpenAddColumnDialog(false);
      setNewColumnName('');
      setNewColumnType('VARCHAR');
      setNewColumnNullable(true);
      setNewColumnDefault('');
      
      // Refresh table schema if viewing the modified table
      if (selectedTable === selectedTableForColumn) {
        await handleTableClick(selectedTableForColumn);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyColumn = async () => {
    if (!selectedTableForColumn || !columnToModify) {
      setError('Table name and column name are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/column-manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: selectedTableForColumn,
          columnName: columnToModify,
          newType: newColumnType,
          nullable: newColumnNullable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify column');
      }

      setSuccessMessage(data.message);
      setOpenModifyColumnDialog(false);
      setColumnToModify('');
      setNewColumnType('VARCHAR');
      setNewColumnNullable(true);
      
      // Refresh table schema if viewing the modified table
      if (selectedTable === selectedTableForColumn) {
        await handleTableClick(selectedTableForColumn);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDropColumn = async () => {
    if (!selectedTableForColumn || !columnToDelete) {
      setError('Table name and column name are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/column-manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: selectedTableForColumn,
          columnName: columnToDelete,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to drop column');
      }

      setSuccessMessage(data.message);
      setOpenDropColumnDialog(false);
      setColumnToDelete('');
      
      // Refresh table schema if viewing the modified table
      if (selectedTable === selectedTableForColumn) {
        await handleTableClick(selectedTableForColumn);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Constraint Management Handlers
  const handleAddConstraint = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/constraints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add constraint');
      }

      setSuccessMessage(result.message || 'Constraint added successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropConstraint = async (tableName: string, constraintName: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/constraints', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          constraintName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to drop constraint');
      }

      setSuccessMessage(result.message || 'Constraint dropped successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <StorageIcon sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Postgres Admin Panel
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            'width': DRAWER_WIDTH,
            'flexShrink': 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setTabValue(0)}>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Tables" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setTabValue(1)}>
                  <ListItemIcon>
                    <CodeIcon />
                  </ListItemIcon>
                  <ListItemText primary="SQL Query" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setTabValue(2)}>
                  <ListItemIcon>
                    <TableChartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Table Manager" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setTabValue(3)}>
                  <ListItemIcon>
                    <ViewColumnIcon />
                  </ListItemIcon>
                  <ListItemText primary="Column Manager" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setTabValue(4)}>
                  <ListItemIcon>
                    <RuleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Constraints" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Toolbar />

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom>
              Database Tables
            </Typography>

            <Paper sx={{ mt: 2, mb: 2 }}>
              <List>
                {tables.map(table => (
                  <ListItem key={table.table_name} disablePadding>
                    <ListItemButton onClick={() => handleTableClick(table.table_name)}>
                      <ListItemIcon>
                        <StorageIcon />
                      </ListItemIcon>
                      <ListItemText primary={table.table_name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {selectedTable && (
              <Typography variant="h6" gutterBottom>
                Table:
                {' '}
                {selectedTable}
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              SQL Query Interface
            </Typography>

            <Paper sx={{ p: 2, mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="SQL Query (SELECT only)"
                variant="outlined"
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
                placeholder="SELECT * FROM your_table LIMIT 10;"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleQuerySubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Execute Query'}
              </Button>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>
              Table Manager
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateTableDialog(true)}
                sx={{ mr: 2 }}
              >
                Create Table
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDropTableDialog(true)}
              >
                Drop Table
              </Button>
            </Box>

            <Paper sx={{ mt: 2 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Existing Tables
                </Typography>
                <List>
                  {tables.map(table => (
                    <ListItem key={table.table_name}>
                      <ListItemIcon>
                        <TableChartIcon />
                      </ListItemIcon>
                      <ListItemText primary={table.table_name} />
                    </ListItem>
                  ))}
                  {tables.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No tables found" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h5" gutterBottom>
              Column Manager
            </Typography>

            <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select a table to manage its columns:
              </Typography>
              <Select
                fullWidth
                value={selectedTableForColumn}
                onChange={e => setSelectedTableForColumn(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select a table</em>
                </MenuItem>
                {tables.map(table => (
                  <MenuItem key={table.table_name} value={table.table_name}>
                    {table.table_name}
                  </MenuItem>
                ))}
              </Select>
            </Paper>

            {selectedTableForColumn && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddColumnDialog(true)}
                    sx={{ mr: 2 }}
                  >
                    Add Column
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenModifyColumnDialog(true)}
                    sx={{ mr: 2 }}
                  >
                    Modify Column
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDropColumnDialog(true)}
                  >
                    Drop Column
                  </Button>
                </Box>

                {tableSchema && (
                  <Paper sx={{ mt: 2 }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Current Columns for {selectedTableForColumn}
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Column Name</strong></TableCell>
                              <TableCell><strong>Data Type</strong></TableCell>
                              <TableCell><strong>Nullable</strong></TableCell>
                              <TableCell><strong>Default</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tableSchema.columns?.map((col: any) => (
                              <TableRow key={col.column_name}>
                                <TableCell>{col.column_name}</TableCell>
                                <TableCell>{col.data_type}</TableCell>
                                <TableCell>{col.is_nullable}</TableCell>
                                <TableCell>{col.column_default || 'NULL'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Paper>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <ConstraintManagerTab
              tables={tables}
              onAddConstraint={handleAddConstraint}
              onDropConstraint={handleDropConstraint}
            />
          </TabPanel>

          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {queryResult && !loading && (
            <Paper sx={{ mt: 2, overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Rows returned:
                  {' '}
                  {queryResult.rowCount}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {queryResult.fields?.map((field: any) => (
                        <TableCell key={field.name}>
                          <strong>{field.name}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult.rows?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {queryResult.fields?.map((field: any) => (
                          <TableCell key={field.name}>
                            {row[field.name] !== null
                              ? String(row[field.name])
                              : 'NULL'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>

        {/* Create Table Dialog */}
        <Dialog open={openCreateTableDialog} onClose={() => setOpenCreateTableDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Table Name"
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <Typography variant="subtitle1" gutterBottom>
              Columns:
            </Typography>
            {tableColumns.map((col, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <TextField
                  label="Column Name"
                  value={col.name}
                  onChange={e => updateColumnField(index, 'name', e.target.value)}
                  sx={{ mr: 1, mb: 1 }}
                />
                <Select
                  value={col.type}
                  onChange={e => updateColumnField(index, 'type', e.target.value)}
                  sx={{ mr: 1, mb: 1, minWidth: 120 }}
                >
                  <MenuItem value="INTEGER">INTEGER</MenuItem>
                  <MenuItem value="BIGINT">BIGINT</MenuItem>
                  <MenuItem value="SERIAL">SERIAL</MenuItem>
                  <MenuItem value="VARCHAR">VARCHAR</MenuItem>
                  <MenuItem value="TEXT">TEXT</MenuItem>
                  <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                  <MenuItem value="TIMESTAMP">TIMESTAMP</MenuItem>
                  <MenuItem value="DATE">DATE</MenuItem>
                  <MenuItem value="JSON">JSON</MenuItem>
                  <MenuItem value="JSONB">JSONB</MenuItem>
                </Select>
                {(col.type === 'VARCHAR') && (
                  <TextField
                    label="Length"
                    type="number"
                    value={col.length || 255}
                    onChange={e => updateColumnField(index, 'length', e.target.value)}
                    sx={{ mr: 1, mb: 1, width: 100 }}
                  />
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.nullable}
                      onChange={e => updateColumnField(index, 'nullable', e.target.checked)}
                    />
                  }
                  label="Nullable"
                  sx={{ mr: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.primaryKey}
                      onChange={e => updateColumnField(index, 'primaryKey', e.target.checked)}
                    />
                  }
                  label="Primary Key"
                  sx={{ mr: 1 }}
                />
                {tableColumns.length > 1 && (
                  <IconButton onClick={() => removeColumn(index)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addColumnToTable} variant="outlined">
              Add Column
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateTableDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTable} variant="contained" disabled={loading}>
              Create Table
            </Button>
          </DialogActions>
        </Dialog>

        {/* Drop Table Dialog */}
        <Dialog open={openDropTableDialog} onClose={() => setOpenDropTableDialog(false)}>
          <DialogTitle>Drop Table</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="error" gutterBottom>
              Warning: This will permanently delete the table and all its data!
            </Typography>
            <Select
              fullWidth
              value={tableToDelete}
              onChange={e => setTableToDelete(e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="">
                <em>Select a table to drop</em>
              </MenuItem>
              {tables.map(table => (
                <MenuItem key={table.table_name} value={table.table_name}>
                  {table.table_name}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDropTableDialog(false)}>Cancel</Button>
            <Button onClick={handleDropTable} color="error" variant="contained" disabled={loading}>
              Drop Table
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Column Dialog */}
        <Dialog open={openAddColumnDialog} onClose={() => setOpenAddColumnDialog(false)}>
          <DialogTitle>Add Column to {selectedTableForColumn}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Column Name"
              value={newColumnName}
              onChange={e => setNewColumnName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <Select
              fullWidth
              value={newColumnType}
              onChange={e => setNewColumnType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="INTEGER">INTEGER</MenuItem>
              <MenuItem value="BIGINT">BIGINT</MenuItem>
              <MenuItem value="SERIAL">SERIAL</MenuItem>
              <MenuItem value="VARCHAR">VARCHAR(255)</MenuItem>
              <MenuItem value="TEXT">TEXT</MenuItem>
              <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
              <MenuItem value="TIMESTAMP">TIMESTAMP</MenuItem>
              <MenuItem value="DATE">DATE</MenuItem>
              <MenuItem value="JSON">JSON</MenuItem>
              <MenuItem value="JSONB">JSONB</MenuItem>
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newColumnNullable}
                  onChange={e => setNewColumnNullable(e.target.checked)}
                />
              }
              label="Nullable"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Default Value (optional)"
              value={newColumnDefault}
              onChange={e => setNewColumnDefault(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddColumnDialog(false)}>Cancel</Button>
            <Button onClick={handleAddColumn} variant="contained" disabled={loading}>
              Add Column
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modify Column Dialog */}
        <Dialog open={openModifyColumnDialog} onClose={() => setOpenModifyColumnDialog(false)}>
          <DialogTitle>Modify Column in {selectedTableForColumn}</DialogTitle>
          <DialogContent>
            <Select
              fullWidth
              value={columnToModify}
              onChange={e => setColumnToModify(e.target.value)}
              displayEmpty
              sx={{ mt: 2, mb: 2 }}
            >
              <MenuItem value="">
                <em>Select a column to modify</em>
              </MenuItem>
              {tableSchema?.columns?.map((col: any) => (
                <MenuItem key={col.column_name} value={col.column_name}>
                  {col.column_name}
                </MenuItem>
              ))}
            </Select>
            {columnToModify && (
              <>
                <Select
                  fullWidth
                  value={newColumnType}
                  onChange={e => setNewColumnType(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="INTEGER">INTEGER</MenuItem>
                  <MenuItem value="BIGINT">BIGINT</MenuItem>
                  <MenuItem value="VARCHAR">VARCHAR(255)</MenuItem>
                  <MenuItem value="TEXT">TEXT</MenuItem>
                  <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                  <MenuItem value="TIMESTAMP">TIMESTAMP</MenuItem>
                  <MenuItem value="DATE">DATE</MenuItem>
                  <MenuItem value="JSON">JSON</MenuItem>
                  <MenuItem value="JSONB">JSONB</MenuItem>
                </Select>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newColumnNullable}
                      onChange={e => setNewColumnNullable(e.target.checked)}
                    />
                  }
                  label="Nullable"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModifyColumnDialog(false)}>Cancel</Button>
            <Button onClick={handleModifyColumn} variant="contained" disabled={loading || !columnToModify}>
              Modify Column
            </Button>
          </DialogActions>
        </Dialog>

        {/* Drop Column Dialog */}
        <Dialog open={openDropColumnDialog} onClose={() => setOpenDropColumnDialog(false)}>
          <DialogTitle>Drop Column from {selectedTableForColumn}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="error" gutterBottom>
              Warning: This will permanently delete the column and all its data!
            </Typography>
            <Select
              fullWidth
              value={columnToDelete}
              onChange={e => setColumnToDelete(e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="">
                <em>Select a column to drop</em>
              </MenuItem>
              {tableSchema?.columns?.map((col: any) => (
                <MenuItem key={col.column_name} value={col.column_name}>
                  {col.column_name}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDropColumnDialog(false)}>Cancel</Button>
            <Button onClick={handleDropColumn} color="error" variant="contained" disabled={loading || !columnToDelete}>
              Drop Column
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
