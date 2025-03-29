import Link from 'next/link';
import Section from '../HomePage/Section';
import { ModeToggle } from '../theme/theme-toggle';
import { Button } from '../ui/button';
import logo from '@/assets/images/logo.svg';
import Image from 'next/image';
import NavMenu from './NavMenu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <Section className="bg-background/60 backdrop-blur-lg py-4 border-b border-border sticky top-0 z-50">
            <div className="flex justify-between items-center">
                <h1 className="basis-1/6 flex justify-center items-center">
                    <Link
                        href="/"
                        className="text-primary text-2xl font-bold hover:text-primary no-underline text-nowrap select-none flex items-center gap-2 h-10 max-mobile-sm:h-8"
                    >
                        <Image
                            src={logo}
                            alt="Fi Amanillah"
                            className="h-full max-w-10 -translate-y-1"
                        />
                        Fi Amanillah
                    </Link>
                </h1>
                <div className="max-tablet-lg:hidden basis-4/6 flex justify-center">
                    <NavMenu />
                </div>
                <div className="basis-1/6 flex items-center justify-end gap-2">
                    <Link
                        href="https://drive.google.com/file/d/1nIK9SN-77GZAqTJoYORz8YPgsqxuUl7G/view?usp=drive_link"
                        target="_blank"
                    >
                        <Button className="font-bold">Resume</Button>
                    </Link>
                    <ModeToggle />
                    <div className="hidden max-tablet-lg:block">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-10 h-10 rounded-full">
                                    <MenuIcon />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetTitle>Menu</SheetTitle>
                                <NavMenu />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Header;
