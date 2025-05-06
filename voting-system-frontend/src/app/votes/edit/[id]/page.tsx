'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { PollType } from '@/types/poll';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { ImageUpload } from '@/components/ui/image-upload';

// 表单验证模式
const editPollSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100个字符'),
  description: z.string().min(1, '描述不能为空').max(500, '描述最多500个字符'),
  type: z.enum([PollType.SINGLE, PollType.MULTIPLE]),
  options: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(1, '选项内容不能为空').max(100, '选项内容最多100个字符'),
    description: z.string().optional()
  })).min(2, '至少需要2个选项').max(10, '最多10个选项'),
  startTime: z.string().datetime('开始时间格式无效'),
  endTime: z.string().datetime('结束时间格式无效'),
  maxChoices: z.number().int().positive().optional(),
  expertWeight: z.number().min(1).max(10),
  banner: z.string().regex(/^\/uploads\/.+/, '请输入有效的图片路径').optional()
});

type EditPollFormData = z.infer<typeof editPollSchema>;

interface SubmitData extends Omit<EditPollFormData, 'banner'> {
  banner: string | undefined;
}

export default function EditPollPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [poll, setPoll] = useState<EditPollFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EditPollFormData>({
    resolver: zodResolver(editPollSchema),
    defaultValues: {
      expertWeight: 2
    }
  });

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(`/polls/${pollId}`);
        setPoll(response.data);
        // 设置表单初始值
        setValue('title', response.data.title);
        setValue('description', response.data.description);
        setValue('type', response.data.type);
        setValue('options', response.data.options);
        setValue('startTime', response.data.startTime);
        setValue('endTime', response.data.endTime);
        setValue('maxChoices', response.data.maxChoices);
        setValue('expertWeight', response.data.expertWeight);
        setValue('banner', response.data.banner);
      } catch (error) {
        console.error('获取投票详情失败:', error);
        toast.error('获取投票信息失败');
        router.push('/votes');
      }
    };

    fetchPoll();
  }, [pollId, router, setValue]);

  const onSubmit = async (data: EditPollFormData) => {
    try {
      setIsLoading(true);
      // 如果 banner 为空字符串或无效，则设置为 undefined
      const submitData = {
        ...data,
        banner: data.banner && data.banner.trim() ? data.banner : undefined,
        // 确保时间格式正确
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        // 确保选项格式正确
        options: data.options.map(option => ({
          text: option.text,
          description: option.description || undefined
        }))
      };

      console.log('提交的数据:', submitData);
      
      const response = await axios.put(`/polls/${pollId}`, submitData);
      console.log('服务器响应:', response.data);
      
      toast.success('投票更新成功');
      router.push(`/votes/${pollId}`);
    } catch (error: any) {
      console.error('更新投票失败:', error);
      if (error.response) {
        console.error('错误详情:', {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message
        });
        toast.error(error.response.data?.message || '更新投票失败');
      } else {
        toast.error('更新投票失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!poll) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        编辑投票
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="投票标题"
                  {...register('title')}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="投票描述"
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>投票类型</InputLabel>
                    <Select
                      label="投票类型"
                      {...register('type')}
                      defaultValue={poll.type}
                    >
                      <MenuItem value={PollType.SINGLE}>单选</MenuItem>
                      <MenuItem value={PollType.MULTIPLE}>多选</MenuItem>
                    </Select>
                    {errors.type && (
                      <Typography color="error" variant="caption">
                        {errors.type.message}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="专家票权重"
                    {...register('expertWeight', { valueAsNumber: true })}
                    error={!!errors.expertWeight}
                    helperText={errors.expertWeight?.message}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  投票选项
                </Typography>
                {watch('options')?.map((option, index) => (
                  <Box key={option.id || index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          label="选项内容"
                          {...register(`options.${index}.text`)}
                          error={!!errors.options?.[index]?.text}
                          helperText={errors.options?.[index]?.text?.message}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          label="选项描述"
                          {...register(`options.${index}.description`)}
                          error={!!errors.options?.[index]?.description}
                          helperText={errors.options?.[index]?.description?.message}
                        />
                      </Box>
                      <Box>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const options = watch('options');
                            setValue('options', options.filter((_, i) => i !== index));
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const options = watch('options');
                    setValue('options', [...options, { text: '', description: '' }]);
                  }}
                >
                  添加选项
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="开始时间"
                    {...register('startTime')}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="结束时间"
                    {...register('endTime')}
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  投票Banner
                </Typography>
                <ImageUpload
                  value={watch('banner')}
                  onChange={(url) => {
                    console.log('图片上传成功，获取到的URL:', url);
                    setValue('banner', url);
                  }}
                  error={errors.banner?.message}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  onClick={() => {
                    console.log('当前表单中的banner值:', watch('banner'));
                  }}
                >
                  {isLoading ? '保存中...' : '保存修改'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 