import { useAuthStore } from "@/features/auth/store/auth.store";
import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute({ children }: { children?: React.ReactNode }) {
    const { user, loading } = useAuthStore();

    if (loading) return <div>Loading...</div>;

    if (user) return <Navigate to="/main/dashboard" />;

    return children ? <>{children}</> : <Outlet />;
}
