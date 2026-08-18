'use client'
const MY_ACCOUNT = 'my-account';
const RECEIVER_ACCOUNT = 'receiver-account';

const setDataToLocalStorage = (name:string, value:string) => {
    localStorage.setItem(name, value);
};

const getDataFromLocalStorage = (name:string) => {
    return localStorage?.getItem(name) ||'';
};

const removeDataFromLocalStorage = (name:string) => {
    localStorage.removeItem(name);
};

const getMyAccount = (): Record<string, unknown> | null => {
    const account = localStorage?.getItem(MY_ACCOUNT)
        ? JSON.parse(localStorage?.getItem(MY_ACCOUNT) || '')
        : null;
    return account;
};

const setMyAccount = (accData: Record<string, unknown>) => {
    localStorage.setItem(MY_ACCOUNT, JSON.stringify(accData));
};
const getReceiverAccount = () => {
    const account = localStorage.getItem(RECEIVER_ACCOUNT)
        ? JSON.parse(localStorage.getItem(RECEIVER_ACCOUNT) ||'')
        : null;
    return account;
};

const setReceiverAccount = (accData: Record<string, unknown>) => {
    localStorage.setItem(RECEIVER_ACCOUNT, JSON.stringify(accData));
};

const removeReceiverAccount = () => removeDataFromLocalStorage(RECEIVER_ACCOUNT);
const removeMyAccout = () => removeDataFromLocalStorage(MY_ACCOUNT);

export {
    MY_ACCOUNT,
    RECEIVER_ACCOUNT,
    getDataFromLocalStorage,
    getMyAccount,
    getReceiverAccount,
    removeDataFromLocalStorage,
    removeMyAccout,
    removeReceiverAccount,
    setDataToLocalStorage,
    setMyAccount,
    setReceiverAccount
};

