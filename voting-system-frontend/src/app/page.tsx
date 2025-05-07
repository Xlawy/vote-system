'use client';

import { Box, Typography, Button, Card, CardContent, Grid, Container, Divider } from '@mui/material';
import { HowToVote, Assessment, Group, Schedule } from '@mui/icons-material';
import Link from 'next/link';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const features: Feature[] = [
    {
      icon: <HowToVote fontSize="large" />,
      title: '便捷投票',
      description: '支持单选和多选投票，专家投票权重设置'
    },
    {
      icon: <Assessment fontSize="large" />,
      title: '实时统计',
      description: '投票结果实时更新，多维度数据分析'
    },
    {
      icon: <Group fontSize="large" />,
      title: '用户管理',
      description: '支持多种用户角色，专家投票者管理'
    },
    {
      icon: <Schedule fontSize="large" />,
      title: '时间控制',
      description: '灵活的投票时间设置，自动开始/结束'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // 减去头部导航的高度
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 装饰背景元素 */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #e3f2fd 30%, #bbdefb 90%)',
          opacity: 0.5,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #e8f5e9 30%, #c8e6c9 90%)',
          opacity: 0.5,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 头部区域 */}
        <Box
          sx={{
            textAlign: 'center',
            py: 12,
            px: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            mt: 4
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            在线投票系统
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            一个现代化的投票平台，支持实时统计和专家投票
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/votes"
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.2rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
            }}
          >
            开始投票
          </Button>
        </Box>

        <Divider sx={{ my: 8 }}>
          <Typography variant="h6" color="text.secondary">
            主要功能
          </Typography>
        </Divider>

        {/* 特性展示 */}
        <Grid 
          container 
          spacing={4} 
          sx={{ 
            mb: 8,
            maxWidth: '1000px',  // 限制最大宽度
            mx: 'auto',         // 水平居中
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',         // 手机端一列
              sm: '1fr 1fr'      // 平板及以上两列
            },
            gap: 4
          }}
        >
          {features.map((feature, index) => (
            <Box key={index}>
              <Card
                sx={{
                  height: 280,        // 固定高度
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      color: 'primary.main',
                      transform: 'scale(2)',  // 放大图标
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(2.2)'
                      }
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: '1.5rem'  // 统一标题大小
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.6,
                      maxWidth: '280px',  // 限制文字宽度
                      mx: 'auto'          // 水平居中
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

