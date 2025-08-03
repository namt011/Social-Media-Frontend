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
  Chip,
  Alert,
  Snackbar,
  Popover,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Lock as LockIcon, 
  LockOpen as LockOpenIcon, 
  ArrowUpward, 
  ArrowDownward, 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  Sort as SortIcon, 
  People as PeopleIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Clear as ClearIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import groupService from '../../../services/groupService';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Component cho phân trang
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

// Nhãn tùy chỉnh cho phân trang
const customLabels = {
  labelRowsPerPage: 'Số hàng mỗi trang:',
  labelDisplayedRows: ({ from, to, count }) => 
    `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`,
};

// Hàm lấy màu cho trạng thái nhóm
const getGroupStatusColor = (isBanned) => {
  return isBanned ? {
    bg: '#ffebee', // light red
    color: '#d32f2f' // dark red
  } : {
    bg: '#e8f5e9', // light green
    color: '#2e7d32' // dark green
  };
};

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    memberCount: 0,
    reportCount: 0,
    isBanned: null,
    createdAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchGroupId, setSearchGroupId] = useState('');
  const [sortConfig, setSortConfig] = useState([
    { field: 'createdAt', direction: 'desc' }
  ]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [membersDialog, setMembersDialog] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);
  // Thêm state pagination
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0
  });

  const debouncedSearchGroupId = useDebounce(searchGroupId, 500);

  const handleSortChange = (field) => {
    setSortConfig(current => {
      const existingSort = current[0];
      
      if (existingSort && existingSort.field === field) {
        // Toggle direction if it's the same field
        if (existingSort.direction === 'asc') {
          return []; // Remove sort
        }
        return [{ field, direction: 'asc' }];
      }
      
      // Set new sort
      return [{ field, direction: 'desc' }];
    });
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Lấy thông tin sort đầu tiên vì API chỉ hỗ trợ sort 1 trường
      const currentSort = sortConfig[0] || { field: 'createdAt', direction: 'desc' };
      
      const response = await groupService.getAllGroups({
        page,
        size: rowsPerPage,
        sort: currentSort.field,
        direction: currentSort.direction,
        groupId: debouncedSearchGroupId ? parseInt(debouncedSearchGroupId) : null
      });
      
      setGroups(response.content);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError('Failed to fetch groups');
      showSnackbar('Failed to fetch groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      setLoading(true);
      const response = await groupService.getGroupMembers(groupId);
      setGroupMembers(response.content);
      setPagination({
        pageNumber: response.pageable.pageNumber,
        pageSize: response.pageable.pageSize,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
    } catch (err) {
      showSnackbar('Failed to fetch group members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMembersDialog = (group) => {
    setSelectedGroupForMembers(group);
    setMembersDialog(true);
    fetchGroupMembers(group.groupID);
  };

  useEffect(() => {
    fetchGroups();
  }, [page, rowsPerPage, debouncedSearchGroupId, sortConfig]);

  const handleOpenDialog = (group = null) => {
    if (group) {
      setSelectedGroup(group);
      setFormData({
        name: group.name,
        ownerName: group.ownerName,
        memberCount: group.memberCount,
        reportCount: group.reportCount,
        isBanned: group.isBanned,
        createdAt: group.createdAt
      });
    } else {
      setSelectedGroup(null);
      setFormData({
        name: '',
        ownerName: '',
        memberCount: 0,
        reportCount: 0,
        isBanned: false,
        createdAt: new Date().toISOString()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGroup(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBanGroup = async (groupId) => {
    try {
      await groupService.banGroup(groupId);
      showSnackbar('Nhóm đã bị cấm thành công', 'success');
      fetchGroups();
    } catch (err) {
      showSnackbar('Không thể cấm nhóm', 'error');
    }
  };

  const handleUnbanGroup = async (groupId) => {
    try {
      await groupService.unbanGroup(groupId);
      showSnackbar('Đã bỏ cấm nhóm thành công', 'success');
      fetchGroups();
    } catch (err) {
      showSnackbar('Không thể bỏ cấm nhóm', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedGroup) {
        // Update functionality would go here if API supports it
      } else {
        await groupService.createGroup(formData);
        showSnackbar('Tạo nhóm thành công', 'success');
      }
      handleCloseDialog();
      fetchGroups();
    } catch (err) {
      showSnackbar('Không thể lưu nhóm', 'error');
    }
  };

  const handleDelete = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" component="h1" sx={{ mb: 3 }}>
        Quản lý nhóm
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
            label="ID nhóm"
            name="groupId"
            value={searchGroupId}
            onChange={(e) => setSearchGroupId(e.target.value)}
            type="number"
            InputProps={{
              inputProps: { min: 1 },
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
          />
          
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSearchGroupId('');
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

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              minWidth: '150px',
              alignSelf: 'flex-start',
              mt: 0.5,
              ml: 'auto'
            }}
          >
            Tạo nhóm mới
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
              }}>Tên nhóm</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Chủ nhóm</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Số thành viên</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Số báo cáo</TableCell>
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
            {groups.map((group) => (
              <TableRow 
                key={group.groupID}
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
                <TableCell sx={{ fontWeight: 'medium' }}>{group.groupID}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{group.name}</TableCell>
                <TableCell>{group.ownerName}</TableCell>
                <TableCell>{group.memberCount}</TableCell>
                <TableCell>{group.reportCount}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: getGroupStatusColor(group.isBanned).bg,
                      color: getGroupStatusColor(group.isBanned).color,
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      border: `1px solid ${getGroupStatusColor(group.isBanned).color}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {group.isBanned ? 'Banned' : 'Active'}
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(group.createdAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton 
                      onClick={() => handleOpenDialog(group)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenMembersDialog(group)} 
                      color="primary"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light'
                        }
                      }}
                    >
                      <PeopleIcon />
                    </IconButton>
                    {group.isBanned ? (
                      <IconButton 
                        onClick={() => handleUnbanGroup(group.groupID)} 
                        color="success"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'success.light'
                          }
                        }}
                      >
                        <LockOpenIcon />
                      </IconButton>
                    ) : (
                      <IconButton 
                        onClick={() => handleBanGroup(group.groupID)} 
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light'
                          }
                        }}
                      >
                        <LockIcon />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <TablePagination
          component="div"
          count={totalElements || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
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
        <DialogTitle>
          {selectedGroup ? 'Chỉnh sửa nhóm' : 'Tạo nhóm mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Tên nhóm"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="ownerName"
            label="Chủ nhóm"
            fullWidth
            value={formData.ownerName}
            disabled
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="isBanned"
              value={formData.isBanned}
              onChange={handleInputChange}
              label="Trạng thái"
            >
              <MenuItem value={false}>Hoạt động</MenuItem>
              <MenuItem value={true}>Banned</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedGroup ? 'Cập nhật' : 'Tạo nhóm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={membersDialog} 
        onClose={() => setMembersDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Danh sách thành viên - {selectedGroupForMembers?.name}
        </DialogTitle>
        <DialogContent>
          <TableContainer 
            sx={{
              boxShadow: 1,
              borderRadius: 1,
              overflow: 'hidden',
              mt: 2
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên thành viên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày tham gia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupMembers.map((member) => (
                  <TableRow 
                    key={member.userId}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'action.hover',
                      },
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      }
                    }}
                  >
                    <TableCell>{member.userId}</TableCell>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          backgroundColor: member.role === 'ADMIN' ? '#e3f2fd' : '#f5f5f5',
                          color: member.role === 'ADMIN' ? '#1976d2' : '#757575',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontWeight: 'medium',
                          fontSize: '0.875rem',
                          border: `1px solid ${member.role === 'ADMIN' ? '#1976d2' : '#bdbdbd'}`,
                        }}
                      >
                        {member.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.joinedAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tổng số: {pagination.totalElements} thành viên
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupManagement;