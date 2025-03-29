'use client';

import * as React from 'react';
import { Frame, Map, PieChart } from 'lucide-react';

import { NavProjects } from '@/components/Dashboard/nav-projects';
import { NavUser } from '@/components/Dashboard/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar';
import { TeamSwitcher } from './team-switcher';
import { NavMain } from './nav-main';
// This is sample data.
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: 'http://localhost:3000/_next/image?url=http%3A%2F%2Flocalhost%3A3015%2Fuploads%2Fimage-1742668942101-122236721.jpeg&w=1080&q=75',
    },

    projects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="border-b">
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
