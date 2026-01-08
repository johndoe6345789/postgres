'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';

type DataGridProps = {
  columns: Array<{ name: string; label?: string }>;
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  primaryKey?: string;
};

export default function DataGrid({ columns, rows, onEdit, onDelete, primaryKey = 'id' }: DataGridProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.name}>
                <strong>{col.label || col.name}</strong>
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row[primaryKey] || idx}>
              {columns.map(col => (
                <TableCell key={col.name}>
                  {row[col.name] !== null && row[col.name] !== undefined
                    ? String(row[col.name])
                    : 'NULL'}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  {onEdit && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
