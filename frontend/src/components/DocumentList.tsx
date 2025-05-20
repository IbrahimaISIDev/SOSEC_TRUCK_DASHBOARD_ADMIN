import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Chip, Paper } from '@mui/material';

interface Document {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'expirationDate',
      headerName: 'Expiration Date',
      width: 150,
      sortComparator: (v1, v2) => new Date(v1).getTime() - new Date(v2).getTime(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ row }) => {
        const today = new Date();
        const expDate = new Date(row.expirationDate);
        const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const status = daysLeft <= 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid';
        const color = daysLeft <= 0 ? 'error' : daysLeft <= 30 ? 'warning' : 'success';
        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  return (
    <Paper sx={{ p: 2, borderRadius: '12px' }}>
      <DataGrid
        rows={documents}
        columns={columns}
        sortingOrder={['asc', 'desc']}
        pageSizeOptions={[5, 10]}
        sx={{ border: 'none', '& .MuiDataGrid-cell': { py: 1.5 } }}
      />
    </Paper>
  );
}