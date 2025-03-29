import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoProps {
    title: string;
    slug: string;
    excerpt: string;

    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function BasicInfoSection({ title, slug, excerpt, onInputChange }: BasicInfoProps) {
    return (
        <>
            <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="title" className="text-lg font-semibold">
                    Title
                </Label>
                <Input
                    type="text"
                    placeholder="Enter the blog title"
                    name="title"
                    defaultValue={title}
                    onChange={onInputChange}
                    required
                    className="!text-3xl !py-6 font-semibold"
                />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="slug" className="text-lg font-semibold">
                    Slug
                </Label>
                <Input
                    type="text"
                    placeholder="Enter the blog slug"
                    name="slug"
                    defaultValue={slug}
                    onChange={onInputChange}
                    required
                />
            </div>
            <div className="sm:row-span-2">
                <Label htmlFor="excerpt" className="text-lg font-semibold">
                    Excerpt
                </Label>
                <Textarea
                    placeholder="Enter a short excerpt or summary for the blog post"
                    name="excerpt"
                    defaultValue={excerpt}
                    onChange={onInputChange}
                    className="resize-none h-48"
                />
            </div>
        </>
    );
}
