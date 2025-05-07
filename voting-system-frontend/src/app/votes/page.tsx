'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';

interface Vote {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  totalVotes: number;
  isExpertVote: boolean;
  banner?: string;
}

export default function VoteListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  // 获取投票列表
  const { data: votes, isLoading, error } = useQuery({
    queryKey: ['votes', filter],
    queryFn: async () => {
      const response = await axios.get('/polls');
      return response.data;
    },
  });

  // 过滤投票
  const filteredVotes = votes?.filter((vote: Vote) => {
    if (filter === 'all') return true;
    return vote.status === filter;
  });

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'primary';
      case 'ended':
        return 'default';
      default:
        return 'default';
    }
  };

  // 获取状态对应的文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'upcoming':
        return '即将开始';
      case 'ended':
        return '已结束';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">加载投票列表失败</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 顶部操作栏 */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          投票列表
        </Typography>
        {(user?.role === 'admin' || user?.role === 'superAdmin') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/votes/create')}
          >
            创建投票
          </Button>
        )}
      </Box>

      {/* 筛选按钮组 */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Chip
          label="全部"
          onClick={() => setFilter('all')}
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
        />
        <Chip
          label="进行中"
          onClick={() => setFilter('active')}
          color={filter === 'active' ? 'success' : 'default'}
          variant={filter === 'active' ? 'filled' : 'outlined'}
        />
        <Chip
          label="即将开始"
          onClick={() => setFilter('upcoming')}
          color={filter === 'upcoming' ? 'primary' : 'default'}
          variant={filter === 'upcoming' ? 'filled' : 'outlined'}
        />
        <Chip
          label="已结束"
          onClick={() => setFilter('ended')}
          color={filter === 'ended' ? 'default' : 'default'}
          variant={filter === 'ended' ? 'filled' : 'outlined'}
        />
      </Stack>

      {/* 投票列表 */}
      <Grid container spacing={3}>
        {filteredVotes?.map((vote: Vote) => (
          <Grid item xs={12} sm={6} md={4} key={vote.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                cursor: 'pointer',
              }}
              onClick={() => router.push(`/votes/${vote.id}`)}
            >
              {vote.banner && (
                <CardMedia
                  component="img"
                  height="140"
                  image={vote.banner}
                  alt={vote.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={getStatusText(vote.status)}
                      color={getStatusColor(vote.status)}
                      size="small"
                    />
                    {vote.isExpertVote && (
                      <Chip
                        label="专家投票"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {vote.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {vote.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(vote.endTime).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HowToVoteIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {vote.totalVotes} 票
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 空状态 */}
      {filteredVotes?.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <Typography variant="h6" gutterBottom>
            暂无投票
          </Typography>
          <Typography variant="body2">
            {filter === 'all' ? '还没有任何投票' :
             filter === 'active' ? '当前没有进行中的投票' :
             filter === 'upcoming' ? '当前没有即将开始的投票' :
             '当前没有已结束的投票'}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
