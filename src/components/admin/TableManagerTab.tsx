'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { getDataTypes, getFeatureById } from '@/utils/featureConfig';
import CreateTableDialog from './CreateTableDialog';
import DropTableDialog from './DropTableDialog';

type TableManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onCreateTable: (tableName: string, columns: any[]) => Promise<void>;
  onDropTable: (tableName: string) => Promise<void>;
};

export default function TableManagerTab({
  tables,
  onCreateTable,
  onDropTable,
}: TableManagerTabProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDropDialog, setOpenDropDialog] = useState(false);

  // Get feature configuration from JSON
  const feature = getFeatureById('table-management');
  const dataTypes = getDataTypes().map(dt => dt.name);

  // Check if actions are enabled
  const canCreate = feature?.ui.actions.includes('create');
  const canDelete = feature?.ui.actions.includes('delete');

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Table Manager'}
      </Typography>

      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ mr: 2 }}
          >
            Create Table
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDropDialog(true)}
          >
            Drop Table
          </Button>
        )}
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

      <CreateTableDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={onCreateTable}
        dataTypes={dataTypes}
      />

      <DropTableDialog
        open={openDropDialog}
        tables={tables}
        onClose={() => setOpenDropDialog(false)}
        onDrop={onDropTable}
      />
    </>
  );
}
