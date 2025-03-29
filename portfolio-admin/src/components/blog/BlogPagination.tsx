import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BlogPaginationProps {
    totalPages: number;
    currentPage: number;
    basePath: string;
}

export function BlogPagination({ totalPages, currentPage, basePath }: BlogPaginationProps) {
    const arrayFromKeys = [...Array(totalPages).keys()];

    return (
        <div className="flex flex-col items-center gap-4 mt-5">
            <div className="flex gap-2">
                <Link href={`${basePath}${currentPage - 1}`}>
                    <Button disabled={currentPage <= 1}>
                        <ArrowLeft />
                    </Button>
                </Link>

                {arrayFromKeys.map((item, index) => (
                    <Link href={`${basePath}${item + 1}`} key={index}>
                        <Button
                            variant={currentPage === item + 1 ? 'default' : 'ghost'}
                            disabled={currentPage === item + 1}
                        >
                            {item + 1}
                        </Button>
                    </Link>
                ))}

                <Link href={`${basePath}${currentPage + 1}`}>
                    <Button disabled={currentPage >= totalPages}>
                        <ArrowRight />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
