import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  TableBody,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import axios from 'axios';
import Iconify from '../../components/iconify';

const SERVER_URL = 'http://localhost:8080';

export default function HolidayPage() {
  // 기본 연도를 현재 연도로 설정
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [holidays, setHolidays] = useState({});
  const [open, setOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', payType: '유급' });

  const getHolidayData = async () => {
    const response = await axios.get(`${SERVER_URL}/api/holidays`);
    const processedHolidays = {};

    response.data.forEach((holiday) => {
      const year = new Date(holiday.date).getFullYear();
      if (!processedHolidays[year]) {
        processedHolidays[year] = [];
      }
      processedHolidays[year].push(holiday);
    });

    setHolidays(processedHolidays);
  };

  useEffect(() => {
    getHolidayData();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setNewHoliday({ date: '', name: '', payType: '유급' });
    setOpen(false);
  };

  const handleNewHolidayChange = (event) => {
    setNewHoliday({
      ...newHoliday,
      [event.target.name]: event.target.value,
    });
  };

  const handleAddHoliday = () => {
    axios
      .post(`${SERVER_URL}/api/holidays`, newHoliday)
      .then((response) => {
        if (response.status === 201) {
          setNewHoliday({ date: '', name: '', payType: '유급' });
          handleClose();
          getHolidayData();
          enqueueSnackbar('새 휴일이 등록되었습니다.', { variant: 'success' });
        }
      })
      .catch((error) => {
        if (error.response) {
          // TODO: 유효성 검증, 서버 예외 메시지 출력
          console.log(error.response.data);
          enqueueSnackbar('휴일 등록에 실패했습니다.', { variant: 'error' }); // 스낵바 표시
        }
      });
  };

  const handleDeleteHoliday = async (holidayId) => {
    await axios.delete(`${SERVER_URL}/api/holidays/${holidayId}`);
    getHolidayData();
  };

  const moveYear = (direction) => {
    const years = Object.keys(holidays);
    const currentIndex = years.indexOf(year);
    if (direction === 'prev' && currentIndex > 0) {
      setYear(years[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < years.length - 1) {
      setYear(years[currentIndex + 1]);
    }
  };

  return (
    <>
      <Helmet>
        <title>휴일 관리</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            휴일 관리
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpen}>
            새 휴일 추가
          </Button>
        </Stack>

        <Card>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {Object.keys(holidays).length > 0 ? (
                      <>
                        <Select value={year} onChange={(e) => setYear(e.target.value)}>
                          {Object.keys(holidays).map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}년
                            </MenuItem>
                          ))}
                        </Select>

                        <IconButton onClick={() => moveYear('prev')}>
                          <ArrowBackIosNewIcon />
                        </IconButton>
                        <IconButton onClick={() => moveYear('next')}>
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </>
                    ) : (
                      <CircularProgress />
                    )}
                  </TableCell>
                </TableRow>
                {holidays[year]?.map((holiday) => (
                  <TableRow key={holiday.holidayId}>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>{holiday.date}</TableCell>
                    <TableCell>{holiday.payType}</TableCell>
                    <TableCell align="right">
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteHoliday(holiday.holidayId)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>새 휴일 추가</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="date"
                name="date"
                label="날짜"
                type="date"
                fullWidth
                value={newHoliday.date}
                onChange={handleNewHolidayChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="dense"
                id="name"
                name="name"
                label="휴일 이름"
                type="text"
                fullWidth
                value={newHoliday.name}
                onChange={handleNewHolidayChange}
              />
              <Select
                margin="dense"
                id="payType"
                name="payType"
                label="급여 구분"
                fullWidth
                value={newHoliday.payType}
                onChange={handleNewHolidayChange}
              >
                <MenuItem value={'유급'}>유급</MenuItem>
                <MenuItem value={'무급'}>무급</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>취소</Button>
              <Button onClick={handleAddHoliday}>추가</Button>
            </DialogActions>
          </Dialog>
        </Card>

        {/* 스낵바 UI */}
        <SnackbarProvider
          maxSnack={1}
          autoHideDuration={3000}
          // 생성위치를 하단, 오른쪽으로 설정
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Container>
    </>
  );
}
