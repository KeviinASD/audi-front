import { useNavigate, useRoutes } from 'react-router-dom'
import { router } from './routes'
import { useEffect } from 'react';
import { setNavigator } from './navigate';

export default function AppRouter() {
    const element = useRoutes(router)
    const navigate = useNavigate();

    useEffect(() => {
        setNavigator(navigate);
    }, [navigate])

    return <>
        {element}
    </>
}