'use client';

import { useState } from 'react';
import { authApi } from '@/services/api';
import { showMessage } from '@/components/Message';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserRole = 'normal' | 'expert';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'normal' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: '',
    };

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度不能小于6位';
      isValid = false;
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    // 姓名验证
    if (!formData.name) {
      newErrors.name = '请输入姓名';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const { confirmPassword, ...registerData } = formData;
        await authApi.register(registerData);
        showMessage({
          type: 'success',
          message: '注册成功，请登录',
          duration: 2000
        });
        setTimeout(() => {
          router.push('/auth/login');
        }, 1000);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || '注册失败，请重试';
        showMessage({
          type: 'error',
          message: errorMessage
        });
        setErrors(prev => ({
          ...prev,
          email: errorMessage,
        }));
      }
    }
  };

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

  const handleRoleChange = (e: SelectChangeEvent<UserRole>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
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
            align="center"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
            }}
          >
            注册
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="邮箱"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="姓名"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="密码"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="确认密码"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={formData.role}
                onChange={handleRoleChange}
                displayEmpty
              >
                <MenuItem value="normal">普通用户</MenuItem>
                <MenuItem value="expert">专家用户</MenuItem>
              </Select>
              <FormHelperText>选择用户类型</FormHelperText>
            </FormControl>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 2,
                mb: 3,
                height: 48,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              }}
            >
              注册
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                已有账号？{' '}
                <MuiLink component={Link} href="/auth/login" underline="hover">
                  立即登录
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
