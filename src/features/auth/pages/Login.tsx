import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { LoginSchema, type LoginSchemaType } from "../schemas/login.schema";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

function AuthForm() {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();
    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const handleSubmit = async (data: LoginSchemaType) => {
        const success = await login(data);
        if (success) {
            navigate('/main', { replace: true });
        }
    }

    return (
        <Form {...form}>
            <form action="" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full">
                <FormField
                    control={form.control}
                    name={"email"}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Email" {...field}
                                    className="h-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* <FormField
                    control={form.control}
                    name={"email"}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <InputGroup {...field} className="h-10">
                                    <InputGroupInput placeholder="Email" type="email" {...field} />
                                    <InputGroupAddon>
                                        <Mail size={16} />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
                <FormField
                    control={form.control}
                    name={"password"}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <InputGroup className="h-10">
                                    <InputGroupInput placeholder="Password" type="password" {...field} />
                                    <InputGroupAddon>
                                        <Lock size={16} />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full h-12 transition-all">
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </Form>
    )
}

function AuthGoogle() {
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    function GoogleIcon() {
        return (
            <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
            >
                <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
            </svg>
        )
    }

    async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        try {

            await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (error) {

        } finally {
            setIsGoogleLoading(false);
        }
    }

    return (
        <div>
            <Button variant="outline" className="w-full h-12 font-medium transition-all"
                onClick={handleGoogleSignIn}
            >
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                {isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}
            </Button>
        </div>
    )
}

function AuthCard() {

    const spearatorAuth = () => {
        return (
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-black px-2 text-neutral-600 dark:text-neutral-400">Or continue with</span>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-lg w-full flex flex-col gap-6 p-4">
            <div>
                <h1 className="font-bold text-2xl">Welcome Back</h1>
                <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
            </div>
            <AuthForm />
            {spearatorAuth()}
            <AuthGoogle />
        </div>
    )
}

export default function Login() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
            <div className="flex items-center justify-center">
                <AuthCard />
            </div>
            <div className="hidden lg:block bg-gradient-to-b from-amber-200 to-amber-400/50">

            </div>
        </div>
    );
}