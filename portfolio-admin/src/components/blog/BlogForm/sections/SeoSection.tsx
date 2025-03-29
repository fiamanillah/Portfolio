import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SeoSectionProps {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    onSeoMetadataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onKeywordsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SeoSection({
    seoTitle,
    seoDescription,
    seoKeywords,
    onSeoMetadataChange,
    onKeywordsChange,
}: SeoSectionProps) {
    return (
        <>
            <div className="sm:col-span-2 ">
                <Label htmlFor="seoMetadata.title" className="text-lg font-semibold">
                    SEO Title
                </Label>
                <Input
                    type="text"
                    placeholder="Enter SEO title"
                    name="title"
                    defaultValue={seoTitle}
                    onChange={onSeoMetadataChange}
                />
            </div>
            <div className="sm:row-span-2">
                <Label htmlFor="seoMetadata.description" className="text-lg font-semibold">
                    SEO Description
                </Label>
                <Textarea
                    placeholder="Enter SEO description"
                    name="description"
                    defaultValue={seoDescription}
                    onChange={onSeoMetadataChange}
                    className="resize-none h-48"
                />
            </div>
            <div className="sm:col-span-2 ">
                <Label htmlFor="seoMetadata.keywords" className="text-lg font-semibold">
                    SEO Keywords
                </Label>
                <Input
                    type="text"
                    placeholder="Enter keywords separated by commas"
                    name="keywords"
                    defaultValue={seoKeywords}
                    onChange={onKeywordsChange}
                />
            </div>
        </>
    );
}
