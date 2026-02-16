import { useAuthStore } from "@/features/auth/store/auth.store";
import { Navigate, Outlet } from "react-router-dom";


export function PrivateRoute({ children }: { children?: React.ReactNode }) {
    const { user, loading } = useAuthStore();
    console.log("PrivateRoute - user:", user, "loading:", loading);

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/auth/login" />;

    return children ? <>{children}</> : <Outlet />;
}