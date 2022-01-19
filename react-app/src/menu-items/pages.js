// assets
import * as icons from "@tabler/icons";

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
    id: 'pages',
    title: 'Pages',
    caption: 'Pages Caption',
    type: 'group',
    children: [
        {
            id: 'authentication',
            title: 'Authentication',
            type: 'collapse',
            icon: icons.IconKey,
            children: [
                {
                    id: 'login3',
                    title: 'Login',
                    type: 'item',
                    url: '/pages/login/login3',
                    target: true
                },
                {
                    id: 'register3',
                    title: 'Register',
                    type: 'item',
                    url: '/pages/register/register3',
                    target: true
                }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications',
            type: 'collapse',
            icon: icons.IconBellRinging,
            children: [
                {
                    id: 'list',
                    title: 'List',
                    type: 'item',
                    url: '/notifications',
                },
                {
                    id: 'create',
                    title: 'Create',
                    type: 'item',
                    url: '/notifications/create',
                },
            ]
        },
    ]
};

export default pages;
