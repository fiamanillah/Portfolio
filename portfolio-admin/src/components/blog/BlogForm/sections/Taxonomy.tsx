import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BlogCategorySelect from './BlogCategorySelect';

interface TaxonomySectionProps {
    category: string;
    tags: string;
    onCategoryChange: (categoryId: string) => void;
    onTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TaxonomySection({
    category,
    tags,
    onCategoryChange,
    onTagsChange,
}: TaxonomySectionProps) {
    return (
        <>
            <div className="sm:col-span-2">
                <Label htmlFor="tags" className="text-lg font-semibold">
                    Tags
                </Label>
                <Input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    name="tags"
                    defaultValue={tags}
                    onChange={onTagsChange}
                />
            </div>
            <div className="">
                <Label htmlFor="category" className="text-lg font-semibold">
                    Category
                </Label>
                <BlogCategorySelect onCategoryChange={onCategoryChange} defaultValue={category} />
            </div>
        </>
    );
}
