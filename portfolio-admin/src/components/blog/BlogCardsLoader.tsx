import { Skeleton } from '@/components/ui/skeleton';

export default function BlogCardsLoader() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 py-4 ">
            {Array(6)
                .fill(0)
                .map((_, index) => (
                    <div key={index} className="space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                ))}
        </div>
    );
}
