import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { HowToVote } from '@mui/icons-material';
import Link from 'next/link';

const Header = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{
        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            gap: 1
          }}
        >
          <HowToVote sx={{ fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component={Link} 
            href="/"
            sx={{ 
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            在线投票系统
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link} 
            href="/polls"
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            投票列表
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            href="/auth/login"
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            登录
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            component={Link} 
            href="/auth/register"
            sx={{ 
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            注册
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
