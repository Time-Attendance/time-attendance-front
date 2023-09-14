import { useState, useEffect } from 'react';
// @mui
import {
  Table,
  Button,
  MenuItem,
  TableBody,
  Modal,
  TextField,
  Snackbar,
  Alert,
  TableContainer,
  Stack,
  Select,
  Card,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Typography,
  Avatar,
  InputLabel,
  FormControl,
} from '@mui/material';
// components
import dayjs from 'dayjs';

import Label from '../../components/label';
import { TimePicker } from '@mui/x-date-pickers';

// LoginAxios
import loginAxios from '../../api/loginAxios';

// 유저 상태
import { useAuthState } from '../../context/AuthProvider';

const ScheduleModal = ({ open, onClose, userData, editSnackbar, onEditSnackbarChange, getUserList }) => {
  const formatTime = (time) => {
    if (time !== null) {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    return `-`;
  };

  const formatDateTimeToTime = (localDateTime) => {
    if (localDateTime !== null) {
      const dateTime = new Date(localDateTime);
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes}`;
    }
    return `-`;
  };

  const formatTimetoko = (time) => {
    const [hours, minutes] = time.split(':');
    const formatTime = `${hours}시간 ${minutes}분`;
    return formatTime;
  };

  function addTimes(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    // 시간과 분을 합산합니다.
    let totalHours = hours1 + hours2;
    let totalMinutes = minutes1 + minutes2;

    // 분이 60 이상인 경우 시간에 반영하고 분을 보정합니다.
    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes %= 60;
    }

    // 시간과 분을 "00:00" 형식으로 변환합니다.
    const formattedHours = String(totalHours).padStart(2, '0');
    const formattedMinutes = String(totalMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  // 로그인 한 유저 정보
  const { user } = useAuthState();

  const [startTime, setStartTime] = useState(formatTime(userData.startTime));
  const [endTime, setEndTime] = useState(formatTime(userData.endTime));
  const [workingTime, setWorkingTime] = useState(formatTime(userData.workingTime));
  const [overTime, setOverTime] = useState(formatTime(userData.overTime));
  const [workState, setWorkState] = useState(userData.workState);
  const [workGroupStartTime, setWorkGroupStartTime] = useState(null);
  const [workGroupEndTime, setWorkGroupEndTime] = useState(null);

  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  const [warningModalOpen, setWarningModalOpen] = useState(false);

  // Snackbar 열기 함수
  const handleOpenSnackbar = () => {
    onEditSnackbarChange(true);
  };

  const handleConfirmEditOpen = () => {
    setConfirmEditOpen(true);
  };

  const handleConfirmEditClose = () => {
    setConfirmEditOpen(false);
  };

  const handleConfirmEdit = async () => {
    const startTimeDate = startTime;
    const endTimeDate = endTime;
    const workingTimeDate = workingTime;
    const overTimeDate = overTime;
    const settlementId = userData.settlementId;

    const editedData = {
      startTime: startTimeDate, // Date 객체를 보내기
      endTime: endTimeDate, // Date 객체를 보내기
      workingTime: workingTimeDate, // Date 객체를 보내기
      overTime: overTimeDate, // Date 객체를 보내기
      workState, // workState을 String 형태 그대로 보내기
      settlementId,
    };
    await loginAxios.patch('/api/settlements', editedData);
    handleOpenSnackbar();
    handleConfirmEditClose();
    getUserList();
    onClose();
  };

  const handleStartTime = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndTime = (event) => {
    setEndTime(event.target.value);
  };

  const handleWorkingTime = (event) => {
    setWorkingTime(event.target.value);
  };

  const handleOverTime = (event) => {
    setOverTime(event.target.value);
  };

  const handleWorkState = (event) => {
    setWorkState(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const selectDayType = () => {
    if (userData.dayType === '근무') {
      calculateWorkDayType();
    } else if (userData.dayType === '유급') {
      calculatePaidDayType();
    } else {
      calculateUnpaidDayType();
    }
  };

  const handleWarningModalOpen = () => {
    setWarningModalOpen(true);
  };

  const handleWarningModalClose = () => {
    setWarningModalOpen(false);
  };

  useEffect(() => {
    selectDayType();
  }, [startTime, endTime]);

  const timeRangeTypes = userData.timeRangeType.split(', ');
  const breakIndexes = [];
  const workIndexes = [];
  const dutyIndexes = [];
  let approvedIndex = 0;
  const startTimes = userData.start.split(', ').map((time) => time.split(':').map(Number));
  const endTimes = userData.end.split(', ').map((time) => time.split(':').map(Number));
  const calStartTimes = [];
  const calEndTimes = [];
  let isOver = true;

  timeRangeTypes.forEach((type, i) => {
    calStartTimes.push(startTimes[i][0] * 60 + startTimes[i][1]);
    calEndTimes.push(endTimes[i][0] * 60 + endTimes[i][1]);
    if (calStartTimes[i] > calEndTimes[i]) {
      calEndTimes[i] += 1440;
      isOver = false;
    }
    if (type === '휴게') {
      breakIndexes.push(i);
    } else if (type === '근무') {
      workIndexes.push(i);
    } else if (type === '승인') {
      approvedIndex = i;
    } else if (type === '의무') {
      dutyIndexes.push(i);
    }
  });

  // 정상 근무 계산 로직
  const calculateWorkDayType = () => {
    // 'start'와 'end' 시간을 배열로 파싱합니다.

    const start = startTime.split(':').map(Number); // 내가 입력한 시간
    const end = endTime.split(':').map(Number); // 내가 입력한 시간
    setWorkState('정상처리');

    let minworkIndex = 0;
    let maxworkIndex = 0;
    let groupStart = 0;
    let groupEnd = 0;
    let startForWorkingTime = 0;
    let endForWorkingTime = 0;

    let totalBreakTime = 0;
    let totalWorkingTime = 0; // 소정 근무 시간
    let totalOverTimeInMinutes = 0;
    let fixWorkingTime = calEndTimes[workIndexes[0]] - calStartTimes[workIndexes[0]]; // 소정 고정 시간
    let fixBreakTime = 0;
    const calWorkStart = start[0] * 60 + start[1]; // 출근 시간
    let calWorkEnd = end[0] * 60 + end[1]; // 퇴근 시간
    const startapproved = startTimes[approvedIndex][0] * 60 + startTimes[approvedIndex][1]; // 승인근로시작
    const endapproved = endTimes[approvedIndex][0] * 60 + endTimes[approvedIndex][1];
    if (calWorkEnd < calWorkStart) {
      calWorkEnd += 1440; // 하루에 해당하는 분을 더해줌
    }

    // 휴게 시간 관련 로직
    breakIndexes.forEach((i) => {
      fixBreakTime += calEndTimes[i] - calStartTimes[i];
      if (calWorkStart <= calStartTimes[i] && calEndTimes[i] <= calWorkEnd) {
        totalBreakTime += calEndTimes[i] - calStartTimes[i];
      } else if (calStartTimes[i] < calWorkStart && calEndTimes[i] <= calWorkEnd) {
        totalBreakTime += calEndTimes[i] - calWorkStart;
      } else if (calWorkStart <= calStartTimes[i] && calWorkEnd < calEndTimes[i]) {
        totalBreakTime += calWorkEnd - calStartTimes[i];
      }
    });

    // 의무 시간 관련 로직
    dutyIndexes.forEach((i) => {
      if (
        (calStartTimes[i] < calWorkStart && calWorkStart < calEndTimes[i]) ||
        (calStartTimes[i] < calWorkEnd && calWorkEnd < calEndTimes[i])
      ) {
        handleWarningModalOpen();
      }
    });

    if (isOver) {
      if (workIndexes.length === 1) {
        workIndexes.forEach((i) => {
          if (calWorkStart <= calStartTimes[i]) {
            startForWorkingTime = calStartTimes[i];
          } else if (calStartTimes[i] < calWorkStart) {
            startForWorkingTime = calWorkStart;
            setWorkState('근태이상');
          }
          if (calEndTimes[i] <= calWorkEnd) {
            endForWorkingTime = calEndTimes[i];
          } else if (calEndTimes[i] > calWorkEnd) {
            endForWorkingTime = calWorkEnd;
            setWorkState('근태이상');
          }
        });
      } else {
        // 최대 최소 시간 찾기
        workIndexes.forEach((i) => {
          if (calStartTimes[minworkIndex] > calStartTimes[i]) {
            minworkIndex = i;
          }
          if (calStartTimes[maxworkIndex] < calStartTimes[i]) {
            maxworkIndex = i;
          }
        });
        if (calWorkStart < calStartTimes[minworkIndex]) {
          startForWorkingTime = calStartTimes[minworkIndex];
        } else {
          startForWorkingTime = calWorkStart;
        }
        if (startForWorkingTime + fixWorkingTime <= calWorkEnd) {
          endForWorkingTime = startForWorkingTime + fixWorkingTime;
        } else {
          endForWorkingTime = calWorkEnd;
          setWorkState('근태이상');
        }
      }
    } else {
      //
    }

    fixWorkingTime -= fixBreakTime;
    console.log(`총 초과 시간 : ${totalOverTimeInMinutes}`);
    // 승인 시간 관련 로직
    if (startapproved <= endapproved) {
      if (startapproved <= calWorkEnd && calWorkEnd <= endapproved) {
        totalOverTimeInMinutes += calWorkEnd - startapproved;
        console.log(`초과 시간 1-1 : ${totalOverTimeInMinutes}`);
      } else if (endapproved < calWorkEnd) {
        totalOverTimeInMinutes += endapproved - startapproved;
        console.log(`초과 시간 1-2 : ${totalOverTimeInMinutes}`);
      } else if (calWorkEnd < startapproved) {
        totalOverTimeInMinutes = 0;
        console.log(`초과 시간 1-3 : ${totalOverTimeInMinutes}`);
      }

      if (startapproved <= calWorkStart && calWorkStart <= endapproved) {
        totalOverTimeInMinutes -= calWorkStart - startapproved;
        console.log(`초과 시간 빼기 1: ${totalOverTimeInMinutes}`);
      }
    } else {
      if (!isOver) {
        calWorkEnd -= 1440;
      }
      if (startapproved <= calWorkEnd && calWorkEnd <= 0) {
        totalOverTimeInMinutes += calWorkEnd - startapproved;
        console.log(`초과 시간 2-1 : ${totalOverTimeInMinutes}`);
      } else if (calWorkEnd >= 0 && calWorkEnd <= endapproved) {
        totalOverTimeInMinutes += calWorkEnd + (1440 - startapproved);
        console.log(`초과 시간 2-2 : ${totalOverTimeInMinutes}`);
      } else if (endapproved < calWorkEnd) {
        totalOverTimeInMinutes += endapproved + (1440 - startapproved);
        console.log(`초과 시간 2-3 : ${totalOverTimeInMinutes}`);
      } else if (calWorkEnd < startapproved) {
        totalOverTimeInMinutes = 0;
        console.log(`초과 시간 2-4 : ${totalOverTimeInMinutes}`);
      }

      if (startapproved <= calWorkStart && calWorkStart <= 0) {
        totalOverTimeInMinutes -= calWorkStart - startapproved;
        console.log(`초과 시간 빼기 2-1 : ${totalOverTimeInMinutes}`);
      } else if (calWorkStart >= 0 && calWorkStart <= endapproved) {
        totalOverTimeInMinutes -= calWorkStart + (1440 - startapproved);
        console.log(`초과 시간 빼기 2-2 : ${totalOverTimeInMinutes}`);
      }

      if (!isOver) {
        calWorkEnd += 1440;
      }
    }

    // 그룹 시작 시간
    if (workIndexes.length === 1) {
      groupStart = startTimes[workIndexes[0]][0] * 60 + startTimes[workIndexes[0]][1];
      groupEnd = endTimes[workIndexes[0]][0] * 60 + endTimes[workIndexes[0]][1];
    } else {
      if (
        startTimes[minworkIndex][0] * 60 + startTimes[minworkIndex][1] <= calWorkStart &&
        calWorkStart <= startTimes[maxworkIndex][0] * 60 + startTimes[maxworkIndex][1]
      ) {
        groupStart = calWorkStart;
        groupEnd =
          calWorkStart +
          (endTimes[workIndexes[0]][0] * 60 +
            endTimes[workIndexes[0]][1] -
            startTimes[workIndexes[0]][0] * 60 +
            startTimes[workIndexes[0]][1]);
      } else if (startTimes[minworkIndex][0] * 60 + startTimes[minworkIndex][1] > calWorkStart) {
        groupStart = startTimes[minworkIndex][0] * 60 + startTimes[minworkIndex][1];
        groupEnd = endTimes[minworkIndex][0] * 60 + endTimes[minworkIndex][1];
      } else if (calWorkStart > startTimes[maxworkIndex][0] * 60 + startTimes[maxworkIndex][1]) {
        groupStart = startTimes[maxworkIndex][0] * 60 + startTimes[maxworkIndex][1];
        groupEnd = endTimes[maxworkIndex][0] * 60 + endTimes[maxworkIndex][1];
      }
    }

    totalWorkingTime = endForWorkingTime - startForWorkingTime - totalBreakTime;

    console.log(`최종 초과 시간 : ${totalOverTimeInMinutes}`);
    console.log(`최종 근무 시간 : ${totalWorkingTime}`);

    if (Number.isNaN(totalWorkingTime)) {
      totalWorkingTime = 0;
    }

    if (totalOverTimeInMinutes < 0) {
      totalOverTimeInMinutes = 0;
      console.log(`초과 시간이 음수일때 : ${totalOverTimeInMinutes}`);
    }

    if (totalWorkingTime < 0) {
      totalWorkingTime = 0;
    }

    if (totalWorkingTime + totalOverTimeInMinutes < fixWorkingTime) {
      let total = 0;
      total = totalWorkingTime + totalOverTimeInMinutes;
      totalWorkingTime = total;
      totalOverTimeInMinutes = 0;
      setWorkState('근태이상');
    } else if (totalWorkingTime >= fixWorkingTime) {
      totalOverTimeInMinutes += totalWorkingTime - fixWorkingTime;
      totalWorkingTime = fixWorkingTime;
    }
    // 총 근무 시간을 시간과 분으로 변환하여 workingTime 상태를 업데이트합니다.
    const workingTimeHours = Math.floor(totalWorkingTime / 60);
    const workingTimeMinutes = totalWorkingTime % 60;

    // 초과 시간을 시간과 분으로 변환하여 workingTime 상태를 업데이트합니다.
    const overTimeHours = Math.floor(totalOverTimeInMinutes / 60);
    const overTimeMinutes = totalOverTimeInMinutes % 60;

    const groupStartHours = Math.floor(groupStart / 60);
    const groupStartMinutes = groupStart % 60;

    const groupEndHours = Math.floor(groupEnd / 60);
    const groupEndMinutes = groupEnd % 60;

    // workingTime 상태를 업데이트합니다.
    setWorkingTime(`${workingTimeHours.toString().padStart(2, '0')}:${workingTimeMinutes.toString().padStart(2, '0')}`);
    setOverTime(`${overTimeHours.toString().padStart(2, '0')}:${overTimeMinutes.toString().padStart(2, '0')}`);
    setWorkGroupStartTime(
      `${groupStartHours.toString().padStart(2, '0')}:${groupStartMinutes.toString().padStart(2, '0')}`
    );
    setWorkGroupEndTime(`${groupEndHours.toString().padStart(2, '0')}:${groupEndMinutes.toString().padStart(2, '0')}`);
  };

  // 유급 휴무 계산 로직
  const calculatePaidDayType = () => {
    // 소정 근무 시간은 무조건 00:00으로 설정
    setWorkingTime('00:00');
    if (userData.startWork !== null) {
      // startTime과 endTime을 분 단위로 변환하여 계산
      const startTimeParts = startTime.split(':').map(Number);
      const endTimeParts = endTime.split(':').map(Number);

      const startTimeInMinutes = startTimeParts[0] * 60 + startTimeParts[1];
      const endTimeInMinutes = endTimeParts[0] * 60 + endTimeParts[1];

      // 초과 근무 시간 계산
      let overTimeInMinutes = endTimeInMinutes - startTimeInMinutes;

      // endTime이 startTime보다 이전인 경우에는 하루가 더해져야 함
      if (endTimeInMinutes < startTimeInMinutes) {
        overTimeInMinutes += 24 * 60; // 하루에 해당하는 분을 더해줌
      }

      // 음수인 경우 계산을 조정해줌
      if (overTimeInMinutes < 0) {
        overTimeInMinutes += 24 * 60; // 하루에 해당하는 분을 더해주고
        overTimeInMinutes -= 60; // 1시간에 해당하는 분을 빼줌
      }

      // 분을 시간과 분으로 변환하여 설정
      const overTimeHours = Math.floor(overTimeInMinutes / 60);
      const overTimeMinutes = overTimeInMinutes % 60;

      setOverTime(`${overTimeHours.toString().padStart(2, '0')}:${overTimeMinutes.toString().padStart(2, '0')}`);
      setWorkState('정상처리');
    }
  };

  // 무급 휴무 정산 로직
  const calculateUnpaidDayType = () => {
    setWorkingTime('00:00');
    setOverTime('00:00');
  };

  const showNullTime = (time) => {
    if (time === '-') {
      return '00:00';
    }
    return time;
  };

  const modalStyle = {
    // 팝업창의 넓이를 원하는 값으로 지정합니다. 필요에 따라 변경할 수 있습니다.
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textStyle = {
    width: '100%',
  };

  return (
    <Modal open={open} onClose={handleClose} style={modalStyle}>
      <Dialog
        open={open}
        onClose={handleClose}
        minWidth="xl"
        sx={{
          width: '100%', // 원하는 모달 너비 값으로 조절
          '& .MuiDialog-paper': {
            width: '40%', // 모달 내용이 모달 창 내에서 최대 너비를 가지도록 설정
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5">근태 기록 수정</Typography>
          <Typography variant="subtitle2">{userData.date}의 정보입니다.</Typography>
        </DialogTitle>

        <DialogContent dividers>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Card
              style={{
                display: 'flex',
                flex: '0.8',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar />
                  <DialogTitle>
                    {userData.name} {userData.position}
                    <Typography variant="body2">{userData.userCode}</Typography>
                  </DialogTitle>
                </div>
                {/* 버튼 그룹 */}
                <div style={{ display: 'flex', justifyContent: 'center ' }}>
                  <ButtonGroup>
                    <Button variant="outlined" color="primary" disabled={workState !== '정상처리'}>
                      정상처리
                    </Button>
                    <Button variant="outlined" color="error" disabled={workState !== '근태이상'}>
                      근태이상
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </Card>

            <Card style={{ marginLeft: '15px', flex: '1', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <DialogTitle style={{ fontSize: '17px' }}>
                {userData.workGroupName}
                <Typography variant="subtitle2" style={{ marginBottom: '15px' }}>
                  {userData.workGroupType}근로제
                </Typography>
                <Card style={{ backgroundColor: '#F2F2F2' }}>
                  <div style={{ margin: '8px' }}>
                    <Typography variant="body2" style={{ fontSize: '13px', marginLeft: '10px' }}>
                      근무시간 : {workGroupStartTime} ~ {workGroupEndTime}
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: '13px', marginLeft: '10px' }}>
                      휴식시간 :{' '}
                      {`${startTimes[breakIndexes[0]][0].toString().padStart(2, '0')}:${startTimes[breakIndexes[0]][1]
                        .toString()
                        .padStart(2, '0')}`}{' '}
                      ~{' '}
                      {`${endTimes[breakIndexes[0]][0].toString().padStart(2, '0')}:${endTimes[breakIndexes[0]][1]
                        .toString()
                        .padStart(2, '0')}`}
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: '13px', marginLeft: '10px' }}>
                      의무근로시간 :{' '}
                      {`${startTimes[dutyIndexes[0]][0].toString().padStart(2, '0')}:${startTimes[dutyIndexes[0]][1]
                        .toString()
                        .padStart(2, '0')}`}{' '}
                      ~{' '}
                      {`${endTimes[dutyIndexes[0]][0].toString().padStart(2, '0')}:${endTimes[dutyIndexes[0]][1]
                        .toString()
                        .padStart(2, '0')}`}
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: '13px', marginLeft: '10px' }}>
                      승인근로시간 :{' '}
                      {`${startTimes[approvedIndex][0].toString().padStart(2, '0')}:${startTimes[approvedIndex][1]
                        .toString()
                        .padStart(2, '0')}`}{' '}
                      ~{' '}
                      {`${endTimes[approvedIndex][0].toString().padStart(2, '0')}:${endTimes[approvedIndex][1]
                        .toString()
                        .padStart(2, '0')}`}
                    </Typography>
                  </div>
                </Card>
              </DialogTitle>
            </Card>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Card
              style={{
                marginTop: '15px',
                flex: 1,
                backgroundColor: '#E0ECF8',
                boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <DialogTitle style={{ textAlign: 'center' }}>
                소정근무시간
                <Typography variant="body1">{formatTimetoko(workingTime)}</Typography>
              </DialogTitle>
            </Card>
            <Card
              style={{
                marginTop: '15px',
                marginLeft: '15px',
                flex: 1,
                backgroundColor: '#F5F6CE',
                boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <DialogTitle style={{ textAlign: 'center' }}>
                연장근무시간
                <Typography variant="body1">{formatTimetoko(overTime)}</Typography>
              </DialogTitle>
            </Card>
            <Card
              style={{
                marginTop: '15px',
                marginLeft: '15px',
                flex: 1,
                backgroundColor: '#E3F6CE',
                boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <DialogTitle style={{ textAlign: 'center' }}>
                총 근무시간
                <Typography variant="body1">{formatTimetoko(addTimes(workingTime, overTime))}</Typography>
              </DialogTitle>
            </Card>
          </div>

          <Card style={{ marginTop: '15px', minHeight: '100px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <DialogTitle sx={{ display: 'flex', alignContent: 'center', height: 30 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', marginRight: '35px' }}>
                출퇴근 시간
              </Typography>
            </DialogTitle>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', height: 50 }}>
              <TimePicker
                readOnly
                ampm = {false}
                label=""
                value={dayjs(showNullTime(formatDateTimeToTime(userData.startWork)), 'HH:mm')}
                onChange={(time) => setStartTime(formatDateTimeToTime(time))}
                sx={{ width: 135, marginRight: '5px' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
              ~
              <TimePicker
                readOnly
                ampm = {false}
                label=""
                value={dayjs(showNullTime(formatDateTimeToTime(userData.leaveWork)), 'HH:mm')}
                onChange={(time) => setStartTime(formatDateTimeToTime(time))}
                sx={{ width: 135, marginLeft: '5px' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </DialogTitle>

            <DialogTitle sx={{ display: 'flex', alignContent: 'center', height: 30 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                근로인정 시간
              </Typography>
            </DialogTitle>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', height: 50 }}>
              <TimePicker
                timeSteps={{ minutes: 1 }}
                ampm = {false}
                label=""
                value={dayjs(startTime, 'HH:mm')}
                onChange={(time) => setStartTime(formatDateTimeToTime(time))}
                sx={{ width: 135, marginRight: '5px' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
              ~
              <TimePicker
                timeSteps={{ minutes: 1 }}
                ampm = {false}
                label=""
                value={dayjs(endTime, 'HH:mm')}
                onChange={(time) => setEndTime(formatDateTimeToTime(time))}
                sx={{ width: 135, marginLeft: '5px' }}
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </DialogTitle>
          </Card>

          <DialogActions style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Button onClick={handleClose}>취소</Button>
            <Button variant="contained" onClick={handleConfirmEditOpen}>
              수정
            </Button>
          </DialogActions>
        </DialogContent>

        {/* 수정 확인 다이얼로그 */}
        <Dialog open={confirmEditOpen} onClose={handleConfirmEditClose}>
          <DialogTitle>수정 확인</DialogTitle>
          <DialogContent>선택한 정보를 수정하시겠습니까?</DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmEditClose} color="primary">
              취소
            </Button>
            <Button
              onClick={() => {
                handleConfirmEdit();
              }}
              color="secondary"
              variant="contained"
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={warningModalOpen} onClose={handleWarningModalClose}>
          <DialogTitle>경고</DialogTitle>
          <DialogContent>의무 시간에 해당하는 범위가 선택되었습니다.</DialogContent>
          <DialogActions>
            <Button onClick={handleWarningModalClose} color="primary" variant="outlined">
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    </Modal>
  );
};

export default ScheduleModal;
