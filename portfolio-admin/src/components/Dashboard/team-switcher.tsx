'use client';

import * as React from 'react';
import logo from '@/assets/images/logo.svg';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

export function TeamSwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="hover:!bg-sidebar data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none"
                >
                    <Link
                        href="https://fi.amanillah.com/"
                        target="_blank"
                        className="flex items-start no-underline gap-1"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-md ">
                            <Image
                                src={logo}
                                alt="Logo"
                                // width={32}
                                // height={32}
                                className="h-10 w-10"
                            />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <h1 className="truncate text-3xl font-medium ">Fi Amanillah</h1>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
