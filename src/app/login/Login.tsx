'use client';

import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import logoIcon from '../../../public/logo-white.png';
import { useAppState } from '@/context/AppContext';
import { setDataToLocalStorage, setJwtToken } from "@/lib/localStorageHelper";
import { showToast } from "@/lib/utils";
import axios from "axios";

export function LoginForm() {
  const ctx = useAppState();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const onLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const target = e.currentTarget?.elements as typeof e.currentTarget.elements & {
      userName: { value: string };
      password: { value: string };
    };

    const userName = target?.userName?.value;
    const password = target?.password?.value;

    setLoading(true);
    const apiPrms = { userName, password };

    axios
      .post(process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') + '/user/login', apiPrms, {
        withCredentials: true,
      })
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          console.log(res?.data)
          ctx?.setUser(res?.data?.data?.user)
          setJwtToken(res?.data?.data?.token);
          setDataToLocalStorage('userId', res?.data?.data?.user?.userId)
          document.cookie = `auth_token=${res?.data?.data?.token}; path=/`;
          document.cookie = `user=${res?.data?.data?.user?.userId}; path=/`;
          document.cookie = 'max-age=86400; SameSite=Strict; path=/';
          showToast('Login successful!', 'success');
          window.location.reload()
        } else {
          showToast(res?.data?.message || 'Login failed.', 'error');
          console.log(res?.data?.message);
        }
      })
      .catch((err) => {
        setLoading(false);
        showToast('An error occurred during login.', 'error');
        console.log('login-err', err);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold tracking-tight text-teal-500 flex justify-center">
            <Image src={logoIcon} alt="MMS" width={184} height={132} style={{ height: '132px', objectFit: 'none' }} />
          </CardTitle>
        </CardHeader>
        <form onSubmit={onLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Username or Phone</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="userName" defaultValue={'01617630101'} type="text" className="pl-10" required placeholder="username" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                  defaultValue={'123456'}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                className="text-teal-500 font-bold cursor-pointer flex items-center gap-2"
                variant={'outline'}
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
