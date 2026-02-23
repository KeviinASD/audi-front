import * as React from "react"
import {
    ArrowLeftToLine,
    Check,
    ChevronRight,
    ChevronsUpDown,
    File,
    Folder,
    GalleryVerticalEnd,
    LayoutDashboard,
    Bell,
    UserPlus,
    User,
    Lock,
    Link2,
    Calendar1,
    Monitor,
    Building2,
    ShieldCheck,
    Cpu,
    ClipboardCheck,
    Users,
    Key,
    FileText,
    Shield,
    LogOut,
    Settings,
    MoreVertical,
} from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarMenuSub,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "framer-motion"
import { Image } from "@/components/ui/image"

interface NavigationItem {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    badge?: string
    children?: NavigationItem[]
    locked?: boolean
}

const navigationItems: NavigationItem[] = [
    { id: "dashboard", name: "Resumen General", icon: LayoutDashboard, href: "/main/dashboard" },
    { id: "equipos", name: "Equipos", icon: Monitor, href: "/main/equipos" },
    { id: "laboratorios", name: "Laboratorios", icon: Building2, href: "/main/laboratorios" },
    { id: "reportes", name: "Reportes (Ingest)", icon: FileText, href: "/main/reportes" },
    {
        id: "auditoria",
        name: "Auditoría",
        icon: ShieldCheck,
        href: "/main/auditoria",
        children: [
            { id: "seguridad", name: "Seguridad", icon: Shield, href: "/main/seguridad" },
            { id: "software", name: "Software & Procesos", icon: Cpu, href: "/main/software" },
            { id: "cumplimiento", name: "Cumplimiento", icon: ClipboardCheck, href: "/main/cumplimiento" },
        ],
    },
    { id: "usuarios", name: "Usuarios", icon: Users, href: "/main/usuarios" },
    { id: "api-keys", name: "API Keys", icon: Key, href: "/main/api-keys" },
]


const versions = ["1.0.0", "0.9.0", "0.8.0", "0.7.0"]

export function DashSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [activeItem, setActiveItem] = React.useState("dashboard")
    const [expandedSections, setExpandedSections] = React.useState<string[]>([])

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleItemClick = (item: NavigationItem) => {
        setActiveItem(item.id)
        if (!item.children || item.children.length === 0) navigate(item.href);
    }

    const onLogout = () => {
        logout();
        navigate("/auth/login");
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader
                className="py-0 flex flex-col gap-4"
            >
                <Link
                    to="/"
                    rel="noopener noreferrer"
                    className="h-16 px-2 flex items-center border-b border-gray-200 dark:border-[#1F1F23] justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Image
                            src="https://i.pinimg.com/1200x/bb/00/fb/bb00fbabd0a58d0bc918cb8bd5664837.jpg"
                            alt="Acme"
                            className="flex-shrink-0 block dark:hidden rounded-md h-8 w-8"
                            containerClassName="h-8 w-8"
                        />
                        <span className="text-lg font-bold hover:cursor-pointer text-gray-900 dark:text-white">
                            FISIO LAB
                        </span>
                    </div>
                    <div>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftToLine className="h-5 w-5" />
                        </Button>
                    </div>
                </Link>
                <VersionSwitcher
                    versions={versions}
                    defaultVersion={versions[0]}
                />

            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs">NAVIGATION</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <RenderNavigationItem
                                    key={item.id}
                                    item={item}
                                    activeItem={activeItem}
                                    expandedSections={expandedSections}
                                    toggleSection={toggleSection}
                                    handleItemClick={handleItemClick}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-0" />

                {/* <SidebarGroup>
                    <SidebarGroupLabel
                        className="text-xs"
                    >
                        DEPARTMENTS
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {departmentsItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton>
                                        <img
                                            src={`https://logo.clearbit.com/${item.domain}`}
                                            alt={`${item.name} Logo`}
                                            width={16}
                                            height={16}
                                        />
                                        {item.name}
                                    </SidebarMenuButton>
                                    <SidebarMenuBadge className="px-2 mt-1">
                                        {item.connected ? (
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        ) : (
                                            <Link2 className="h-3 w-3" />
                                        )}
                                    </SidebarMenuBadge>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> */}


            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-gray-200 dark:border-[#1F1F23]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-xl transition-all"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg border border-gray-200 dark:border-[#2F2F33]">
                                        <AvatarImage src={"https://i.pinimg.com/736x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg"} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                                        <span className="text-sm font-semibold truncate w-full text-gray-900 dark:text-gray-100">
                                            {user?.username || 'Usuario'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 truncate w-full uppercase tracking-wider">
                                            {user?.role || 'Auditor'}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="right" className="w-56 mb-2">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/main/dashboard")}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Mi Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Ajustes</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                                    onClick={onLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}


export function VersionSwitcher({
    versions: _versions,
    defaultVersion,
}: {
    versions: string[]
    defaultVersion: string
}) {
    const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion)

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-gray-200 border-1 bg-gray-100"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            <div className="flex flex-col leading-none gap-1 overflow-hidden">
                                <span className="font-semibold truncate">Auditoria UNT</span>
                                <span className="text-xs text-gray-500 truncate">Team - 20 Members</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        align="start"
                    >
                        {versions.map((version) => (
                            <DropdownMenuItem
                                key={version}
                                onSelect={() => setSelectedVersion(version)}
                            >
                                v{version}{" "}
                                {version === selectedVersion && <Check className="ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent> */}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

interface RenderNavigationItemProps {
    item: NavigationItem;
    activeItem: string;
    expandedSections: string[];
    toggleSection: (id: string) => void;
    handleItemClick: (item: NavigationItem) => void;
}

function RenderNavigationItem({
    item,
    activeItem,
    expandedSections,
    toggleSection,
    handleItemClick,
}: RenderNavigationItemProps) {
    const Icon = item.icon
    const isActive = activeItem === item.id
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.id)

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                variant={"default"}
                onClick={() => (hasChildren ? toggleSection(item.id) : handleItemClick(item))}
            >
                <Icon className="size-4 flex-shrink-0" />
                <span className="flex items-center gap-1.5 truncate">
                    {item.locked && <Lock className="inline-block h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{item.name}</span>
                </span>
                {hasChildren && (
                    <ChevronRight
                        className={`size-4 ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                            }`}
                    />
                )}
            </SidebarMenuButton>
            {item.badge && (
                <SidebarMenuBadge>
                    <Badge variant={isActive ? "secondary" : "outline"} className="h-5 px-2 text-xs">
                        {item.badge}
                    </Badge>
                </SidebarMenuBadge>
            )}
            {hasChildren && (
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <SidebarMenuSub className="border-l mt-1">
                                <div className="space-y-1">
                                    {item.children?.map((child) => {
                                        const ChildIcon = child.icon
                                        return (
                                            <SidebarMenuItem key={child.id}>
                                                <SidebarMenuButton
                                                    isActive={activeItem === child.id}
                                                    onClick={() => handleItemClick(child)}

                                                >
                                                    <ChildIcon className="size-4" />
                                                    <span className="truncate">{child.name}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </div>
                            </SidebarMenuSub>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </SidebarMenuItem>
    )
}