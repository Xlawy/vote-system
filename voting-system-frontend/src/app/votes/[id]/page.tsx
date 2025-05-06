'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';
import { useParams } from 'next/navigation';

interface VoteOption {
    id: string;
    content: string;
    description?: string;
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
}

export default function VoteDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const queryClient = useQueryClient();

    // 获取投票详情
    const { data, isLoading, error } = useQuery({
        queryKey: ['vote', id],
        queryFn: async () => {
            const response = await axios.get(`/api/polls/${id}`);
            return response.data;
        },
    });

    // 使用相对路径显示图片
    const bannerUrl = data?.banner ? data.banner : null;
    console.log('Banner URL:', bannerUrl);

    // 提交投票
    const voteMutation = useMutation({
        mutationFn: async (optionId: string) => {
            const response = await axios.post(`/api/polls/${id}/vote`, {
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
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
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
                        <Chip
                            label={data.status === 'upcoming' ? '即将开始' :
                                data.status === 'active' ? '进行中' : '已结束'}
                            color={data.status === 'upcoming' ? 'primary' :
                                data.status === 'active' ? 'success' : 'default'}
                            variant="outlined"
                        />
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

                    <FormControl component="fieldset" disabled={isVotingDisabled} sx={{ width: '100%' }}>
                        <FormLabel component="legend">请选择一个选项</FormLabel>
                        <RadioGroup
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        >
                            {data.options.map((option) => (
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
                                            <Box>
                                                <Typography variant="body1">{option.content}</Typography>
                                                {option.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {option.description}
                                                    </Typography>
                                                )}
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
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    );
}
