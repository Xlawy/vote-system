'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { showMessage } from '@/components/Message';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 清除对应字段的错误信息
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // 用户名验证
    if (!formData.username) {
      newErrors.username = '请输入用户名';
      isValid = false;
    }

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 如果要修改密码，验证密码相关字段
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = '请输入当前密码';
        isValid = false;
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = '新密码长度不能小于6位';
        isValid = false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // TODO: 调用更新用户信息的 API
      showMessage({
        type: 'success',
        message: '个人信息更新成功',
      });
    } catch (error: any) {
      showMessage({
        type: 'error',
        message: error.response?.data?.message || '更新失败，请重试',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
          }}
        >
          个人资料
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                  }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="用户名"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="邮箱"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  修改密码
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="当前密码"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="新密码"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="确认新密码"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  mt: 2,
                  height: 48,
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                }}
              >
                保存修改
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
} 