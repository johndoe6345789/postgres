'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type DropTableDialogProps = {
  open: boolean;
  tables: Array<{ table_name: string }>;
  onClose: () => void;
  onDrop: (tableName: string) => Promise<void>;
};

export default function DropTableDialog({
  open,
  tables,
  onClose,
  onDrop,
}: DropTableDialogProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      await onDrop(selectedTable);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTable('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Drop Table</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="error" gutterBottom>
          Warning: This will permanently delete the table and all its data!
        </Typography>
        <Select
          fullWidth
          value={selectedTable}
          onChange={e => setSelectedTable(e.target.value)}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDrop}
          color="error"
          variant="contained"
          disabled={loading || !selectedTable}
        >
          Drop Table
        </Button>
      </DialogActions>
    </Dialog>
  );
}
