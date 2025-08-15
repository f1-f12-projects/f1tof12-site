import { SxProps, Theme } from '@mui/material/styles';

export const tableStyles = {
  container: {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider'
  } as SxProps<Theme>,

  headerRow: {
    backgroundColor: 'action.selected'
  } as SxProps<Theme>,

  headerCell: {
    fontWeight: 600,
    py: 2
  } as SxProps<Theme>,

  bodyRow: (isLast: boolean) => ({
    '&:hover': { backgroundColor: 'action.hover' },
    borderBottom: isLast ? 'none' : '1px solid',
    borderColor: 'divider'
  } as SxProps<Theme>),

  bodyCell: {
    py: 3
  } as SxProps<Theme>,

  avatar: {
    bgcolor: 'primary.main',
    width: 40,
    height: 40
  } as SxProps<Theme>,

  statusChip: (status: string) => {
    const isActive = status === 'active';
    return {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: isActive ? 'success' : 'default',
      variant: isActive ? 'filled' : 'outlined',
      size: 'small'
    } as SxProps<Theme>;
  },

  actionButton: {
    color: 'primary.main',
    '&:hover': { backgroundColor: 'action.hover' }
  } as SxProps<Theme>,

  emptyState: {
    textAlign: 'center',
    py: 8
  } as SxProps<Theme>,

  emptyIcon: {
    fontSize: 64,
    color: 'text.disabled',
    mb: 2
  } as SxProps<Theme>
};