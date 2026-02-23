import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginSchema, type LoginSchemaType } from "../schemas/login.schema";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from 'react-router-dom';
import { LoginBackground } from "../components/LoginBackground";
import { LoginHeader } from "../components/LoginHeader";
import { LoginFooter } from "../components/LoginFooter";

function AuthForm() {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleSubmit = async (data: LoginSchemaType) => {
        const success = await login(data);
        if (success) {
            navigate('/main', { replace: true });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 pt-4 space-y-5">
                {/* Username Field */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-slate-300">
                                Institutional Email or Username
                            </FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#C4A84C] transition-colors" />
                                    <Input
                                        {...field}
                                        placeholder="e.g. jdoe@unitru.edu.pe"
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#C4A84C] focus:border-transparent text-white placeholder:text-slate-500 transition-all outline-none h-12"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password Field */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-sm font-medium text-slate-300">
                                    Password
                                </FormLabel>
                            </div>
                            <FormControl>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#C4A84C] transition-colors" />
                                    <Input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#C4A84C] focus:border-transparent text-white placeholder:text-slate-500 transition-all outline-none h-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="rounded border-white/20 bg-white/5 text-[#C4A84C] focus:ring-[#C4A84C] focus:ring-offset-[#050a14]"
                        />
                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
                    </label>
                    <a className="text-[#C4A84C] hover:text-[#C4A84C]/80 font-medium transition-colors" href="#">
                        Forgot password?
                    </a>
                </div>

                {/* Submit Button */}
                <button
                    disabled={loading}
                    className="w-full bg-[#C4A84C] hover:bg-[#C4A84C]/90 text-[#003366] font-bold py-3.5 rounded-lg shadow-lg shadow-[#C4A84C]/20 transition-all transform active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                    type="submit"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Accessing...' : 'Access System'}
                </button>

                {/* Help Link */}
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                        Need assistance? <a className="text-slate-300 underline underline-offset-4 hover:text-white" href="#">Contact IT Support</a>
                    </p>
                </div>
            </form>
        </Form>
    );
}

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col relative">
            <LoginBackground />

            <main className="relative z-30 flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-[440px] glass-panel rounded-xl shadow-2xl overflow-hidden">
                    <LoginHeader />
                    <AuthForm />
                </div>
            </main>

            <LoginFooter />
        </div>
    );
}