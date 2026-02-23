import { Navigate, type RouteObject } from 'react-router-dom'
import Login from '@/features/auth/pages/Login'
import { PrivateRoute } from '../routes/PrivateRoute'
import { PublicRoute } from '../routes/PublicRoute'
import DashLayout from '../layouts/dash2/DashLayout'

import EquiposPage from '@/features/equipos/pages/EquiposPage'
import LabsPage from '@/features/equipos/pages/LabsPage'
import AuthorizedSoftwarePage from '@/features/software/pages/AuthorizedSoftwarePage'
import SoftwareHistoryPage from '@/features/software/pages/SoftwareHistoryPage'
import HardwareHistoryPage from '@/features/hardware/pages/HardwareHistoryPage'

export const router: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/auth/login" replace />
    },
    {
        path: '/auth',
        element: <PublicRoute />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <h1>Register</h1> }
        ]
    },
    {
        path: '/main',
        element: (
            <PrivateRoute>
                <DashLayout />
            </PrivateRoute>
        ),
        children: [
            { path: 'dashboard', element: <h1 className='text-xs'>DASHBOARD HOME :3</h1> },
            { path: 'equipos', element: <EquiposPage /> },
            { path: 'laboratorios', element: <LabsPage /> },
            { path: 'software', element: <AuthorizedSoftwarePage /> },
            { path: 'software/historial/:equipmentId', element: <SoftwareHistoryPage /> },
            { path: 'hardware/historial/:equipmentId', element: <HardwareHistoryPage /> },
            { path: 'employee', element: <h1 className='text-xs'>DASHBOARD EMPLOYEE :3</h1> },
        ]
    }
]