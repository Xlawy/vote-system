"use client";
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  HowToVote,
  MoreVert,
  Edit,
  Delete,
  Person,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { showMessage } from '@/components/Message';

const PollCard = ({ poll, onDelete }: { poll: any; onDelete: (id: string) => void }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    router.push(`/polls/edit/${poll._id}`);
  };

  const handleDelete = () => {
    handleClose();
    if (window.confirm('确定要删除这个投票吗？')) {
      onDelete(poll._id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'ended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'pending':
        return '未开始';
      case 'ended':
        return '已结束';
      default:
        return status;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {poll.creator?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {poll.creator?.username || '未知用户'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(poll.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {(user?.role === 'admin' || user?.role === 'superAdmin') && (
            <>
              <IconButton onClick={handleMenu} size="small">
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>编辑投票</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>删除投票</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          {poll.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {poll.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Chip
            label={getStatusText(poll.status)}
            color={getStatusColor(poll.status)}
            size="small"
            sx={{ borderRadius: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push(`/polls/${poll._id}`)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2,
            }}
          >
            查看详情
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ... rest of the existing code ... 