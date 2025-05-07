'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';

interface VoteOption {
  id: string;
  text: string;
  imageUrl?: string;
  votes: number;
  percentage: number;
}

interface VoteDetail {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  totalVotes: number;
  isExpertVote: boolean;
  hasVoted: boolean;
  selectedOption?: string;
  banner?: string;
  creator: string;
}

interface User {
  _id: string;
  role: 'user' | 'expert' | 'admin' | 'superAdmin';
}

export default function VoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 获取投票详情
  const { data, isLoading, error } = useQuery({
    queryKey: ['vote', id],
    queryFn: async () => {
      const response = await axios.get(`/polls/${id}`);
      return response.data;
    },
  });

  // 使用相对路径显示图片
  const bannerUrl = data?.banner ? data.banner : null;
  console.log('Banner URL:', bannerUrl);

  // 提交投票
  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const response = await axios.post(`/polls/${id}/vote`, {
        selectedOptions: [optionId],
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote', id] });
      setSnackbarMessage('投票成功！');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message;
      if (errorMessage === '您已经投过票了') {
        setSnackbarMessage('您已经投过一票了');
      } else if (errorMessage === '投票未开始或已结束') {
        setSnackbarMessage('当前投票未开始或已结束');
      } else {
        setSnackbarMessage(errorMessage || '投票失败，请重试');
      }
      setSnackbarOpen(true);
    },
  });

  const handleVoteSubmit = async () => {
    if (!selectedOption) {
      return;
    }
    try {
      await voteMutation.mutateAsync(selectedOption);
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  const handleEditClick = () => {
    console.log('编辑按钮被点击，id:', id);
    router.push(`/votes/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/polls/${id}`);
      router.push('/votes');
    } catch (error) {
      console.error('删除投票失败:', error);
      alert('删除投票失败');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleClose = async () => {
    try {
      setIsClosing(true);
      await axios.post(`/polls/${id}/close`);
      // 刷新投票数据
      await queryClient.invalidateQueries({ queryKey: ['vote', id] });
      setSnackbarMessage('投票已成功关闭');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('关闭投票失败:', error);
      setSnackbarMessage('关闭投票失败');
      setSnackbarOpen(true);
    } finally {
      setIsClosing(false);
      setCloseDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">加载投票详情失败</Alert>
      </Box>
    );
  }

  const isVotingDisabled = data.status !== 'active' || data.hasVoted;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* 返回按钮 */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/votes')}
          sx={{ mb: 2 }}
        >
          返回投票列表
        </Button>

        {bannerUrl && (
          <Box
            sx={{
              width: '100%',
              height: 200,
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 2,
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }}
          >
            <img
              src={bannerUrl}
              alt={`${data.title} banner`}
              onError={(e) => {
                console.error('图片加载失败:', bannerUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('图片加载成功:', bannerUrl)}
            />
          </Box>
        )}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {data.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={data.status === 'upcoming' ? '即将开始' :
                    data.status === 'active' ? '进行中' : '已结束'}
                  color={data.status === 'upcoming' ? 'primary' :
                    data.status === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Typography color="text.secondary" paragraph>
              {data.description}
            </Typography>

            {data.isExpertVote && (
              <Chip
                label="专家投票"
                color="warning"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            {/* 管理员操作按钮 */}
            {(user?.role === 'admin' || user?.role === 'superAdmin' || data.creator === user?._id) && (
              <Box sx={{ mt: 2, mb: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/votes/edit/${id}`)}
                >
                  编辑投票
                </Button>
                {data.status !== 'ended' && (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => setCloseDialogOpen(true)}
                  >
                    提前关闭
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  删除投票
                </Button>
              </Box>
            )}

            <FormControl component="fieldset" disabled={isVotingDisabled} sx={{ width: '100%' }}>
              <FormLabel component="legend">请选择一个选项</FormLabel>
              <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {data.options.map((option: VoteOption) => (
                  <Box
                    key={option.id}
                    sx={{
                      position: 'relative',
                      mb: 2,
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <FormControlLabel
                      value={option.id}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {option.imageUrl && (
                            <img
                              src={option.imageUrl}
                              alt={option.text}
                              style={{ width: 100, height: 100, objectFit: 'cover' }}
                            />
                          )}
                          <Typography>{option.text}</Typography>
                        </Box>
                      }
                      sx={{ width: '100%' }}
                    />
                    {(data.hasVoted || data.status === 'ended') && (
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${option.percentage}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                              transition: 'width 0.5s ease-in-out'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {option.votes} 票 ({option.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  开始时间: {new Date(data.startTime).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  截止时间: {new Date(data.endTime).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', mr: 2 }}>
                  总投票数: {data.totalVotes}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleVoteSubmit}
                  disabled={isVotingDisabled || !selectedOption}
                >
                  {voteMutation.isPending ? '提交中...' :
                    data.hasVoted ? '已投票' :
                      data.status === 'ended' ? '已结束' :
                        data.status === 'upcoming' ? '未开始' :
                          '提交投票'}
                </Button>
              </Box>
            </Box>

            {voteMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                投票失败，请重试
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除这个投票吗？此操作不可恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 关闭确认对话框 */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
      >
        <DialogTitle>确认关闭</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要提前关闭这个投票吗？此操作不可恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleClose} 
            color="warning" 
            disabled={isClosing}
          >
            {isClosing ? '关闭中...' : '确认关闭'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加 Snackbar 组件 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarMessage.includes('失败') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
