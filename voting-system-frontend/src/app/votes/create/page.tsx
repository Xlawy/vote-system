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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { toast } from 'react-hot-toast';

interface VoteOption {
  text: string;
  description: string;
}

interface CreateVoteForm {
  title: string;
  description: string;
  type: 'single' | 'multiple';
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  isExpertVote: boolean;
  maxChoices?: number;
  expertWeight: number;
  options: VoteOption[];
  banner?: string;
}

export default function CreateVotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<CreateVoteForm>({
    title: '',
    description: '',
    type: 'single',
    startTime: dayjs(),
    endTime: dayjs().add(24, 'hour'), // 默认24小时后
    isExpertVote: false,
    expertWeight: 2,
    options: [
      { text: '', description: '' },
      { text: '', description: '' }
    ],
    banner: undefined
  });

  // 创建投票的mutation
  const createVoteMutation = useMutation({
    mutationFn: async (data: CreateVoteForm) => {
      // 将选项中的content改为text
      const formattedData = {
        ...data,
        options: data.options.map(opt => ({
          text: opt.text,
          description: opt.description
        })),
        expertVoters: [], // 暂时不支持选择专家
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString()
      };
      const response = await axios.post('/polls', formattedData);
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
      options: [...prev.options, { text: '', description: '' }]
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

  // 处理banner上传
  const handleBannerUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 使用相对路径
      const imageUrl = response.data.url;
      console.log('上传的图片URL:', imageUrl);
      setForm(prev => ({ ...prev, banner: imageUrl }));
    } catch (error) {
      console.error('上传图片失败:', error);
      toast.error('上传图片失败');
    }
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
    if (form.options.some(opt => !opt.text.trim())) {
      alert('请填写所有选项内容');
      return;
    }
    if (form.endTime.isBefore(dayjs())) {
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
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  投票Banner图设置
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddIcon />}
                  >
                    上传图片
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleBannerUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                </Box>
                {form.banner && (
                  <Box sx={{ mt: 2, width: '100%', height: 200, position: 'relative' }}>
                    <img
                      src={form.banner.startsWith('http') ? form.banner : `http://localhost:8000${form.banner}`}
                      alt="Banner preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        console.error('图片加载失败:', form.banner);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Box>
                )}
              </Box>

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

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
                <Stack spacing={2}>
                  <DateTimePicker
                    label="开始时间"
                    value={form.startTime}
                    onChange={(newValue) => {
                      if (newValue) {
                        setForm(prev => ({ ...prev, startTime: newValue }));
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
                  <DateTimePicker
                    label="结束时间"
                    value={form.endTime}
                    onChange={(newValue) => {
                      if (newValue) {
                        setForm(prev => ({ ...prev, endTime: newValue }));
                      }
                    }}
                    minDateTime={form.startTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Stack>
              </LocalizationProvider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.type === 'multiple'}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        type: e.target.checked ? 'multiple' : 'single',
                        maxChoices: e.target.checked ? 2 : undefined
                      }))}
                    />
                  }
                  label="多选投票"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isExpertVote}
                      onChange={(e) => setForm(prev => ({ ...prev, isExpertVote: e.target.checked }))}
                    />
                  }
                  label="专家投票"
                />
              </Box>

              {form.type === 'multiple' && (
                <TextField
                  type="number"
                  label="最大选择数"
                  value={form.maxChoices}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    maxChoices: parseInt(e.target.value) || 2
                  }))}
                  inputProps={{ min: 2, max: form.options.length }}
                  fullWidth
                />
              )}

              {form.isExpertVote && (
                <TextField
                  type="number"
                  label="专家权重"
                  value={form.expertWeight}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    expertWeight: parseInt(e.target.value) || 2
                  }))}
                  inputProps={{ min: 1, max: 10 }}
                  fullWidth
                  helperText="专家投票的权重（1-10）"
                />
              )}

              <Divider />

              <Typography variant="h6" gutterBottom>
                投票选项
              </Typography>

              {form.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <TextField
                      label={`选项 ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
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
