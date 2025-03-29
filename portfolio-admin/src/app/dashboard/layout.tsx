import { AppSidebar } from '@/components/Dashboard/app-sidebar';
import { ModeToggle } from '@/components/theme/theme-toggle';

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="mx-auto relative z-30">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex  shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-auto sticky top-0 bg-sidebar border-b py-1 z-50">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1 size-8" />
                            <ModeToggle />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </main>
    );
}
