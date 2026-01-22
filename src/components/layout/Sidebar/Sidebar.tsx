import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useFinance } from '@/contexts/FinanceContext';
import { SidebarItem } from './SidebarItem';
import { Logo } from './Logo';
import { userService } from '@/services/userService';
import { formatUserName } from '@/utils/formatUserName';
import { ImageCropModal } from '@/components/modals/ImageCropModal';
import { storageService } from '@/services/storageService';

// Ícones SVG simples - serão substituídos por biblioteca de ícones depois
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_4318)">
      <path d="M23.121 9.06887L15.536 1.48287C14.5973 0.546856 13.3257 0.0212402 12 0.0212402C10.6744 0.0212402 9.40277 0.546856 8.46401 1.48287L0.879012 9.06887C0.599438 9.34665 0.377782 9.67717 0.226895 10.0413C0.0760072 10.4053 -0.0011104 10.7958 1.20795e-05 11.1899V21.0069C1.20795e-05 21.8025 0.316083 22.5656 0.878692 23.1282C1.4413 23.6908 2.20436 24.0069 3.00001 24.0069H21C21.7957 24.0069 22.5587 23.6908 23.1213 23.1282C23.6839 22.5656 24 21.8025 24 21.0069V11.1899C24.0011 10.7958 23.924 10.4053 23.7731 10.0413C23.6222 9.67717 23.4006 9.34665 23.121 9.06887ZM15 22.0069H9.00001V18.0729C9.00001 17.2772 9.31608 16.5142 9.87869 15.9515C10.4413 15.3889 11.2044 15.0729 12 15.0729C12.7957 15.0729 13.5587 15.3889 14.1213 15.9515C14.6839 16.5142 15 17.2772 15 18.0729V22.0069ZM22 21.0069C22 21.2721 21.8947 21.5264 21.7071 21.714C21.5196 21.9015 21.2652 22.0069 21 22.0069H17V18.0729C17 16.7468 16.4732 15.475 15.5355 14.5373C14.5979 13.5997 13.3261 13.0729 12 13.0729C10.6739 13.0729 9.40216 13.5997 8.46448 14.5373C7.5268 15.475 7.00001 16.7468 7.00001 18.0729V22.0069H3.00001C2.7348 22.0069 2.48044 21.9015 2.29291 21.714C2.10537 21.5264 2.00001 21.2721 2.00001 21.0069V11.1899C2.00094 10.9248 2.1062 10.6709 2.29301 10.4829L9.87801 2.89987C10.4417 2.3388 11.2047 2.02381 12 2.02381C12.7954 2.02381 13.5583 2.3388 14.122 2.89987L21.707 10.4859C21.8931 10.6731 21.9983 10.9259 22 11.1899V21.0069Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_4318">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const CardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.50008 17.0002C6.32851 17.0002 7.00008 16.3286 7.00008 15.5002C7.00008 14.6717 6.32851 14.0002 5.50008 14.0002C4.67165 14.0002 4.00008 14.6717 4.00008 15.5002C4.00008 16.3286 4.67165 17.0002 5.50008 17.0002Z" fill="currentColor"/>
    <path d="M19 3H5C3.67441 3.00159 2.40356 3.52888 1.46622 4.46622C0.528882 5.40356 0.00158786 6.67441 0 8V16C0.00158786 17.3256 0.528882 18.5964 1.46622 19.5338C2.40356 20.4711 3.67441 20.9984 5 21H19C20.3256 20.9984 21.5964 20.4711 22.5338 19.5338C23.4711 18.5964 23.9984 17.3256 24 16V8C23.9984 6.67441 23.4711 5.40356 22.5338 4.46622C21.5964 3.52888 20.3256 3.00159 19 3ZM5 5H19C19.7956 5 20.5587 5.31607 21.1213 5.87868C21.6839 6.44129 22 7.20435 22 8H2C2 7.20435 2.31607 6.44129 2.87868 5.87868C3.44129 5.31607 4.20435 5 5 5ZM19 19H5C4.20435 19 3.44129 18.6839 2.87868 18.1213C2.31607 17.5587 2 16.7956 2 16V10H22V16C22 16.7956 21.6839 17.5587 21.1213 18.1213C20.5587 18.6839 19.7956 19 19 19Z" fill="currentColor"/>
  </svg>
);

const TransactionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_4020)">
      <path d="M23 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V1C2 0.734784 1.89464 0.48043 1.70711 0.292893C1.51957 0.105357 1.26522 0 1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H23C23.2652 24 23.5196 23.8946 23.7071 23.7071C23.8946 23.5196 24 23.2652 24 23C24 22.7348 23.8946 22.4804 23.7071 22.2929C23.5196 22.1054 23.2652 22 23 22Z" fill="currentColor"/>
      <path d="M6.00015 19.9999C6.26537 19.9999 6.51972 19.8946 6.70726 19.707C6.89479 19.5195 7.00015 19.2651 7.00015 18.9999V11.9999C7.00015 11.7347 6.89479 11.4804 6.70726 11.2928C6.51972 11.1053 6.26537 10.9999 6.00015 10.9999C5.73493 10.9999 5.48058 11.1053 5.29305 11.2928C5.10551 11.4804 5.00015 11.7347 5.00015 11.9999V18.9999C5.00015 19.2651 5.10551 19.5195 5.29305 19.707C5.48058 19.8946 5.73493 19.9999 6.00015 19.9999Z" fill="currentColor"/>
      <path d="M9.99984 10V19C9.99984 19.2652 10.1052 19.5196 10.2927 19.7071C10.4803 19.8946 10.7346 20 10.9998 20C11.2651 20 11.5194 19.8946 11.707 19.7071C11.8945 19.5196 11.9999 19.2652 11.9999 19V10C11.9999 9.73478 11.8945 9.48043 11.707 9.29289C11.5194 9.10536 11.2651 9 10.9998 9C10.7346 9 10.4803 9.10536 10.2927 9.29289C10.1052 9.48043 9.99984 9.73478 9.99984 10Z" fill="currentColor"/>
      <path d="M15 13V19C15 19.2652 15.1054 19.5196 15.2929 19.7071C15.4804 19.8946 15.7348 20 16 20C16.2652 20 16.5196 19.8946 16.7071 19.7071C16.8947 19.5196 17 19.2652 17 19V13C17 12.7348 16.8947 12.4804 16.7071 12.2929C16.5196 12.1054 16.2652 12 16 12C15.7348 12 15.4804 12.1054 15.2929 12.2929C15.1054 12.4804 15 12.7348 15 13Z" fill="currentColor"/>
      <path d="M20.0002 8.99991V18.9999C20.0002 19.2651 20.1055 19.5195 20.2931 19.707C20.4806 19.8946 20.735 19.9999 21.0002 19.9999C21.2654 19.9999 21.5198 19.8946 21.7073 19.707C21.8948 19.5195 22.0002 19.2651 22.0002 18.9999V8.99991C22.0002 8.7347 21.8948 8.48034 21.7073 8.29281C21.5198 8.10527 21.2654 7.99991 21.0002 7.99991C20.735 7.99991 20.4806 8.10527 20.2931 8.29281C20.1055 8.48034 20.0002 8.7347 20.0002 8.99991Z" fill="currentColor"/>
      <path d="M5.99983 8.99994C6.26503 8.99988 6.51934 8.89448 6.70683 8.70693L10.2928 5.12094C10.4834 4.93936 10.7366 4.83808 10.9998 4.83808C11.2631 4.83808 11.5162 4.93936 11.7068 5.12094L13.8788 7.29294C14.4414 7.85535 15.2043 8.17129 15.9998 8.17129C16.7953 8.17129 17.5583 7.85535 18.1208 7.29294L23.7068 1.70694C23.889 1.51833 23.9898 1.26573 23.9875 1.00353C23.9852 0.741338 23.8801 0.490525 23.6947 0.305117C23.5092 0.119709 23.2584 0.0145399 22.9962 0.0122615C22.734 0.00998304 22.4814 0.110777 22.2928 0.292936L16.7068 5.87794C16.5193 6.06541 16.265 6.17072 15.9998 6.17072C15.7347 6.17072 15.4804 6.06541 15.2928 5.87794L13.1208 3.70694C12.5583 3.14452 11.7953 2.82858 10.9998 2.82858C10.2043 2.82858 9.44142 3.14452 8.87883 3.70694L5.29283 7.29294C5.15302 7.43279 5.05782 7.61095 5.01925 7.8049C4.98068 7.99886 5.00048 8.19989 5.07615 8.38259C5.15182 8.56529 5.27996 8.72145 5.44437 8.83134C5.60878 8.94122 5.80208 8.99989 5.99983 8.99994Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_4020">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 17C5 13.6863 7.68629 11 11 11H9C12.3137 11 15 13.6863 15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// const GoalsIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M10 2L12.5 7.5L18.5 8.5L14.5 12.5L15.5 18.5L10 15.5L4.5 18.5L5.5 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
//   </svg>
// );

const CategoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_3958)">
      <path d="M20.1371 24C19.7672 23.999 19.4011 23.9247 19.0601 23.7813C18.719 23.638 18.4097 23.4285 18.1501 23.165L12.0001 17.051L5.85012 23.169C5.45515 23.5697 4.94861 23.8422 4.39654 23.9508C3.84447 24.0594 3.27247 23.9992 2.75512 23.778C2.23264 23.5678 1.78567 23.205 1.47258 22.7369C1.15949 22.2688 0.994841 21.7171 1.00012 21.154V5C1.00012 3.67392 1.52691 2.40215 2.46459 1.46447C3.40227 0.526784 4.67404 0 6.00012 0L18.0001 0C18.6567 0 19.3069 0.129329 19.9135 0.380602C20.5202 0.631876 21.0714 1.00017 21.5357 1.46447C22 1.92876 22.3682 2.47996 22.6195 3.08658C22.8708 3.69321 23.0001 4.34339 23.0001 5V21.154C23.0057 21.7167 22.8417 22.268 22.5293 22.7361C22.217 23.2041 21.7709 23.5672 21.2491 23.778C20.8969 23.9253 20.5189 24.0008 20.1371 24ZM6.00012 2C5.20447 2 4.44141 2.31607 3.8788 2.87868C3.31619 3.44129 3.00012 4.20435 3.00012 5V21.154C2.99976 21.3206 3.04879 21.4836 3.14102 21.6224C3.23325 21.7612 3.36455 21.8695 3.51831 21.9337C3.67208 21.9979 3.84143 22.0151 4.00496 21.9831C4.1685 21.9512 4.31888 21.8714 4.43712 21.754L11.3001 14.933C11.4875 14.7468 11.7409 14.6422 12.0051 14.6422C12.2693 14.6422 12.5228 14.7468 12.7101 14.933L19.5651 21.752C19.6834 21.8694 19.8337 21.9492 19.9973 21.9811C20.1608 22.0131 20.3302 21.9959 20.4839 21.9317C20.6377 21.8675 20.769 21.7592 20.8612 21.6204C20.9535 21.4816 21.0025 21.3186 21.0021 21.152V5C21.0021 4.20435 20.6861 3.44129 20.1234 2.87868C19.5608 2.31607 18.7978 2 18.0021 2H6.00012Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_3958">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const AccountsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_3930)">
      <path d="M23.9997 23.0001C23.9997 23.2653 23.8943 23.5196 23.7068 23.7072C23.5192 23.8947 23.2649 24.0001 22.9997 24.0001H0.999659C0.734442 24.0001 0.480088 23.8947 0.292552 23.7072C0.105015 23.5196 -0.000341587 23.2653 -0.000341587 23.0001C-0.000341587 22.7348 0.105015 22.4805 0.292552 22.2929C0.480088 22.1054 0.734442 22.0001 0.999659 22.0001H22.9997C23.2649 22.0001 23.5192 22.1054 23.7068 22.2929C23.8943 22.4805 23.9997 22.7348 23.9997 23.0001ZM0.290658 8.55206C0.0751807 8.15238 -0.0246469 7.70056 0.00237884 7.24731C0.0294046 6.79405 0.182214 6.35729 0.443658 5.98606C0.870917 5.35917 1.4431 4.84462 2.11166 4.48606L9.61266 0.582055C10.3499 0.198686 11.1687 -0.00146484 11.9997 -0.00146484C12.8306 -0.00146484 13.6494 0.198686 14.3867 0.582055L21.8867 4.48906C22.5552 4.84762 23.1274 5.36217 23.5547 5.98906C23.8161 6.36029 23.9689 6.79705 23.9959 7.25031C24.023 7.70356 23.9231 8.15538 23.7077 8.55506C23.4757 8.99388 23.1277 9.36066 22.7017 9.61544C22.2758 9.87023 21.788 10.0033 21.2917 10.0001H20.9997V18.0001H21.9997C22.2649 18.0001 22.5192 18.1054 22.7068 18.2929C22.8943 18.4805 22.9997 18.7348 22.9997 19.0001C22.9997 19.2653 22.8943 19.5196 22.7068 19.7072C22.5192 19.8947 22.2649 20.0001 21.9997 20.0001H1.99966C1.73444 20.0001 1.48009 19.8947 1.29255 19.7072C1.10502 19.5196 0.999659 19.2653 0.999659 19.0001C0.999659 18.7348 1.10502 18.4805 1.29255 18.2929C1.48009 18.1054 1.73444 18.0001 1.99966 18.0001H2.99966V10.0001H2.70766C2.21082 10.0032 1.72266 9.86976 1.29645 9.61442C0.87023 9.35908 0.522317 8.9916 0.290658 8.55206ZM4.99966 18.0001H7.99966V10.0001H4.99966V18.0001ZM9.99966 10.0001V18.0001H13.9997V10.0001H9.99966ZM18.9997 10.0001H15.9997V18.0001H18.9997V10.0001ZM2.06266 7.62506C2.1254 7.74073 2.21877 7.83691 2.33254 7.90306C2.44631 7.9692 2.57609 8.00276 2.70766 8.00006H21.2917C21.4232 8.00276 21.553 7.9692 21.6668 7.90306C21.7805 7.83691 21.8739 7.74073 21.9367 7.62506C21.9824 7.54862 22.0045 7.46038 22.0002 7.37143C21.9959 7.28247 21.9655 7.19676 21.9127 7.12506C21.6704 6.76497 21.3448 6.4686 20.9637 6.26106L13.4637 2.35406C13.0117 2.11948 12.5099 1.99703 12.0007 1.99703C11.4914 1.99703 10.9897 2.11948 10.5377 2.35406L3.03766 6.26106C2.65664 6.46926 2.33119 6.76591 2.08866 7.12606C2.03575 7.19746 2.00506 7.28288 2.00044 7.37164C1.99581 7.46039 2.01745 7.54854 2.06266 7.62506Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_3930">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AvatarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 23V20.5557C21 19.5316 20.5837 18.5446 19.8359 17.8135C19.1341 17.1274 18.194 16.7201 17.1992 16.6719L17 16.667H7C5.93212 16.667 4.91254 17.0818 4.16406 17.8135C3.41632 18.5446 3 19.5316 3 20.5557V23C3 23.5523 2.55228 24 2 24C1.44772 24 1 23.5523 1 23V20.5557C1 18.9865 1.63801 17.4863 2.76562 16.3838C3.89248 15.282 5.41588 14.667 7 14.667H17C18.5841 14.667 20.1075 15.282 21.2344 16.3838C22.362 17.4863 23 18.9865 23 20.5557V23C23 23.5523 22.5523 24 22 24C21.4477 24 21 23.5523 21 23ZM16 5.88867C15.9999 3.76206 14.2304 2 12 2C9.76963 2 8.00012 3.76206 8 5.88867C8 8.01538 9.76956 9.77734 12 9.77734C14.2304 9.77734 16 8.01538 16 5.88867ZM18 5.88867C18 9.16208 15.2924 11.7773 12 11.7773C8.7076 11.7773 6 9.16208 6 5.88867C6.00012 2.61536 8.70767 0 12 0C15.2923 0 17.9999 2.61536 18 5.88867Z" fill="currentColor" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 6C13 7.65685 11.6569 9 10 9C8.34315 9 7 7.65685 7 6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 12C2 10.3431 3.34315 9 5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 12C18 10.3431 16.6569 9 15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 8.66667C13.2867 8.95333 13.3267 9.24667 13.4533 9.51333C13.58 9.78 13.7867 10 14.04 10.1467L14.1133 10.1867C14.28 10.2867 14.4 10.4533 14.4467 10.6467C14.4933 10.84 14.4667 11.0467 14.3667 11.22L13.3333 13.3333C13.2 13.58 12.9533 13.7533 12.6733 13.8067C12.3933 13.86 12.1 13.7867 11.8733 13.6067L11.8067 13.5533C11.6333 13.42 11.42 13.3533 11.2 13.3533C10.98 13.3533 10.7667 13.42 10.5933 13.5533L10.5267 13.6067C10.3 13.7867 10.0067 13.86 9.72667 13.8067C9.44667 13.7533 9.2 13.58 9.06667 13.3333L8.03333 11.22C7.93333 11.0467 7.90667 10.84 7.95333 10.6467C8 10.4533 8.12 10.2867 8.28667 10.1867L8.36 10.1467C8.61333 10 8.82 9.78 8.94667 9.51333C9.07333 9.24667 9.11333 8.95333 9.06667 8.66667V8.53333C9.11333 8.24667 9.07333 7.95333 8.94667 7.68667C8.82 7.42 8.61333 7.2 8.36 7.05333L8.28667 7.01333C8.12 6.91333 8 6.74667 7.95333 6.55333C7.90667 6.36 7.93333 6.15333 8.03333 5.98L9.06667 3.86667C9.2 3.62 9.44667 3.44667 9.72667 3.39333C10.0067 3.34 10.3 3.41333 10.5267 3.59333L10.5933 3.64667C10.7667 3.78 10.98 3.84667 11.2 3.84667C11.42 3.84667 11.6333 3.78 11.8067 3.64667L11.8733 3.59333C12.1 3.41333 12.3933 3.34 12.6733 3.39333C12.9533 3.44667 13.2 3.62 13.3333 3.86667L14.3667 5.98C14.4667 6.15333 14.4933 6.36 14.4467 6.55333C14.4 6.74667 14.28 6.91333 14.1133 7.01333L14.04 7.05333C13.7867 7.2 13.58 7.42 13.4533 7.68667C13.3267 7.95333 13.2867 8.24667 13.3333 8.53333V8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThreeDotsVerticalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="5" r="1.5" fill="currentColor"/>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="10" cy="15" r="1.5" fill="currentColor"/>
  </svg>
);

const ResearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_4176)">
      <path d="M18.6562 0.930232L6.46421 13.1222C5.99855 13.5854 5.62939 14.1363 5.37809 14.7431C5.1268 15.3499 4.99836 16.0005 5.00021 16.6572V18.0002C5.00021 18.2654 5.10557 18.5198 5.2931 18.7073C5.48064 18.8949 5.73499 19.0002 6.00021 19.0002H7.34321C7.99997 19.0021 8.65058 18.8736 9.25737 18.6224C9.86415 18.3711 10.4151 18.0019 10.8782 17.5362L23.0702 5.34423C23.6546 4.7584 23.9828 3.96471 23.9828 3.13723C23.9828 2.30976 23.6546 1.51606 23.0702 0.930232C22.4759 0.362125 21.6854 0.0450813 20.8632 0.0450813C20.041 0.0450813 19.2505 0.362125 18.6562 0.930232ZM21.6562 3.93023L9.46421 16.1222C8.90034 16.6827 8.13822 16.9981 7.34321 17.0002H7.00021V16.6572C7.00229 15.8622 7.31778 15.1001 7.87821 14.5362L20.0702 2.34423C20.2838 2.14019 20.5678 2.02632 20.8632 2.02632C21.1586 2.02632 21.4426 2.14019 21.6562 2.34423C21.8662 2.55475 21.984 2.83992 21.984 3.13723C21.984 3.43454 21.8662 3.71972 21.6562 3.93023Z" fill="currentColor"/>
      <path d="M23 8.979C22.7348 8.979 22.4804 9.08436 22.2929 9.27189C22.1054 9.45943 22 9.71378 22 9.979V15H18C17.2043 15 16.4413 15.3161 15.8787 15.8787C15.3161 16.4413 15 17.2043 15 18V22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7957 2 19V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H14.042C14.3072 2 14.5616 1.89464 14.7491 1.70711C14.9366 1.51957 15.042 1.26522 15.042 1C15.042 0.734784 14.9366 0.48043 14.7491 0.292893C14.5616 0.105357 14.3072 0 14.042 0H5C3.67441 0.00158786 2.40356 0.528882 1.46622 1.46622C0.528882 2.40356 0.00158786 3.67441 0 5V19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H16.343C16.9999 24.0019 17.6507 23.8735 18.2576 23.6222C18.8646 23.3709 19.4157 23.0017 19.879 22.536L22.535 19.878C23.0007 19.4149 23.37 18.864 23.6215 18.2572C23.873 17.6504 24.0016 16.9998 24 16.343V9.979C24 9.71378 23.8946 9.45943 23.7071 9.27189C23.5196 9.08436 23.2652 8.979 23 8.979ZM18.465 21.122C18.063 21.523 17.5547 21.8006 17 21.922V18C17 17.7348 17.1054 17.4804 17.2929 17.2929C17.4804 17.1054 17.7348 17 18 17H21.925C21.8013 17.5535 21.524 18.0609 21.125 18.464L18.465 21.122Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_0_4176">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export function Sidebar() {
  const { isExpanded, isDesktop, toggle } = useSidebar();
  const { signOut, user } = useAuth();
  const { familyMembers } = useFinance();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatarUrl?: string | null } | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Buscar owner para usar sua foto
  const owner = familyMembers.find(m => m.role.toLowerCase() === 'owner');

  // Não renderizar em mobile/tablet
  if (!isDesktop) {
    return null;
  }

  const sidebarWidth = isExpanded ? '280px' : '80px';

  // Função para carregar perfil do usuário
  const loadUserProfile = async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }

    try {
      const profile = await userService.getProfile(user.id);
      if (profile && profile.name) {
        // Priorizar avatar do perfil do usuário, depois do owner
        const avatarUrl = profile.avatarUrl || owner?.avatarUrl;
        setUserProfile({
          name: profile.name,
          email: profile.email,
          avatarUrl,
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }

    // Se não há perfil na tabela users, tentar buscar do metadata do auth
    const authName = user.user_metadata?.name || user.user_metadata?.full_name;
    if (authName) {
      // Usar foto do owner se disponível
      const avatarUrl = owner?.avatarUrl || null;
      setUserProfile({
        name: authName,
        email: user.email || '',
        avatarUrl,
      });
    } else {
      // Último fallback: usar "Usuário" (não usar email como fallback)
      const avatarUrl = owner?.avatarUrl || null;
      setUserProfile({
        name: 'Usuário',
        email: user.email || '',
        avatarUrl,
      });
    }
  };

  // Carregar perfil do usuário
  useEffect(() => {
    loadUserProfile();
  }, [user?.id, user?.email, owner?.avatarUrl]);

  // Recarregar perfil quando a janela recebe foco (para sincronizar após mudanças em outras abas)
  useEffect(() => {
    const handleFocus = () => {
      loadUserProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMyAccountClick = () => {
    navigate('/minha-conta');
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/configuracoes');
    setIsMenuOpen(false);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setSelectedImageFile(file);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user?.id) {
      alert('Usuário não autenticado');
      return;
    }

    setIsUploading(true);
    try {
      const url = await storageService.uploadAvatar(croppedFile, user.id);
      
      if (!url) {
        throw new Error('URL não retornada do upload');
      }
      
      // Atualizar perfil no banco primeiro
      await userService.updateProfile(user.id, { avatarUrl: url });
      
      // Atualizar estado local imediatamente
      setUserProfile((prev) => prev ? { ...prev, avatarUrl: url } : null);
      
      // Recarregar perfil completo para garantir sincronização
      await loadUserProfile();
      
      setIsUploading(false);
      setSelectedImageFile(null);
      setIsCropModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert(error?.message || 'Erro ao fazer upload da imagem. Tente novamente.');
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      <aside
        className="
          fixed left-0 top-0 h-screen 
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          flex flex-col z-40
          transition-all duration-300 ease-in-out
        "
        style={{ width: sidebarWidth }}
      >
        {/* Header com Logo - mesma altura da barra fixa */}
        <div className={`relative flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 h-20 min-w-0 ${isExpanded ? 'px-4' : 'px-2'}`}>
          <Logo isExpanded={isExpanded} />
        </div>

        {/* Navegação */}
        <nav 
          className={`flex-1 overflow-y-auto py-3 pt-8 min-w-0 max-w-full ${isExpanded ? 'px-3' : 'px-2'} ${!isExpanded ? 'sidebar-nav-collapsed' : ''}`}
          style={!isExpanded ? { 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          } : undefined}
        >
          <div className={`flex flex-col ${isExpanded ? 'gap-3' : 'gap-3'} min-w-0`}>
            <SidebarItem 
              to="/" 
              icon={<HomeIcon />} 
              label={t('navigation.home')} 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/transacoes" 
              icon={<TransactionsIcon />} 
              label={t('navigation.transactions')} 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/cartoes" 
              icon={<CardsIcon />} 
              label={t('navigation.cards')} 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/contas" 
              icon={<AccountsIcon />} 
              label={t('navigation.accounts')} 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/categorias" 
              icon={<CategoryIcon />} 
              label={t('navigation.categories')} 
              isCollapsed={!isExpanded}
            />
            <SidebarItem 
              to="/pessoas" 
              icon={<PeopleIcon />} 
              label={t('navigation.people')} 
              isCollapsed={!isExpanded}
            />
          </div>
        </nav>

        {/* Botão Dicas/Bugs ou Melhorias */}
        <div className={`border-t border-gray-200 dark:border-gray-700 min-w-0 max-w-full ${isExpanded ? 'px-4 py-3' : 'px-2 py-3'}`}>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScf8GtK7YveZCzUi5IK8abtcyReWSmKZUPMgdiKtYlzxPIrKA/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              w-full flex items-center gap-3
              px-4 py-2 rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors cursor-pointer
              ${isExpanded ? '' : 'justify-center'}
            `}
          >
            <ResearchIcon />
            {isExpanded && (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dicas/Bugs ou Melhorias
              </span>
            )}
          </a>
        </div>

        {/* Perfil do usuário */}
        <div className={`relative border-t border-gray-200 dark:border-gray-700 min-w-0 max-w-full ${isExpanded ? 'px-4 py-4' : 'px-2 py-2'}`} ref={menuRef}>
          {isExpanded ? (
            <button
              onClick={handleMenuToggle}
              className="w-full flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pl-4">
                <div 
                  className="relative w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {userProfile?.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt="" 
                      className="w-full h-full object-cover object-center"
                      style={{ 
                        minWidth: '100%',
                        minHeight: '100%',
                      }}
                    />
                  ) : (
                    <AvatarIcon />
                  )}
                  {/* Overlay com ícone de upload no hover quando não há foto */}
                  {!userProfile?.avatarUrl && (
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-75 transition-opacity flex items-center justify-center">
                      <div className="text-white">
                        <UploadIcon />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {userProfile ? formatUserName(userProfile.name) : 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userProfile?.email || user?.email || ''}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                <ThreeDotsVerticalIcon />
              </div>
            </button>
          ) : (
            <button
              onClick={handleMenuToggle}
              className="w-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 transition-colors cursor-pointer"
            >
              <div 
                className="relative w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden group cursor-pointer"
                onClick={handleAvatarClick}
              >
                {userProfile?.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="" 
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      minWidth: '100%',
                      minHeight: '100%',
                    }}
                  />
                ) : (
                  <AvatarIcon />
                )}
                {/* Overlay com ícone de upload no hover quando não há foto */}
                {!userProfile?.avatarUrl && (
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-75 transition-opacity flex items-center justify-center">
                    <div className="text-white">
                      <UploadIcon />
                    </div>
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Menu dropdown */}
          {isMenuOpen && (
            <div className={`
              absolute ${isExpanded ? 'left-full ml-2' : 'left-full ml-2'} 
              bottom-0 mb-2
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg
              py-2 min-w-[160px]
              z-50
            `}>
              <button
                onClick={handleMyAccountClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <ProfileIcon />
                <span>{t('navigation.myAccount')}</span>
              </button>
              <button
                onClick={handleSettingsClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <SettingsIcon />
                <span>{t('navigation.settings')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('navigation.logout')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Modal de Crop de Imagem */}
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => {
            setIsCropModalOpen(false);
            setSelectedImageFile(null);
          }}
          onCrop={handleCropComplete}
          imageFile={selectedImageFile}
        />

        {/* Botão de toggle - centralizado verticalmente no header da logo */}
        <button
          onClick={toggle}
          className="
            absolute -right-4
            w-8 h-8 rounded-full
            bg-white border-2 border-gray-200
            flex items-center justify-center
            shadow-md hover:shadow-lg
            transition-shadow duration-200
            z-50
          "
          style={{ top: '40px', transform: 'translateY(-50%)' }}
          aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </button>
      </aside>

      {/* Estilo para esconder scrollbar quando colapsada */}
      {!isExpanded && (
        <style>{`
          .sidebar-nav-collapsed::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      )}
    </>
  );
}
