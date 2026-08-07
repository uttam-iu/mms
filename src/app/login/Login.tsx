'use client';

import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dummy_Uers from "@/dummyData/users.json";
import Image from "next/image";
import logoIcon from '../../../public/logo-white.png';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setupSocket } from '@/lib/socket';
import { useAppState } from '@/context/AppContext';
import { setJwtToken } from "@/lib/localStorageHelper";

export function LoginForm() {
  const router = useRouter();
  const ctx = useAppState();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loginError, setLoginError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const onLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setLoginError(false);
    setErrorMessage('');

    // Elements gulo target kora
    const target = e.currentTarget?.elements as typeof e.currentTarget.elements & {
      userName: { value: string };
      password: { value: string };
    };

    const userName = target?.userName?.value;
    const password = target?.password?.value;

    setLoading(true);
    const apiPrms = { userName, password };
    ctx?.setUser({
      "userId": 1,
      "phone": "01617630101",
      "userName": "uttam@k.com",
      "fullName": "Uttam Kumar",
      "photoUrl": "https://github.com/shadcn.png"
    },)
    setJwtToken('fsdff7er26rwehwefdydr2rd');
    setupSocket();
    document.cookie = 'auth_token=fsdff7er26rwehwefdydr2rd; path=/';
    document.cookie = `user=1; path=/`;
    document.cookie = 'max-age=86400; SameSite=Strict; path=/';
    window.location.reload()


    // axios
    //   .post((process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.105:5000/').replace(/\/+$/, '') + '/user/login', apiPrms, {
    //     withCredentials: true,
    //   })
    //   .then((res) => {
    //     setLoading(false);
    //     if (res?.data?.success) {
    //       ctx?.setUser(res?.data?.data?.user)
    //       setJwtToken(res?.data?.data?.token);
    //       setupSocket();
    //       document.cookie = 'auth_token=your_jwt_token_here; path=/';
    //       document.cookie = `user=${res?.data?.data?.user?.userId}; path=/`;
    //       document.cookie = 'max-age=86400; SameSite=Strict; path=/';
    //       window.location.reload()
    //     } else {
    //       setLoginError(true);
    //       setErrorMessage(res?.data?.message || 'Login failed.');
    //       console.log(res?.data?.message);
    //     }
    //   })
    //   .catch((err) => {
    //     setLoading(false);
    //     console.log('login-err', err);
    //   });
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
                  defaultValue={'12345'}
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
            {loginError && <div className="text-red-500 text-xs font-semibold">**{errorMessage || 'Username or password mismatch.'}</div>}
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
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          New Here?{" "}
          <Link href="/register" className="font-medium text-teal-600 hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
