import * as React from 'react';
import { useState, useEffect } from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Tooltip,
  Badge,
  TablePagination,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Report as ReportIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Visibility as ViewIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import userService from '../../../services/userService';
import { format } from 'date-fns';

// Thêm custom labels cho phân trang
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

// Hàm để xác định màu cho từng vai trò người dùng
const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return {
        bg: '#ffebee', // light red
        color: '#d32f2f' // dark red
      };
    case 'MODERATOR':
      return {
        bg: '#e8f5e9', // light green
        color: '#2e7d32' // dark green
      };
    case 'USER':
      return {
        bg: '#e3f2fd', // light blue
        color: '#1976d2' // dark blue
      };
    default:
      return {
        bg: '#f3e5f5', // light purple
        color: '#9c27b0' // dark purple
      };
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userReports, setUserReports] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserReports, setSelectedUserReports] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: ''
  });
  const [openBanDialog, setOpenBanDialog] = useState(false);
  const [banUntil, setBanUntil] = useState(null);
  const [userToBan, setUserToBan] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, size, search, filters]);

  useEffect(() => {
    // Kiểm tra mỗi phút
    const interval = setInterval(() => {
      const now = new Date();
      users.forEach(user => {
        if (user.banned && user.suspendedUntil && new Date(user.suspendedUntil) <= now) {
          handleUnbanUser(user.userID);
        }
      });
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers(
        search, 
        page, 
        size, 
        filters.role, 
        filters.status
      );
      setUsers(data.data.map(user => ({
        userID: user.userId,
        username: user.username,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        banned: user.isBanned,
        suspendedUntil: user.suspendedUntil,
        reportCount: user.reportCount || 0,
        createdAt: user.createdAt
      })));
      setTotalUsers(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      const data = await userService.getUserReports(userId);
      setSelectedUserReports(data.reports);
      setOpenReportDialog(true);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const handleOpenDetailDialog = async (userId) => {
    try {
      const data = await userService.getUserDetails(userId);
      setUserDetail(data);
      setOpenDetailDialog(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData(user);
    } else {
      setSelectedUser(null);
      setFormData({ username: '', email: '', role: '', status: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      ));
    } else {
      setUsers([...users, { ...formData, id: users.length + 1 }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleOpenBanDialog = (user) => {
    setUserToBan(user);
    setOpenBanDialog(true);
  };

  const handleBanUser = async () => {
    try {
      if (!userToBan || !banUntil) return;
      
      // Kiểm tra nếu thời gian ban trong quá khứ
      if (new Date(banUntil) <= new Date()) {
        alert('Thời gian ban không thể trong quá khứ');
        return;
      }

      await userService.banUser(userToBan.userID, banUntil);
      // Cập nhật state users trực tiếp
      setUsers(users.map(user => 
        user.userID === userToBan.userID 
          ? { ...user, banned: true, suspendedUntil: banUntil }
          : user
      ));
      
      setOpenBanDialog(false);
      setBanUntil(null);
      setUserToBan(null);
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Có lỗi xảy ra khi cấm người dùng');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unbanUser(userId);
      // Cập nhật state users trực tiếp thay vì gọi lại API
      setUsers(users.map(user => 
        user.userID === userId 
          ? { ...user, banned: false, suspendedUntil: null }
          : user
      ));
      console.log('Unban user successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" component="h1" sx={{ mb: 3 }}>
        Quản lý người dùng
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
            label="Tìm kiếm người dùng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
          />
          
          <FormControl>
            <InputLabel>Vai trò</InputLabel>
            <Select
              name="role"
              value={filters.role}
              label="Vai trò"
              onChange={handleFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Tất cả vai trò</em>
              </MenuItem>
              <MenuItem value="ADMIN">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getRoleColor('ADMIN').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Admin
              </MenuItem>
              <MenuItem value="MODERATOR">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getRoleColor('MODERATOR').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Moderator
              </MenuItem>
              <MenuItem value="USER">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getRoleColor('USER').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                User
              </MenuItem>
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
                  <CategoryIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Tất cả trạng thái</em>
              </MenuItem>
              <MenuItem value="ACTIVE">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#2e7d32',
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Hoạt động
              </MenuItem>
              <MenuItem value="BANNED">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#d32f2f',
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Bị cấm
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setFilters({
                role: '',
                status: '',
              });
              setSearch('');
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
              minWidth: '180px',
              alignSelf: 'flex-start',
              mt: 0.5
            }}
          >
            Thêm người dùng
          </Button>
        </Box>
      </Box>

      {/* Table Section */}
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
              }}>Tên người dùng</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Email</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Vai trò</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Trạng thái</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Báo cáo</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.userID}
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
                  <TableCell sx={{ fontWeight: 'medium' }}>{user.userID}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>{user.fullName}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>{user.email}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: getRoleColor(user.role).bg,
                        color: getRoleColor(user.role).color,
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 1,
                        display: 'inline-block',
                        fontWeight: 'medium',
                        fontSize: '0.875rem',
                        border: `1px solid ${getRoleColor(user.role).color}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {user.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.banned || user.suspendedUntil ? (
                      <Box
                        sx={{
                          backgroundColor: '#ffebee',
                          color: '#d32f2f',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontWeight: 'medium',
                          fontSize: '0.875rem',
                          border: '1px solid #d32f2f',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        Bị cấm đến {format(new Date(user.suspendedUntil), 'dd/MM/yyyy HH:mm')}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontWeight: 'medium',
                          fontSize: '0.875rem',
                          border: '1px solid #2e7d32',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        Hoạt động
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết báo cáo">
                      <IconButton 
                        onClick={() => fetchUserReports(user.userID)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Badge 
                          badgeContent={user.reportCount} 
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.8rem',
                              height: '20px',
                              minWidth: '20px',
                            },
                          }}
                        >
                          <ReportIcon color="action" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          onClick={() => handleOpenDetailDialog(user.userID)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.lighter' },
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        onClick={() => handleOpenDialog(user)}
                        sx={{ 
                          color: 'warning.main',
                          '&:hover': { backgroundColor: 'warning.lighter' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {user.banned || user.suspendedUntil ? (
                        <Button
                          size="small"
                          onClick={() => handleUnbanUser(user.userID)}
                          variant="contained"
                          color="success"
                          sx={{
                            minWidth: '80px',
                            textTransform: 'none',
                            boxShadow: 1,
                          }}
                        >
                          Bỏ cấm
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => handleOpenBanDialog(user)}
                          variant="contained"
                          color="error"
                          sx={{
                            minWidth: '80px',
                            textTransform: 'none',
                            boxShadow: 1,
                          }}
                        >
                          Cấm
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>