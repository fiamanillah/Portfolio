import * as React from "react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { AspectRatio } from "@workspace/ui/components/aspect-ratio"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@workspace/ui/components/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card"
import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { Label } from "@workspace/ui/components/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Progress } from "@workspace/ui/components/progress"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Slider } from "@workspace/ui/components/slider"
import { Toaster } from "@workspace/ui/components/sonner"
import { Switch } from "@workspace/ui/components/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { Toggle } from "@workspace/ui/components/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

const cardClass = "rounded-2xl border border-border bg-card p-4 overflow-hidden"

function ShowcaseSection({
  title,
  children,
  className,
  contentClassName,
}: {
  title: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={`${cardClass} ${className ?? ""}`}>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className={`w-full max-w-full ${contentClassName ?? ""}`}>
        {children}
      </div>
    </section>
  )
}

export function ShadcnShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [progress, setProgress] = React.useState(45)
  const [slider, setSlider] = React.useState([35])

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-2xl border border-border bg-card/90 p-5 backdrop-blur-sm sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Shadcn Components Preview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Route playground for all components in the workspace UI package.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card/75 p-3">
          <a
            href="#core"
            className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted"
          >
            Core UI
          </a>
          <a
            href="#forms-feedback"
            className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted"
          >
            Forms & Feedback
          </a>
          <a
            href="#data-navigation"
            className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted"
          >
            Data & Navigation
          </a>
        </nav>

        <div className="space-y-8">
          <section id="core" className="scroll-mt-8 space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Core UI</h2>
              <p className="text-sm text-muted-foreground">
                General-purpose layout, surface, and overlay components.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ShowcaseSection title="Button">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Badge">
                <div className="flex gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Alert">
                <Alert>
                  <AlertTitle>Heads up</AlertTitle>
                  <AlertDescription>
                    Everything is rendering from @workspace/ui.
                  </AlertDescription>
                  <AlertAction>Dismiss</AlertAction>
                </Alert>
              </ShowcaseSection>

              <ShowcaseSection title="Alert Dialog">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Open Alert Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm action</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is a preview of alert dialog primitives.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ShowcaseSection>

              <ShowcaseSection title="Aspect Ratio">
                <AspectRatio
                  ratio={16 / 9}
                  className="overflow-hidden rounded-lg border"
                >
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
                    alt="Desk setup"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </ShowcaseSection>

              <ShowcaseSection title="Avatar">
                <div className="space-y-3">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="Avatar"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <AvatarGroup>
                    <Avatar>
                      <AvatarImage
                        src="https://i.pravatar.cc/100?img=11"
                        alt="User 1"
                      />
                      <AvatarFallback>U1</AvatarFallback>
                      <AvatarBadge />
                    </Avatar>
                    <Avatar>
                      <AvatarImage
                        src="https://i.pravatar.cc/100?img=22"
                        alt="User 2"
                      />
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <AvatarGroupCount>+3</AvatarGroupCount>
                  </AvatarGroup>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Breadcrumb">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Components</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </ShowcaseSection>

              <ShowcaseSection title="Calendar">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </ShowcaseSection>

              <ShowcaseSection title="Card">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>
                      Short supportive description.
                    </CardDescription>
                    <CardAction>
                      <Button size="sm" variant="outline">
                        Action
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>Body content goes here.</CardContent>
                  <CardFooter className="justify-end">
                    <Button size="sm">Save</Button>
                  </CardFooter>
                </Card>
              </ShowcaseSection>

              <ShowcaseSection title="Carousel" contentClassName="px-12">
                <Carousel className="mx-auto w-full max-w-xs">
                  <CarouselContent>
                    {["One", "Two", "Three"].map((item) => (
                      <CarouselItem key={item}>
                        <div className="flex h-28 items-center justify-center rounded-lg border bg-muted">
                          {item}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </ShowcaseSection>

              <ShowcaseSection title="Checkbox">
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">Accept terms</Label>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Command">
                <Command className="rounded-lg border">
                  <CommandInput placeholder="Search command..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem>
                        Profile
                        <CommandShortcut>P</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        Settings
                        <CommandShortcut>S</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </CommandList>
                </Command>
              </ShowcaseSection>

              <ShowcaseSection title="Dialog">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        Dialog description content.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button>Done</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </ShowcaseSection>

              <ShowcaseSection title="Dropdown Menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Account</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuCheckboxItem checked>
                      Notifications
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ShowcaseSection>
            </div>
          </section>

          <section id="forms-feedback" className="scroll-mt-8 space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Forms & Feedback
              </h2>
              <p className="text-sm text-muted-foreground">
                Input controls, selection patterns, and interaction feedback.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ShowcaseSection title="Hover Card">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link" className="px-0">
                      Hover me
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    Extra details appear here.
                  </HoverCardContent>
                </HoverCard>
              </ShowcaseSection>

              <ShowcaseSection title="Input">
                <Input placeholder="Enter text" />
              </ShowcaseSection>

              <ShowcaseSection title="Input Group">
                <div className="space-y-3">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>https://</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="example.com" />
                    <InputGroupButton>
                      <Button size="sm">Go</Button>
                    </InputGroupButton>
                  </InputGroup>
                  <InputGroup>
                    <InputGroupTextarea placeholder="Grouped textarea" />
                  </InputGroup>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Input OTP">
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </ShowcaseSection>

              <ShowcaseSection title="Label">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="name@example.com" />
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Pagination">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </ShowcaseSection>

              <ShowcaseSection title="Popover">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle>Popover Title</PopoverTitle>
                      <PopoverDescription>
                        Popover helper content.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </ShowcaseSection>

              <ShowcaseSection title="Progress">
                <div className="space-y-3">
                  <Progress value={progress} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgress((v) => (v >= 100 ? 0 : v + 10))}
                  >
                    Increment ({progress}%)
                  </Button>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Radio Group">
                <RadioGroup defaultValue="option-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-1" id="option-1" />
                    <Label htmlFor="option-1">Option 1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="option-2" id="option-2" />
                    <Label htmlFor="option-2">Option 2</Label>
                  </div>
                </RadioGroup>
              </ShowcaseSection>

              <ShowcaseSection title="Resizable">
                <ResizablePanelGroup className="min-h-30 rounded-lg border">
                  <ResizablePanel defaultSize={50} className="p-3">
                    Left Panel
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50} className="p-3">
                    Right Panel
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ShowcaseSection>

              <ShowcaseSection title="Scroll Area">
                <ScrollArea className="h-28 rounded-md border p-3">
                  <div className="space-y-2 text-sm">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <p key={i}>Scrollable item {i + 1}</p>
                    ))}
                  </div>
                </ScrollArea>
              </ShowcaseSection>

              <ShowcaseSection title="Select">
                <Select defaultValue="starter">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </ShowcaseSection>

              <ShowcaseSection title="Separator">
                <div className="space-y-2">
                  <p>Top content</p>
                  <Separator />
                  <p>Bottom content</p>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Sheet">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet panel</SheetTitle>
                      <SheetDescription>
                        Slide-over preview content.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </ShowcaseSection>

              <ShowcaseSection
                title="Sidebar"
                className="xl:col-span-2"
                contentClassName="overflow-x-auto"
              >
                <div className="min-w-130 overflow-hidden rounded-md border">
                  <SidebarProvider className="h-56 min-h-0 overflow-hidden">
                    <div className="flex h-full w-full">
                      <Sidebar
                        collapsible="none"
                        className="h-full w-52 border-r"
                      >
                        <SidebarContent>
                          <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                              <SidebarMenu>
                                <SidebarMenuItem>
                                  <SidebarMenuButton>
                                    Dashboard
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                  <SidebarMenuButton>
                                    Settings
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </SidebarMenu>
                            </SidebarGroupContent>
                          </SidebarGroup>
                        </SidebarContent>
                      </Sidebar>
                      <SidebarInset className="p-3">
                        <p className="mt-3 text-sm text-muted-foreground">
                          Inset content area.
                        </p>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Skeleton">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[40%]" />
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Slider">
                <div className="space-y-3">
                  <Slider
                    value={slider}
                    onValueChange={setSlider}
                    max={100}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Value: {slider[0]}
                  </p>
                </div>
              </ShowcaseSection>

              <ShowcaseSection title="Sonner">
                <p className="text-sm text-muted-foreground">
                  Toaster is mounted for notifications.
                </p>
                <Toaster richColors closeButton />
              </ShowcaseSection>

              <ShowcaseSection title="Switch">
                <div className="flex items-center gap-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane mode</Label>
                </div>
              </ShowcaseSection>
            </div>
          </section>

          <section id="data-navigation" className="scroll-mt-8 space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Data & Navigation
              </h2>
              <p className="text-sm text-muted-foreground">
                Structured data views and navigational components.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ShowcaseSection
                title="Table"
                className="xl:col-span-2"
                contentClassName="overflow-x-auto"
              >
                <Table className="min-w-105">
                  <TableCaption>Sample table data.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Portfolio</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Blog</TableCell>
                      <TableCell>Draft</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ShowcaseSection>

              <ShowcaseSection title="Tabs">
                <Tabs defaultValue="account">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="pt-2 text-sm">
                    Account tab content
                  </TabsContent>
                  <TabsContent value="security" className="pt-2 text-sm">
                    Security tab content
                  </TabsContent>
                </Tabs>
              </ShowcaseSection>

              <ShowcaseSection title="Textarea">
                <Textarea placeholder="Write a message..." />
              </ShowcaseSection>

              <ShowcaseSection title="Toggle">
                <Toggle aria-label="Toggle preview">Bold</Toggle>
              </ShowcaseSection>

              <ShowcaseSection title="Toggle Group">
                <ToggleGroup type="multiple" defaultValue={["left"]}>
                  <ToggleGroupItem value="left" aria-label="Align left">
                    Left
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">
                    Center
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">
                    Right
                  </ToggleGroupItem>
                </ToggleGroup>
              </ShowcaseSection>

              <ShowcaseSection title="Tooltip">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover for tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>Tooltip content</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </ShowcaseSection>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
