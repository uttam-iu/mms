import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import linkifyHtml from 'linkify-html';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// converting date to yyyy-MM-dd
export const serverFormattedDate = (dateStr: string|Date) => {
    if (!dateStr) return dateStr;

    let date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month:number|string = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day:number|string = date.getDate();
    if (day < 10) day = `0${day}`;

    return `${year}-${month}-${day}`;
};

// converting date to dd/MM/yyyy
export const displayFormattedDate = (dateStr: string|Date) => {
    if (!dateStr) return dateStr;

    let date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month:number|string = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day:number|string = date.getDate();
    if (day < 10) day = `0${day}`;

    return `${day}/${month}/${year}`;
};

// converting date to yyyy-MM-dd hh:mm:ss
export const serverFormattedDateAndTime = (dateStr: string|Date) => {
    if (!dateStr) return dateStr;

    let date:Date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month:number|string = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day:number|string = date.getDate();
    if (day < 10) day = `0${day}`;

    let hours:number|string = date.getHours();
    if (hours < 10) hours = `0${hours}`;
    let minutes:number|string = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    let seconds:number|string = date.getSeconds();
    if (seconds < 10) seconds = `0${seconds}`;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const numberWithCommas = (value:number|string, fractionCount = 0) => {
    try {
        const number = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(number)) {
            throw new Error('Invalid number');
        }
        return number?.toLocaleString(undefined, {
            minimumFractionDigits: fractionCount,
            maximumFractionDigits: fractionCount,
        });
    } catch (e) {
        return value;
    }
};

// converting date to dd/MM/yyyy hh:mm a/pm
export const displayFormattedDateAndTime = (dateStr:string|Date) => {
    if (!dateStr) return dateStr;

    let date:Date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month:number|string = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day:number|string = date.getDate();
    if (day < 10) day = `0${day}`;

    let hours:number|string = date.getHours();
    let amPmFlag = 'AM';
    if (hours > 11) amPmFlag = 'PM';

    let minutes:number|string = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    // const seconds = date.getSeconds();
    hours = hours % 12 || 12; // show in 12h format
    if (hours < 10) hours = `0${hours}`;
    return `${day}/${month}/${year} ${hours}:${minutes} ${amPmFlag}`;
};

// converting date to hh:mm:ss
export const serverFormattedTime = (dateStr:string|Date) => {
    if (!dateStr) return dateStr;

    let date:Date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;
    let hours :number|string = date.getHours();
    if (hours < 10) hours = `0${hours}`;
    let minutes:number|string = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    let seconds:number|string = date.getSeconds();
    if (seconds < 10) seconds = `0${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
};

// converting date to hh:mm:ss
export const displayFormattedTime = (dateStr  :string|Date) => {
    if (!dateStr) return dateStr;

    let date:Date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    let hours :number|string = date.getHours();
    let amPmFlag = 'AM';
    if (hours > 11) amPmFlag = 'PM';

    // if (hours < 10) hours = `0${hours}`;
    let minutes:number|string = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;

    hours = hours % 12 || 12; // show in 12h format
    return `${hours}:${minutes} ${amPmFlag}`;
};

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
export const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const monthsArr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
// converting date to dd/MM/yyyy
export const getPostdDate = (dateStr:string|Date) => {
    if (!dateStr) return dateStr;

    let date:Date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month:number = date.getMonth();
    // if (month < 10) month = `0${month}`;
    let day:number|string = date.getDate();
    if (day < 10) day = `0${day}`;

    return `${monthsArr[month]} ${day}, ${year}`;
};

export const makeToast = (text:string, variant:'success'|'info'|'warning'|'error') => {
    const toastConfig = {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        // transition: Bounce,
    };
    let toastFn:any = toast;
    if (variant === 'success') toastFn = toast.success;
    else if (variant === 'info') toastFn = toast.info;
    else if (variant === 'warning') toastFn = toast.warn;
    else if (variant === 'error') toastFn = toast.error;
    toastFn(text, toastConfig);
};

export const apiToast = (res:any) => {
    let message = '';
    const variant = res?.success ? 'success' : 'error';
    if (typeof res?.message === 'string') message = res?.message;
    else message = res?.message?.message;

    makeToast(message, variant);
};

export const apiErrorToast = (res:any) => {
    let message = '';
    if (res?.response?.data?.message) message = res?.response?.data?.message;
    else if (typeof res?.message === 'string') message = res?.message;
    else console.log(res?.response);

    makeToast(message, 'error');
};
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getPostTime = (_dateStr:string|Date) => {
    if (!_dateStr) return '';
    const _now = new Date();
    const _postDate = new Date(_dateStr);

    let _timeStr:string|Date = '';

    const _diffInTime = _now.getTime() - _postDate.getTime();
    const _diffInDays = Math.round(_diffInTime / (1000 * 3600 * 24));

    if (_diffInDays < 1) _timeStr = displayFormattedTime(_dateStr);
    else if (_diffInDays < 7) _timeStr = `${days[_postDate.getDay()]}`;
    else _timeStr = displayFormattedDate(_dateStr);

    return _timeStr;
};

export const messageSanitize = (post:string) => {
    return DOMPurify.sanitize(post, {
        ALLOWED_TAGS: [
            'b',
            'i',
            'em',
            'u',
            'strong',
            'p',
            'br',
            'pre',
            'blockquote',
            'ol',
            'ul',
            'li',
        ],
        ALLOWED_ATTR: [],
    });
};

export const messageSanitizeLinkify = (msg:string) => {
    return linkifyHtml(messageSanitize(msg), {
        target: '_blank',
        rel: 'noopener noreferrer',
    });
};

const emptyFn = () => {};
export const consoler = process.env.NODE_ENV === 'development' ? console.log : emptyFn;

export const MONTH_LIST = [
  { value: "january", label: "January", monthNumber: 1 },
  { value: "february", label: "February", monthNumber: 2 },
  { value: "march", label: "March", monthNumber: 3 },
  { value: "april", label: "April", monthNumber: 4 },
  { value: "may", label: "May", monthNumber: 5 },
  { value: "june", label: "June", monthNumber: 6 },
  { value: "july", label: "July", monthNumber: 7 },
  { value: "august", label: "August", monthNumber: 8 },
  { value: "september", label: "September", monthNumber: 9 },
  { value: "october", label: "October", monthNumber: 10 },
  { value: "november", label: "November", monthNumber: 11 },
  { value: "december", label: "December", monthNumber: 12 },
];

export const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
