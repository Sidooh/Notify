// assets
import * as icons from "@tabler/icons";

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
    id: 'sample-docs-roadmap',
    type: 'group',
    children: [
        {
            id: 'settings',
            title: 'Settings',
            type: 'item',
            url: '/settings',
            icon: icons.IconSettings,
        },
        {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            url: 'https://codedthemes.gitbook.io/berry/',
            icon: icons.IconHelp,
            external: true,
            target: true
        },
    ]
};

export default other;
