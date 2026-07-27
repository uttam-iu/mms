import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import Image from "next/image"
import logoIcon from '../../../public/logo-white.png';

export function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const onSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    const target = e.currentTarget?.elements as typeof e.currentTarget.elements & {
      userName: { value: string };
      password: { value: string };
      fullName: { value: string };
    };

    const userName = target?.userName?.value;
    const password = target?.password?.value;
    const fullName = target?.fullName?.value;

    console.log({ userName, password, fullName });
    // document.cookie = "auth_token=your_jwt_token_here; path=/; max-age=86400; SameSite=Strict";
    // window.location.reload()
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold tracking-tight text-teal-500 flex justify-center">
            <Image src={logoIcon} alt="ZenFlow" width={184} height={132} style={{ height: '132px', objectFit: 'none' }} />
          </CardTitle>
          {/* <CardDescription>শুরু করতে নিচের ফর্মটি পূরণ করুন</CardDescription> */}
        </CardHeader>
        <form onSubmit={onSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" type="text" placeholder="John Doe" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="userName" type="email" placeholder="name@example.com" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
            {/* <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="terms" required />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I Agree <Link href="/terms" className="text-teal-600 hover:underline">Terms & Condition</Link>
              </label>
            </div> */}
            <div className="flex justify-center"><Button className="text-teal-500 font-bold cursor-pointer" variant={'outline'} type="submit">Sing Up</Button></div>

          </CardContent>
        </form>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          Already Have an Account?{" "}
          <Link href="/login" className="font-medium text-teal-600 hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
