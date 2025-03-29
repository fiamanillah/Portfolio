import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function loading() {
    return (
        <div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}
