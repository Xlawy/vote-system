'use client';

import { useQuery } from '@tanstack/react-query';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Vote {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  totalVotes: number;
  isExpertVote: boolean;
}

export default function VotesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  // 添加调试信息
  console.log('当前用户信息:', user);
  console.log('是否为管理员:', isAdmin);

  // 获取投票列表
  const { data: votes = [], isLoading, error } = useQuery<Vote[]>({
    queryKey: ['votes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/polls');
        return response.data;
      } catch (error) {
        throw new Error('获取投票列表失败');
      }
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          投票列表
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/votes/create')}
          >
            创建投票
          </Button>
        )}
      </Box>

      {error ? (
        <Alert severity="error">
          加载投票列表失败
        </Alert>
      ) : votes && votes.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {votes.map((vote) => (
            <Card
              key={vote.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => router.push(`/votes/${vote.id}`)}
            >
              <CardHeader
                title={vote.title}
                subheader={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      开始：{new Date(vote.startTime).toLocaleString('zh-CN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      结束：{new Date(vote.endTime).toLocaleString('zh-CN')}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {vote.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={vote.status === 'active' ? '进行中' : vote.status === 'upcoming' ? '未开始' : '已结束'}
                    color={vote.status === 'active' ? 'success' : vote.status === 'upcoming' ? 'primary' : 'default'}
                    size="small"
                  />
                  {vote.isExpertVote && (
                    <Chip
                      label="专家投票"
                      color="secondary"
                      size="small"
                    />
                  )}
                  <Chip
                    label={`${vote.totalVotes} 票`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            暂无投票
          </Typography>
        </Box>
      )}
    </Box>
  );
}
