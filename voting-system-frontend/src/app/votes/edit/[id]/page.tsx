'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { PollType } from '@/types/poll';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { ImageUpload } from '@/components/ui/image-upload';

// 表单验证模式
const editPollSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100个字符'),
  description: z.string().min(1, '描述不能为空').max(500, '描述最多500个字符'),
  type: z.enum([PollType.SINGLE, PollType.MULTIPLE]),
  options: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(1, '选项内容不能为空').max(100, '选项内容最多100个字符'),
    description: z.string().optional(),
    imageUrl: z.string().url('图片URL格式无效').optional()
  })).min(2, '至少需要2个选项').max(10, '最多10个选项'),
  startTime: z.string().datetime('开始时间格式无效'),
  endTime: z.string().datetime('结束时间格式无效'),
  maxChoices: z.number().int().positive().optional(),
  expertWeight: z.number().min(1).max(10),
  banner: z.string().url('banner图片URL格式无效').optional()
});

type EditPollFormData = z.infer<typeof editPollSchema>;

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
        const response = await axios.get(`/polls/${params.id}`);
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
  }, [params.id, router, setValue]);

  const onSubmit = async (data: EditPollFormData) => {
    try {
      setIsLoading(true);
      await axios.put(`/polls/${params.id}`, data);
      toast.success('投票更新成功');
      router.push(`/votes/${params.id}`);
    } catch (error) {
      console.error('更新投票失败:', error);
      toast.error('更新投票失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!poll) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">编辑投票</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">投票标题</label>
          <Input
            {...register('title')}
            placeholder="输入投票标题"
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">投票描述</label>
          <Textarea
            {...register('description')}
            placeholder="输入投票描述"
            error={errors.description?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">投票类型</label>
          <Select
            {...register('type')}
            options={[
              { value: PollType.SINGLE, label: '单选' },
              { value: PollType.MULTIPLE, label: '多选' }
            ]}
            error={errors.type?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">投票选项</label>
          {watch('options')?.map((option, index) => (
            <div key={option.id || index} className="flex gap-4 mb-4">
              <Input
                {...register(`options.${index}.text`)}
                placeholder="选项内容"
                error={errors.options?.[index]?.text?.message}
              />
              <Input
                {...register(`options.${index}.description`)}
                placeholder="选项描述（可选）"
                error={errors.options?.[index]?.description?.message}
              />
              <Input
                {...register(`options.${index}.imageUrl`)}
                placeholder="图片URL（可选）"
                error={errors.options?.[index]?.imageUrl?.message}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">开始时间</label>
          <DateTimePicker
            value={watch('startTime')}
            onChange={(date) => setValue('startTime', date.toISOString())}
            error={errors.startTime?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">结束时间</label>
          <DateTimePicker
            value={watch('endTime')}
            onChange={(date) => setValue('endTime', date.toISOString())}
            error={errors.endTime?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">最大选择数（多选时）</label>
          <Input
            type="number"
            {...register('maxChoices', { valueAsNumber: true })}
            placeholder="输入最大选择数"
            error={errors.maxChoices?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">专家票权重</label>
          <Input
            type="number"
            {...register('expertWeight', { valueAsNumber: true })}
            placeholder="输入专家票权重"
            error={errors.expertWeight?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">投票Banner</label>
          <ImageUpload
            value={watch('banner')}
            onChange={(url) => setValue('banner', url)}
            error={errors.banner?.message}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : '保存修改'}
        </Button>
      </form>
    </div>
  );
} 