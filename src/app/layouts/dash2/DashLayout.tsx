import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { DashSidebar } from "./DashSidebar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Bell, MousePointerClick, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeaderLayout() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 px-4 sticky top-0 z-10 bg-background w-full">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
            {/* <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">ui</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                        <BreadcrumbPage>button.tsx</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb> */}
            <div className="flex-1 flex justify-between items-center gap-4">
                <InputGroup className="max-w-xs">
                    <InputGroupInput placeholder="Search Keywoard..." />
                    <InputGroupAddon>
                        <Search size={16} />
                    </InputGroupAddon>
                </InputGroup>
                <div className="gap-2 flex">
                    {/* <UserAvatar /> */}
                   <Button variant="outline" className="relative" size={"icon"}>
                        <Bell />
                   </Button>
                   <Button variant="outline" className="relative" size={"icon"}>
                    <MousePointerClick />
                   </Button>
                </div>
            </div>
        </header>
    )
}

export default function DashLayout() {
    return (
        <SidebarProvider>
            {/* App Sidebar */}
            <DashSidebar />
            <SidebarInset>
                <HeaderLayout />
                <div className="flex-1 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}