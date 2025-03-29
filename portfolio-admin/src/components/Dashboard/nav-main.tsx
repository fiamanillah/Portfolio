'use client';

import { ChevronRight } from 'lucide-react';
import { Bot, BookOpen, Settings2 } from 'lucide-react'; // Assuming these icons are imported correctly
import { FaBlogger } from 'react-icons/fa6';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function NavMain() {
    const navMain = [
        {
            title: 'Blog',
            url: '/dashboard/blog',
            icon: FaBlogger,
            isActive: true,
            items: [
                { title: 'Create Post', url: '/dashboard/blog/create-post' },
                { title: 'All Blogs', url: '/dashboard/blog/all-blogs' },
                { title: 'Draft', url: '/dashboard/blog/draft' },
                { title: 'Published', url: '/dashboard/blog/published' },
                { title: 'Archived', url: '/dashboard/blog/archived' },
            ],
        },
        {
            title: 'Models',
            url: '#',
            icon: Bot,
            items: [
                { title: 'Genesis', url: '#' },
                { title: 'Explorer', url: '#' },
                { title: 'Quantum', url: '#' },
            ],
        },
        {
            title: 'Documentation',
            url: '#',
            icon: BookOpen,
            items: [
                { title: 'Introduction', url: '#' },
                { title: 'Get Started', url: '#' },
                { title: 'Tutorials', url: '#' },
                { title: 'Changelog', url: '#' },
            ],
        },
        {
            title: 'Settings',
            url: '#',
            icon: Settings2,
            items: [
                { title: 'General', url: '#' },
                { title: 'Team', url: '#' },
                { title: 'Billing', url: '#' },
                { title: 'Limits', url: '#' },
            ],
        },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {navMain.map(item => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map(subItem => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                                <Link href={subItem.url}>
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
