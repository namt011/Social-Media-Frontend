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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import userService from '../../../services/userService';
import { format } from 'date-fns';

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

  useEffect(() => {
    fetchUsers();
  }, [page, size, search]);

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
      const data = await userService.getAllUsers(search, page, size);
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

  // Thêm customization cho TablePagination
  const customLabels = {
    labelRowsPerPage: 'Số hàng mỗi trang:',
    labelDisplayedRows: ({ from, to, count }) => 
      `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`,
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="h1">
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm người dùng
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Tìm kiếm người dùng"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
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
              }}>Số lượng report</TableCell>
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
                      transition: 'background-color 0.2s ease',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>{user.userID}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>{user.fullName}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>{user.email}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        backgroundColor: user.role === 'ADMIN' ? 'error.light' : 'info.light',
                        color: 'white',
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {user.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.banned || user.suspendedUntil ? (
                      <Typography 
                        sx={{
                          color: 'error.main',
                          backgroundColor: 'error.lighter',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        Bị cấm đến {format(new Date(user.suspendedUntil), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    ) : (
                      <Typography 
                        sx={{
                          color: 'success.main',
                          backgroundColor: 'success.lighter',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        Hoạt động
                      </Typography>
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

      <TablePagination
        component="div"
        count={totalUsers}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={size}
        onRowsPerPageChange={handleChangeRowsPerPage}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Tên người dùng"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Vai trò"
            fullWidth
            value={formData.role}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="status"
            label="Trạng thái"
            fullWidth
            value={formData.status}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết báo cáo người dùng</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loại</TableCell>
                <TableCell>Người gửi</TableCell>
                <TableCell>ID người gửi</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedUserReports.map((report) => (
                <TableRow key={report.id}>
                    <TableCell>{report.reportType}</TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell>{report.reporterId}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>
                    {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={openBanDialog} onClose={() => setOpenBanDialog(false)}>
        <DialogTitle>Cấm người dùng</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Chọn thời gian cấm cho user: {userToBan?.username}
          </Typography>
          <TextField
            type="datetime-local"
            fullWidth
            label="Thời gian cấm đến"
            value={banUntil || ''}
            onChange={(e) => setBanUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: format(new Date(), "yyyy-MM-dd'T'HH:mm"), // Không cho chọn thời gian trong quá khứ
            }}
            error={banUntil && new Date(banUntil) <= new Date()}
            helperText={banUntil && new Date(banUntil) <= new Date() ? 'Thời gian ban không thể trong quá khứ' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBanDialog(false)}>Hủy</Button>
          <Button 
            onClick={handleBanUser} 
            variant="contained" 
            color="error"
            disabled={!banUntil}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent>
          {userDetail && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">ID</Typography>
                  <Typography>{userDetail.userId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Họ và tên</Typography>
                  <Typography>{`${userDetail.firstName} ${userDetail.lastName}`}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{userDetail.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Vai trò</Typography>
                  <Typography>{userDetail.role}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Trạng thái</Typography>
                  <Typography color={userDetail.isBanned ? "error" : "success.main"}>
                    {userDetail.isBanned ? 
                      `Bị cấm đến ${format(new Date(userDetail.suspendedUntil), 'dd/MM/yyyy HH:mm')}` : 
                      'Đang hoạt động'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Ngày tạo tài khoản</Typography>
                  <Typography>
                    {format(new Date(userDetail.createdAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Số lượng báo cáo</Typography>
                  <Typography>{userDetail.reportCount || 0}</Typography>
                </Grid>
                {userDetail.isBanned && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Lý do cấm</Typography>
                      <Typography color="error">{userDetail.banReason || 'Không có'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Người cấm</Typography>
                      <Typography>{userDetail.bannedBy || 'Admin'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
              
              {/* Thêm thống kê hoạt động nếu có */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Thống kê hoạt động</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2">Số bài viết</Typography>
                      <Typography variant="h6">{userDetail.postCount || 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2">Số bình luận</Typography>
                      <Typography variant="h6">{userDetail.commentCount || 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2">Số lượt thích</Typography>
                      <Typography variant="h6">{userDetail.likeCount || 0}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;