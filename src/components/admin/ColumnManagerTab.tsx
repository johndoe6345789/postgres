'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getDataTypes, getFeatureById } from '@/utils/featureConfig';
import ColumnDialog from './ColumnDialog';

type ColumnManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onAddColumn: (tableName: string, data: any) => Promise<void>;
  onModifyColumn: (tableName: string, data: any) => Promise<void>;
  onDropColumn: (tableName: string, data: any) => Promise<void>;
};

export default function ColumnManagerTab({
  tables,
  onAddColumn,
  onModifyColumn,
  onDropColumn,
}: ColumnManagerTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'add' | 'modify' | 'drop';
  }>({ open: false, mode: 'add' });

  // Get feature configuration from JSON
  const feature = getFeatureById('column-management');
  const dataTypes = getDataTypes().map(dt => dt.name);

  // Check if actions are enabled from config
  const canAdd = feature?.ui.actions.includes('add');
  const canModify = feature?.ui.actions.includes('modify');
  const canDelete = feature?.ui.actions.includes('delete');

  // Fetch schema when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema();
    } else {
      setTableSchema(null);
    }
  }, [selectedTable]);

  const fetchTableSchema = async () => {
    try {
      const response = await fetch('/api/admin/table-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: selectedTable }),
      });

      if (response.ok) {
        const data = await response.json();
        setTableSchema(data);
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    }
  };

  const handleColumnOperation = async (data: any) => {
    switch (dialogState.mode) {
      case 'add':
        await onAddColumn(selectedTable, data);
        break;
      case 'modify':
        await onModifyColumn(selectedTable, data);
        break;
      case 'drop':
        await onDropColumn(selectedTable, data);
        break;
    }
    await fetchTableSchema(); // Refresh schema
  };

  const openDialog = (mode: 'add' | 'modify' | 'drop') => {
    setDialogState({ open: true, mode });
  };

  const closeDialog = () => {
    setDialogState({ ...dialogState, open: false });
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Column Manager'}
      </Typography>

      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select a table to manage its columns:
        </Typography>
        <Select
          fullWidth
          value={selectedTable}
          onChange={e => setSelectedTable(e.target.value)}
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

      {selectedTable && (
        <>
          <Box sx={{ mb: 2 }}>
            {canAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('add')}
                sx={{ mr: 2 }}
              >
                Add Column
              </Button>
            )}
            {canModify && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => openDialog('modify')}
                sx={{ mr: 2 }}
              >
                Modify Column
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => openDialog('drop')}
              >
                Drop Column
              </Button>
            )}
          </Box>

          {tableSchema && (
            <Paper sx={{ mt: 2 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Current Columns for {selectedTable}
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

      <ColumnDialog
        open={dialogState.open}
        mode={dialogState.mode}
        tableName={selectedTable}
        columns={tableSchema?.columns || []}
        onClose={closeDialog}
        onSubmit={handleColumnOperation}
        dataTypes={dataTypes}
      />
    </>
  );
}
