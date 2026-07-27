import Link from "next/link"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Dummy_Uers from "@/dummyData/users.json";
import Image from "next/image"
import logoIcon from '../../../public/logo-white.png';

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [loginError, setLoginError] = React.useState<boolean>(false)

  const onLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    // Elements gulo target kora
    const target = e.currentTarget?.elements as typeof e.currentTarget.elements & {
      userName: { value: string };
      password: { value: string };
    };

    const userName = target?.userName?.value;
    const password = target?.password?.value;

    const userIndb = Dummy_Uers?.find(ec => ec?.userName?.trim() === userName?.trim()) || null

    if (userIndb && password === '12345') {
      setLoginError(false)
      document.cookie = 'auth_token=your_jwt_token_here; path=/';
      document.cookie = `user=${userIndb?.userId}; path=/`;
      document.cookie = 'max-age=86400; SameSite=Strict; path=/';
      window.location.reload()
    } else {
      setLoginError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold tracking-tight text-teal-500 flex justify-center">
            <Image src={logoIcon} alt="ZenFlow" width={184} height={132} style={{ height: '132px', objectFit: 'none' }} />
          </CardTitle>
          {/* <CardDescription>Login</CardDescription> */}
        </CardHeader>
        <form onSubmit={onLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="userName" type="email" placeholder="name@example.com" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* <Link href="/forgot-password" className="text-sm font-medium text-teal-600 hover:underline">
                  Forgot Password?
                </Link> */}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {loginError && <div className="text-red-500">**Email or password mismatch.</div>}
            <div className="flex justify-center"><Button className="text-teal-500 font-bold cursor-pointer" variant={'outline'}
              type="submit"
            >Login</Button></div>
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
  )
}
