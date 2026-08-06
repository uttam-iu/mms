'use client'
const MY_ACCOUNT = 'my-account';
const RECEIVER_ACCOUNT = 'receiver-account';
const JWT_TOKEN = 'JWT_TOKEN';

const setDataToLocalStorage = (name:string, value:string) => {
    localStorage.setItem(name, value);
};

const getDataFromLocalStorage = (name:string) => {
    return localStorage?.getItem(name) ||'';
};

const removeDataFromLocalStorage = (name:string) => {
    localStorage.removeItem(name);
};

const getMyAccount = () => {
    const account:any = localStorage?.getItem(MY_ACCOUNT)
        ? JSON.parse(localStorage?.getItem(MY_ACCOUNT)||'')
        : null;
    return account;
};

const setMyAccount = (accData:any) => {
    localStorage.setItem(MY_ACCOUNT, JSON.stringify(accData));
};
const getReceiverAccount = () => {
    const account = localStorage.getItem(RECEIVER_ACCOUNT)
        ? JSON.parse(localStorage.getItem(RECEIVER_ACCOUNT) ||'')
        : null;
    return account;
};

const setReceiverAccount = (accData:any) => {
    localStorage.setItem(RECEIVER_ACCOUNT, JSON.stringify(accData));
};

const removeReceiverAccount = () => removeDataFromLocalStorage(RECEIVER_ACCOUNT);
const removeMyAccout = () => removeDataFromLocalStorage(MY_ACCOUNT);

const setJwtToken = (token:string) => {
    setDataToLocalStorage(JWT_TOKEN, token);
};

const getJwtToken = () => {
    return getDataFromLocalStorage(JWT_TOKEN);
};

const removeJwtToken = () => removeDataFromLocalStorage(JWT_TOKEN);

export {
    MY_ACCOUNT,
    RECEIVER_ACCOUNT,
    getDataFromLocalStorage,
    getJwtToken,
    getMyAccount,
    getReceiverAccount,
    removeDataFromLocalStorage,
    removeJwtToken,
    removeMyAccout,
    removeReceiverAccount,
    setDataToLocalStorage,
    setJwtToken,
    setMyAccount,
    setReceiverAccount
};

