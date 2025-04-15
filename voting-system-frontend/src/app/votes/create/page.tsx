'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { zhCN } from 'date-fns/locale';

interface VoteOption {
  content: string;
  description: string;
}

interface CreateVoteForm {
  title: string;
  description: string;
  endTime: Date;
  isExpertVote: boolean;
  options: VoteOption[];
}

export default function CreateVotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateVoteForm>({
    title: '',
    description: '',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认24小时后
    isExpertVote: false,
    options: [
      { content: '', description: '' },
      { content: '', description: '' }
    ]
  });

  // 创建投票的mutation
  const createVoteMutation = useMutation({
    mutationFn: async (data: CreateVoteForm) => {
      const response = await axios.post('/api/votes', data);
      return response.data;
    },
    onSuccess: () => {
      router.push('/votes');
    },
  });

  // 添加选项
  const addOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { content: '', description: '' }]
    }));
  };

  // 删除选项
  const removeOption = (index: number) => {
    if (form.options.length <= 2) return; // 保持至少2个选项
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // 更新选项内容
  const updateOption = (index: number, field: keyof VoteOption, value: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!form.title.trim()) {
      alert('请输入投票标题');
      return;
    }
    if (!form.description.trim()) {
      alert('请输入投票描述');
      return;
    }
    if (form.options.some(opt => !opt.content.trim())) {
      alert('请填写所有选项内容');
      return;
    }
    if (form.endTime <= new Date()) {
      alert('结束时间必须晚于当前时间');
      return;
    }

    try {
      await createVoteMutation.mutateAsync(form);
    } catch (error) {
      console.error('创建投票失败:', error);
    }
  };

  // 检查是否是管理员
  if (user?.role !== 'admin' && user?.role !== 'superAdmin') {
    return (
      <Box p={3}>
        <Alert severity="error">
          您没有权限创建投票
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            创建新投票
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="投票标题"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                required
              />

              <TextField
                label="投票描述"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                required
              />

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
                <DateTimePicker
                  label="结束时间"
                  value={form.endTime}
                  onChange={(newValue) => {
                    if (newValue) {
                      setForm(prev => ({ ...prev, endTime: newValue }));
                    }
                  }}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.isExpertVote}
                    onChange={(e) => setForm(prev => ({ ...prev, isExpertVote: e.target.checked }))}
                  />
                }
                label="专家投票"
              />

              <Divider />

              <Typography variant="h6" gutterBottom>
                投票选项
              </Typography>

              {form.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <TextField
                      label={`选项 ${index + 1}`}
                      value={option.content}
                      onChange={(e) => updateOption(index, 'content', e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="选项描述（可选）"
                      value={option.description}
                      onChange={(e) => updateOption(index, 'description', e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Stack>
                  <IconButton
                    onClick={() => removeOption(index)}
                    disabled={form.options.length <= 2}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={addOption}
                variant="outlined"
                fullWidth
              >
                添加选项
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  fullWidth
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createVoteMutation.isPending}
                  fullWidth
                >
                  {createVoteMutation.isPending ? '创建中...' : '创建投票'}
                </Button>
              </Box>

              {createVoteMutation.isError && (
                <Alert severity="error">
                  创建投票失败，请重试
                </Alert>
              )}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
