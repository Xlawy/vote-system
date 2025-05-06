import { useState } from 'react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  className?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  error,
  className
}: ImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 直接使用服务器返回的相对路径
      onChange(response.data.url);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 在显示图片时使用完整URL
  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          disabled={isLoading}
        />
      </div>
      {value && (
        <div className="relative w-full h-48">
          <img
            src={getImageUrl(value)}
            alt="Uploaded"
            className="object-cover w-full h-full rounded-md"
            onError={(e) => {
              console.error('图片加载失败:', value);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 