// ----------------------------------------------------------------------

 const users = [
  {
    id: 1,
    date: "2023/02/23", // 근무일자
    name: "박지호", // 이름
    depart: "팀원", // 부서
    rank: "사원", // 직급
    workType: "일반근로제", // 근로제 유형
    workStart: "09:00", // 근무 시작 시간
    workEnd: "18:00", // 근무 종료 시간
    workHour: "08:00", // 소정 근로 시간
    phone: "010-1234-5678", // 휴대폰 번호
    workState: "정상처리", // 처리상태
    AccessLevel: "관리자", // 권한
  },
  {
    id: 2,
    date: "2023/03/25",
    name: "홍길동",
    depart: "팀장",
    rank: "대리",
    workType: "유연근로제",
    workStart: "08:30",
    workEnd: "17:30",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 3,
    date: "2023/04/21",
    name: "김영희",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 4,
    date: "2022/01/23",
    name: "이철수",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 5,
    date: "2020/02/31",
    name: "김민지",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 6,
    date: "2021/02/24",
    name: "이승호",
    depart: "팀원",
    rank: "사원",
    workType: "유연근로제",
    workStart: "08:00",
    workEnd: "17:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 7,
    date: "2023/05/17",
    name: "김수진",
    depart: "팀장",
    rank: "대리",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "미처리",
    AccessLevel: "사원",
  },
  {
    id: 8,
    date: "2022/07/11",
    name: "정민우",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 9,
    date: "2021/07/08",
    name: "이나라",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 10,
    date: "2021/08/21",
    name: "박상민",
    depart: "팀장",
    rank: "대리",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 11,
    date: "2022/01/27",
    name: "김민수",
    depart: "팀원",
    rank: "사원",
    workType: "유연근로제",
    workStart: "08:30",
    workEnd: "17:30",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 12,
    date: "2022/03/15",
    name: "최영수",
    depart: "팀원",
    rank: "사원",
    workType: "유연근로제",
    workStart: "08:00",
    workEnd: "17:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 13,
    date: "2021/06/30",
    name: "한지민",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "미처리",
    AccessLevel: "관리자",
  },
  {
    id: 14,
    date: "2023/01/09",
    name: "김태희",
    depart: "팀장",
    rank: "대리",
    workType: "유연근로제",
    workStart: "08:30",
    workEnd: "17:30",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 15,
    date: "2023/06/11",
    name: "이지원",
    depart: "팀원",
    rank: "사원",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "미처리",
    AccessLevel: "사원",
  },
  {
    id: 16,
    date: "2022/11/02",
    name: "송혜교",
    depart: "팀장",
    rank: "대리",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 17,
    date: "2021/09/07",
    name: "박현진",
    depart: "팀원",
    rank: "사원",
    workType: "유연근로제",
    workStart: "08:00",
    workEnd: "17:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "미처리",
    AccessLevel: "관리자",
  },
  {
    id: 18,
    date: "2023/08/14",
    name: "최민수",
    depart: "팀원",
    rank: "사원",
    workType: "유연근로제",
    workStart: "08:30",
    workEnd: "17:30",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "사원",
  },
  {
    id: 19,
    date: "2022/05/23",
    name: "유진우",
    depart: "팀장",
    rank: "대리",
    workType: "일반근로제",
    workStart: "09:00",
    workEnd: "18:00",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "정상처리",
    AccessLevel: "관리자",
  },
  {
    id: 20,
    date: "2022/09/18",
    name: "이승기",
    depart: "팀장",
    rank: "대리",
    workType: "유연근로제",
    workStart: "08:30",
    workEnd: "17:30",
    workHour: "08:00",
    phone: "010-1234-5678",
    workState: "미처리",
    AccessLevel: "사원",
  },
  // 더 많은 데이터들을 배열에 추가할 수 있습니다.
];

export default users;

