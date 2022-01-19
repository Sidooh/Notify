import { lazy } from "react";

// project imports
import MainLayout from "layout/MainLayout";
import Loadable from "ui-component/Loadable";

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Notifications = Loadable(lazy(() => import('views/notifications')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));

// ==============================|| MAIN ROUTING ||============================== //

const NotificationRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/notifications',
            element: <Notifications />
        },
        {
            path: '/notifications/success',
            element: <UtilsTypography />
        },
    ]
};

export default NotificationRoutes;
