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
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  totalVotes: number;
  isExpertVote: boolean;
}

export default function VotesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  // 获取投票列表
  const { data: votes, isLoading, error } = useQuery<Vote[]>({
    queryKey: ['votes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/votes');
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

  if (error || !votes) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">加载投票列表失败</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          投票列表
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/votes/create')}
            startIcon={<AddIcon />}
          >
            创建新投票
          </Button>
        )}
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 3
      }}>
        {votes.map((vote) => (
          <Card key={vote.id}>
            <CardHeader
              title={vote.title}
              action={
                <Chip
                  label={vote.status === 'upcoming' ? '即将开始' : 
                         vote.status === 'active' ? '进行中' : '已结束'}
                  color={vote.status === 'upcoming' ? 'primary' : 
                         vote.status === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {vote.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  截止时间: {new Date(vote.endTime).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  {vote.isExpertVote && (
                    <Chip
                      label="专家投票"
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" component="span">
                    总票数: {vote.totalVotes}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(`/votes/${vote.id}`)}
                >
                  查看详情
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
