import React, { useState } from 'react';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { useAuthDispatch } from '../../context/AuthProvider';

import Iconify from '../../components/iconify/Iconify';
import loginAxios from '../../api/loginAxios';

import axios from 'axios';

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 로그인 상태 변경을 위한 AuthDispatch 가져오기
  const authDispatch = useAuthDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', data);
      if (response.status === 200) {
        enqueueSnackbar('로그인 성공', { variant: 'success' });

        // localStorage에 토큰 저장
        localStorage.setItem('accessToken', response.data.accessToken);

        // 사용자 정보 가져오기
        const userInfoResponse = await loginAxios.get('http://localhost:8080/api/users/me');
        const userInfo = JSON.stringify(userInfoResponse.data);
        console.log(userInfo);
        localStorage.setItem('userInfo', userInfo);

        // AuthContext의 상태 업데이트
        authDispatch('LOGIN', JSON.parse(userInfo));

        // 메인화면으로 이동
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        // TODO: 유효성 검증, 서버 예외 메시지 출력
        console.log(error.response.data);
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="dense"
        size="small"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="이메일"
        fullWidth
      />

      <TextField
        margin="dense"
        size="small"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        label="비밀번호"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button type="submit" fullWidth variant="contained" color="info" sx={{ mt: 3 }}>
        로그인
      </Button>
    </Box>
  );
}