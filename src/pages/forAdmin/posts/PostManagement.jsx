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
  TablePagination,
  InputAdornment,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { postService } from '../../../services/postService';

// Component cho các nút phân trang
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

const customLabels = {
  labelRowsPerPage: 'Số bài viết mỗi trang:',
  labelDisplayedRows: ({ from, to, count }) => 
    `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`,
};

// Hàm để xác định màu cho từng loại trạng thái bài viết
const getPrivacyStatusColor = (privacy) => {
  switch (privacy) {
    case 'public':
      return {
        bg: '#e3f2fd', // light blue
        color: '#1976d2' // dark blue
      };
    case 'friends':
      return {
        bg: '#e8f5e9', // light green
        color: '#2e7d32' // dark green
      };
    case 'private':
      return {
        bg: '#f3e5f5', // light purple
        color: '#9c27b0' // dark purple
      };
    case 'deleted':
      return {
        bg: '#ffebee', // light red
        color: '#d32f2f' // dark red
      };
    default:
      return {
        bg: '#f5f5f5', // light grey
        color: '#757575' // dark grey
      };
  }
};

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchParams, setSearchParams] = useState({
    postId: '',
    userId: '',
    size: 5,
    sort: 'postCreateAt'
  });
  
  const pageSizeOptions = [5, 10, 20, 50, 100];
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    privacy: '',
    createdAt: ''
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts({
        ...searchParams,
        page
      });
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements || response.content.length * response.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, searchParams]);

  const handleOpenDialog = (post = null) => {
    if (post) {
      setSelectedPost(post);
      setFormData({
        content: post.content,
        privacy: post.privacy,
        createdAt: post.createdAt
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPost(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStatus = () => {
    setPosts(posts.map(post => 
      post.postId === selectedPost.postId ? { ...post, privacy: formData.privacy } : post
    ));
    handleCloseDialog();
  };

  const handleDelete = async (postId) => {
    try {
      await postService.deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleRestore = async (postId) => {
    try {
      await postService.restorePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error restoring post:', error);
    }
  };

  const handleSearch = (event) => {
    const { name, value } = event.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" component="h1" sx={{ mb: 3 }}>
        Quản lý bài viết
      </Typography>

      {/* Search filters */}
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
            name="postId"
            label="ID bài viết"
            value={searchParams.postId}
            onChange={handleSearch}
            type="number"
            InputProps={{
              inputProps: { min: 1 },
              startAdornment: (
                <InputAdornment position="start">
                  <ArticleIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
          />
          <TextField
            name="userId"
            label="ID người dùng"
            value={searchParams.userId}
            onChange={handleSearch}
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
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSearchParams(prev => ({
                ...prev,
                postId: '',
                userId: ''
              }));
              setPage(0);
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
              }}>ID bài viết</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>ID người dùng</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Tên người dùng</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Nội dung</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Trạng thái</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Lượt thích</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Bình luận</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>Báo cáo</TableCell>
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
            {posts.map((post) => (
              <TableRow 
                key={post.postId}
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
                <TableCell sx={{ fontWeight: 'medium' }}>{post.postId}</TableCell>
                <TableCell>{post.userId}</TableCell>
                <TableCell>{post.userFullName}</TableCell>
                <TableCell sx={{ 
                  maxWidth: 200,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {post.content}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: getPrivacyStatusColor(post.privacy).bg,
                      color: getPrivacyStatusColor(post.privacy).color,
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      border: `1px solid ${getPrivacyStatusColor(post.privacy).color}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {post.privacy === 'public' ? 'Công khai' :
                     post.privacy === 'friends' ? 'Bạn bè' :
                     post.privacy === 'private' ? 'Riêng tư' :
                     post.privacy === 'deleted' ? 'Đã xóa' : post.privacy}
                  </Box>
                </TableCell>
                <TableCell>{post.reactCount}</TableCell>
                <TableCell>{post.commentCount}</TableCell>
                <TableCell>{post.reportCount}</TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenDialog(post)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                  {post.privacy !== 'deleted' ? (
                    <IconButton 
                      onClick={() => handleDelete(post.postId)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.light'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleRestore(post.postId)}
                      sx={{
                        ml: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      Khôi phục
                    </Button>
                  )}
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
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={searchParams.size}
          onRowsPerPageChange={(event) => {
            setSearchParams(prev => ({
              ...prev,
              size: parseInt(event.target.value, 10)
            }));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
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

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          py: 2
        }}>
          Chi tiết bài viết
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            margin="dense"
            name="userFullName"
            label="Tên người dùng"
            fullWidth
            value={selectedPost?.userFullName || ''}
            InputProps={{ 
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <TextField
            margin="dense"
            name="content"
            label="Nội dung"
            fullWidth
            multiline
            rows={4}
            value={formData.content}
            InputProps={{ readOnly: true }}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              margin="dense"
              name="reactCount"
              label="Lượt thích"
              value={selectedPost?.reactCount || 0}
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              margin="dense"
              name="commentCount"
              label="Bình luận"
              value={selectedPost?.commentCount || 0}
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              margin="dense"
              name="reportCount"
              label="Báo cáo"
              value={selectedPost?.reportCount || 0}
              InputProps={{ readOnly: true }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
          </Box>
          <TextField
            margin="dense"
            name="createdAt"
            label="Ngày tạo"
            fullWidth
            value={formData.createdAt ? formatDate(formData.createdAt) : ''}
            InputProps={{ readOnly: true }}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="privacy"
              value={formData.privacy}
              onChange={handleInputChange}
              label="Trạng thái"
            >
              <MenuItem value="public">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getPrivacyStatusColor('public').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Công khai
              </MenuItem>
              <MenuItem value="friends">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getPrivacyStatusColor('friends').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Bạn bè
              </MenuItem>
              <MenuItem value="private">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getPrivacyStatusColor('private').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Riêng tư
              </MenuItem>
              <MenuItem value="deleted">
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getPrivacyStatusColor('deleted').color,
                    display: 'inline-block',
                    marginRight: 1
                  }}
                />
                Đã xóa
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Đóng
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Cập nhật trạng thái
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostManagement;