// utils/readingTimeCalculator.ts

const calculateReadingTime = (content: string): number => {
    // Average reading speed in words per minute
    const WORDS_PER_MINUTE = 200;

    // Remove HTML tags if present and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate reading time in minutes and round up
    return Math.ceil(wordCount / WORDS_PER_MINUTE);
};

export default calculateReadingTime;
