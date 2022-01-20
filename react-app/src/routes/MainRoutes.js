import { lazy } from "react";

// project imports
import MainLayout from "layout/MainLayout";
import Loadable from "ui-component/Loadable";

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));

// pages routing
const Notifications = Loadable(lazy(() => import('views/notifications')));

// other routing
const Settings = Loadable(lazy(() => import('views/settings')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <DashboardDefault />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/notifications',
            element: <Notifications />
        },
        {
            path: '/settings',
            element: <Settings />
        },

        {
            path: '/utils/util-typography',
            element: <UtilsTypography />
        },
    ]
};

export default MainRoutes;
