import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Flag as FlagIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ReportService, { REPORT_TYPES, REPORT_STATUS } from '../../../service/ReportService';
import { format } from 'date-fns';

const customLabels = {
  labelRowsPerPage: 'Số hàng mỗi trang:',
  labelDisplayedRows: ({ from, to, count }) => 
    `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`,
};

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

// Thêm hàm getReportTypeColor để xác định màu cho từng loại report
const getReportTypeColor = (reportType) => {
  switch (reportType) {
    case REPORT_TYPES.USER:
      return {
        bg: '#e3f2fd', // light blue
        color: '#1976d2' // dark blue
      };
    case REPORT_TYPES.GROUP:
      return {
        bg: '#e8f5e9', // light green
        color: '#2e7d32' // dark green
      };
    case REPORT_TYPES.POST:
      return {
        bg: '#fff3e0', // light orange
        color: '#ed6c02' // dark orange
      };
    case REPORT_TYPES.COMMENT:
      return {
        bg: '#f3e5f5', // light purple
        color: '#9c27b0' // dark purple
      };
    default:
      return {
        bg: 'primary.light',
        color: 'primary.dark'
      };
  }
};

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    userId: ''  // Thêm userId vào filters
  });

  const fetchReports = async () => {
    try {
      const response = await ReportService.getAllReports({
        page: pagination.page,
        size: pagination.size,
        sort: 'createdAt,desc',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.userId && { userId: filters.userId }) // Thêm userId vào params
      });

      setReports(response.data.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.size, filters.status, filters.type, filters.userId]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 0
    }));
  };

  const handleOpenDialog = (report = null) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await ReportService.resolveReport(reportId, action);
      fetchReports();
      handleCloseDialog();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const getActionButtons = (report) => {
    if (report?.status !== 'PENDING') return null;

    switch (report.reportType) {
      case REPORT_TYPES.USER:
      case REPORT_TYPES.GROUP:
        return (
          <>
            <Button 
              onClick={() => handleResolveReport(report.id, 'BAN')}
              variant="contained" 
              color="error"
              sx={{ mr: 1 }}
            >
              Cấm vĩnh viễn
            </Button>
            <Button 
              onClick={() => handleResolveReport(report.id, 'SUSPEND')}
              variant="contained" 
              color="warning"
              sx={{ mr: 1 }}
            >
              Đình chỉ tạm thời
            </Button>
            <Button 
              onClick={() => handleResolveReport(report.id, 'WARN')}
              variant="contained" 
              color="info"
              sx={{ mr: 1 }}
            >
              Cảnh cáo
            </Button>
          </>
        );
      case REPORT_TYPES.POST:
      case REPORT_TYPES.COMMENT:
        return (
          <Button 
            onClick={() => handleResolveReport(report.id, 'DELETE')}
            variant="contained" 
            color="error"
            sx={{ mr: 1 }}
          >
            Xóa
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" component="h1" sx={{ mb: 3 }}>
        Quản lý báo cáo
      </Typography>

      {/* Filter Section */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: 'primary.main',
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <FilterListIcon /> Bộ lọc tìm kiếm
        </Typography>

        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            '& .MuiFormControl-root': {
              flex: '1 1 250px',
              maxWidth: '100%',
            }
          }}
        >
          <TextField
            label="ID người dùng"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            type="number"
            InputProps={{
              inputProps: { min: 1 },
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
          />
          
          <FormControl>
            <InputLabel>Loại báo cáo</InputLabel>
            <Select
              name="type"
              value={filters.type}
              label="Loại báo cáo"
              onChange={handleFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Tất cả loại</em>
              </MenuItem>
              {Object.entries(REPORT_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getReportTypeColor(value).color,
                      display: 'inline-block',
                      marginRight: 1
                    }}
                  />
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label="Trạng thái"
              onChange={handleFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <FlagIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Tất cả trạng thái</em>
              </MenuItem>
              {Object.entries(REPORT_STATUS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 
                        value === 'PENDING' ? '#ed6c02' : 
                        value === 'RESOLVED' ? '#2e7d32' : '#d32f2f',
                      display: 'inline-block',
                      marginRight: 1
                    }}
                  />
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setFilters({
                type: '',
                status: '',
                userId: ''
              });
            }}
            startIcon={<ClearIcon />}
            sx={{ 
              minWidth: '120px',
              alignSelf: 'flex-start',
              mt: 0.5
            }}
          >
            Xóa lọc
          </Button>
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>ID</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Người báo cáo</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Loại báo cáo</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Lý do</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Đối tượng</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Trạng thái</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Ngày tạo</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover',
                  },
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell sx={{ fontWeight: 'medium' }}>{report.id}</TableCell>
                <TableCell>{report.reporterName}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: getReportTypeColor(report.reportType).bg,
                      color: getReportTypeColor(report.reportType).color,
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      border: `1px solid ${getReportTypeColor(report.reportType).color}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {report.reportType}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  maxWidth: 200,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {report.reason}
                </TableCell>
                <TableCell>{report.targetPreview}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: report.status === 'PENDING' ? '#fff3e0' : 
                                      report.status === 'RESOLVED' ? '#e8f5e9' : '#ffebee',
                      color: report.status === 'PENDING' ? '#ed6c02' : 
                             report.status === 'RESOLVED' ? '#2e7d32' : '#d32f2f',
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      border: `1px solid ${
                        report.status === 'PENDING' ? '#ed6c02' : 
                        report.status === 'RESOLVED' ? '#2e7d32' : '#d32f2f'
                      }`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {report.status}
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenDialog(report)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <TablePagination
          component="div"
          count={pagination.totalElements || 0}
          page={pagination.page}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.size}
          onRowsPerPageChange={(event) => {
            setPagination(prev => ({
              ...prev,
              size: parseInt(event.target.value, 10),
              page: 0
            }));
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={customLabels.labelRowsPerPage}
          labelDisplayedRows={customLabels.labelDisplayedRows}
          showFirstButton
          showLastButton
          ActionsComponent={TablePaginationActions}
          sx={{
            '.MuiTablePagination-toolbar': {
              alignItems: 'center',
              '& .MuiTablePagination-selectLabel': {
                marginBottom: 0,
              },
              '& .MuiTablePagination-displayedRows': {
                marginBottom: 0,
              },
            },
            '.MuiTablePagination-selectIcon': {
              width: 24,
              height: 24,
            },
            '.MuiTablePagination-select': {
              paddingY: 1,
            },
            '.MuiTablePagination-actions': {
              marginLeft: 2,
              '& .MuiIconButton-root': {
                padding: 1,
              },
            },
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết báo cáo</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Người báo cáo"
            fullWidth
            value={selectedReport?.reporterName || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            margin="dense"
            label="Loại báo cáo"
            fullWidth
            value={selectedReport?.reportType || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            margin="dense"
            label="Lý do"
            fullWidth
            multiline
            rows={4}
            value={selectedReport?.reason || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            margin="dense"
            label="Đối tượng bị báo cáo"
            fullWidth
            value={selectedReport?.targetPreview || ''}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          {getActionButtons(selectedReport)}
          <Button 
            onClick={() => handleResolveReport(selectedReport?.id, 'REJECT')}
            variant="contained" 
            color="secondary"
          >
            Bỏ qua báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportManagement;