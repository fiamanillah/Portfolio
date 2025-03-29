'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'sonner';

interface Category {
    _id: string;
    category: string;
    description?: string;
}

type BlogCategorySelectProps = {
    onCategoryChange: (categoryId: string) => void;
    defaultValue?: string;
    className?: string;
};

export default function BlogCategorySelect({
    onCategoryChange,
    defaultValue = '',
    className = '',
}: BlogCategorySelectProps) {
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/api/blog/categories');

            if (!response.data.success) {
                throw new Error('Failed to fetch categories');
            }

            setCategories(response.data.data);

            if (
                defaultValue &&
                response.data.data.some((cat: Category) => cat._id === defaultValue)
            ) {
                setSelectedCategoryId(defaultValue);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    }, [defaultValue]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            toast('Category name is required');
            return;
        }

        try {
            const response = await axiosInstance.post('/api/blog/categories', {
                category: categoryName.trim(),
                description: categoryDescription.trim(),
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to add category');
            }

            const newCategory = response.data.data;
            setCategories(prev => [...prev, newCategory]);
            setSelectedCategoryId(newCategory._id);
            onCategoryChange(newCategory._id);

            // Reset form and close dialog
            setCategoryName('');
            setCategoryDescription('');
            setIsDialogOpen(false);

            toast('Category added successfully');
        } catch (error) {
            console.error('Error adding category:', error);
            toast('Failed to add category');
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        onCategoryChange(categoryId);
    };

    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);

    if (isLoading) {
        return (
            <Select disabled>
                <SelectTrigger className={`w-full ${className}`}>
                    <SelectValue placeholder="Loading categories..." />
                </SelectTrigger>
            </Select>
        );
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            <Select onValueChange={handleCategorySelect} value={selectedCategoryId || undefined}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category">
                        {selectedCategory?.category || ''}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category._id} value={category._id}>
                            {category.category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new blog category.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryName">Category Name *</Label>
                            <Input
                                id="categoryName"
                                placeholder="e.g. Technology, Business"
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryDescription">Description</Label>
                            <Textarea
                                id="categoryDescription"
                                placeholder="Optional description for the category"
                                value={categoryDescription}
                                onChange={e => setCategoryDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddCategory} disabled={!categoryName.trim()}>
                                Add Category
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
