import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Box,
  Button,
  Card,
} from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import { useEffect, useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Label from '../../../components/label';
import { ButtonGroup } from 'react-bootstrap';

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onSearch: PropTypes.func,
  onFilterUsers: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName, onSearch, onFilterUsers, users }) {
  // 각 필터 옵션에 대한 동작 함수들
  const handleFilterOption1 = () => {
    // 필터 옵션 1에 대한 동작을 수행
    onFilterUsers(users);
  };

  const handleFilterOption2 = () => {
    // 필터 옵션 2에 대한 동작을 수행
    const filteredUsers = users.filter((user) => user.role === 'ADMIN');
    onFilterUsers(filteredUsers);
  };

  const handleFilterOption3 = () => {
    const filteredUsers = users.filter((user) => user.role === 'MNG');
    onFilterUsers(filteredUsers);
  };

  const handleFilterOption4 = () => {
    const filteredUsers = users.filter((user) => user.role === 'HR');
    onFilterUsers(filteredUsers);
  };

  const handleFilterOption5 = () => {
    const filteredUsers = users.filter((user) => user.role === 'FO');
    onFilterUsers(filteredUsers);
  };

  const handleFilterOption6 = () => {
    const filteredUsers = users.filter((user) => user.role === 'USER');
    onFilterUsers(filteredUsers);
  };

  const filterOptionMappings = {
    '전체 조회': { icon: <GroupsIcon sx={{ fontSize: 17 }} />, color: 'default' },
    '최고 권한자': { icon: <AdminPanelSettingsIcon sx={{ fontSize: 17 }} />, color: 'error' },
    '총괄 책임자': { icon: <AccountBoxIcon sx={{ fontSize: 17 }} />, color: 'info' },
    '인사 관리자': { icon: <SupervisorAccountIcon sx={{ fontSize: 17 }} />, color: 'success' },
    '재무 관리자': { icon: <AccountBalanceIcon sx={{ fontSize: 17 }} />, color: 'warning' },
    '일반 권한자': { icon: <PersonIcon sx={{ fontSize: 17 }} />, color: 'default' },
  };

  const filterOptions = [
    { label: '전체 조회', action: handleFilterOption1 },
    { label: '최고 권한자', action: handleFilterOption2 },
    { label: '총괄 책임자', action: handleFilterOption3 },
    { label: '인사 관리자', action: handleFilterOption4 },
    { label: '재무 관리자', action: handleFilterOption5 },
    { label: '일반 권한자', action: handleFilterOption6 },
  ];

  // 현재 선택된 필터 옵션을 상태로 관리
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchUser, setSearchUser] = useState('');

  const handleInputChange = (event) => {
    setSearchUser(event.target.value);
  };

  const handleSearch = () => {
    onFilterName(searchUser);
  };

  // 필터링 버튼 클릭 시 메뉴 열기
  const handleButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 메뉴 항목 클릭 시 선택한 필터 옵션 실행
  const handleMenuItemClick = (filterOption) => {
    setSelectedFilter(filterOption);
    filterOption.action(); // 선택한 필터 옵션의 동작 실행
    setAnchorEl(null); // 메뉴 닫기
  };

  // 메뉴 닫기
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    onFilterUsers(users);
  }, []);

  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
        justifyContent: 'space-between',
      }}
    >
      <Card
        sx={{
          height: '40px',
          border: '0.1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button onClick={handleButtonClick}>
          <Stack display="flex" direction="row" alignItems="center">
            {selectedFilter ? (
              <>
                {filterOptionMappings[selectedFilter.label].icon}
                <Label color={filterOptionMappings[selectedFilter.label].color}>{selectedFilter.label}</Label>
              </>
            ) : (
              <>
                {filterOptionMappings['전체 조회'].icon}
                <Label color={filterOptionMappings['전체 조회'].color}>전체 조회</Label>
              </>
            )}
          </Stack>
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {filterOptions.map((option, index) => (
            <MenuItem key={index} onClick={() => handleMenuItemClick(option)}>
              <Stack direction="row" alignItems="center">
                {filterOptionMappings[option.label].icon}
                {option.label}
              </Stack>
            </MenuItem>
          ))}
        </Menu>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {filterOptions.map((option, index) => (
          <MenuItem key={index} selected={option === selectedFilter} onClick={() => handleMenuItemClick(option)}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {filterOptionMappings[option.label].icon}
              <Label color={filterOptionMappings[option.label].color}>{option.label}</Label>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} 명이 선택되었습니다.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StyledSearch
            value={searchUser}
            onChange={handleInputChange}
            placeholder="사원의 이름을 입력해주세요."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
            size="small"
          />
          <Button variant="contained" sx={{ height: 40, width: 70, marginLeft: 2 }} onClick={handleSearch}>
            검색
          </Button>
        </Box>
      )}
    </StyledRoot>
  );
}
