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
                {
                    id: 'show',
                    title: 'Show',
                    type: 'item',
                    url: '/notifications/show',
                },
            ]
        },
    ]
};

export default pages;
