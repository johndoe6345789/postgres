'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import { theme } from '@/utils/theme';

const DRAWER_WIDTH = 240;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
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
  };

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    setError('');
    setQueryResult(null);

    try {
      const response = await fetch('/api/admin/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `SELECT * FROM ${tableName} LIMIT 100`,
        }),
      });

      if (!response.ok) {
        throw new Error('Query failed');
      }

      const data = await response.json();
      setQueryResult(data);
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
            width: DRAWER_WIDTH,
            flexShrink: 0,
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
                Table: {selectedTable}
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
                  Rows returned: {queryResult.rowCount}
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
      </Box>
    </ThemeProvider>
  );
}
