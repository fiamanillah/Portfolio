'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BlogStatusCheckboxesProps {
    isFeatured: boolean;
    onFeaturedChange: (isFeatured: boolean) => void;
}

export function BlogStatusCheckboxes({ isFeatured, onFeaturedChange }: BlogStatusCheckboxesProps) {
    return (
        <div className="flex self-center gap-4 items-center">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={checked => onFeaturedChange(!!checked)}
                />
                <Label htmlFor="featured">Feature This Post</Label>
            </div>
        </div>
    );
}
