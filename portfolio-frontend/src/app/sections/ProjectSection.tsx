import React from 'react';
import Section from '@/components/HomePage/Section';
import projectImage from '@/assets/images/projects/1.png';
import projectImage2 from '@/assets/images/projects/2.png';
import projectImage3 from '@/assets/images/projects/3.png';
import projectImage4 from '@/assets/images/projects/4.png';
import projectImage5 from '@/assets/images/projects/5.png';
import { StaticImageData } from 'next/image'; // Correct type for static images
import ProjectParallaxStack from '@/components/HomePage/ProjectParallaxStack';

// Define the type for a project
export interface Project {
    id: number;
    title: string;
    description: string;
    image: StaticImageData; // Use StaticImageData for imported images
    color: string;
    techUsed: string[];
    demoLink: string;
    codeLink: string;
}

// Array of projects
const projects: Project[] = [
    {
        id: 1,
        title: 'ParcelPop - Smart Parcel Delivery',
        description:
            'ParcelPop is a secure and efficient parcel delivery platform that integrates advanced authentication and role-based access control. It allows users to send, track, and receive packages seamlessly, with a dedicated dashboard for managing orders.',
        image: projectImage,
        color: 'bg-card',

        techUsed: ['React js', 'Node js', 'Mongodb', 'Mongoose', 'Express js'],
        demoLink: 'https://parcelpop-project.web.app/',
        codeLink: 'https://github.com/fiamanillah/ParcelPop',
    },
    {
        id: 2,
        title: 'Weatherium - Live Weather Updates',
        description:
            'Weatherium is a real-time weather forecasting application that provides users with up-to-date weather conditions, temperature, humidity, wind speed, and more. It features a sleek UI, location-based weather updates, and supports multiple cities worldwide.',
        image: projectImage2,
        color: 'bg-card',

        techUsed: ['React js', 'Open Weather Api'],
        demoLink: 'https://weatherium.netlify.app/',
        codeLink: 'https://github.com/fiamanillah/Weatherium',
    },
    {
        id: 3,
        title: 'TalkMates - Connect, Learn, and Grow',
        description:
            'TalkMates is an online tutor booking platform that connects learners with expert tutors worldwide. It offers personalized learning experiences, flexible scheduling, secure payments, and global networking to help users enhance their skills in various subjects and languages. 🚀',
        image: projectImage3,
        color: 'bg-card',

        techUsed: ['React js', 'Node Js', 'Mongodb', 'Express js'],
        demoLink: 'https://ph-a11.web.app/',
        codeLink: 'https://github.com/fiamanillah/TalkMates',
    },
    {
        id: 4,
        title: 'EquiSports - Premium Sports Gear Hub',
        description:
            'EquiSports – A sleek and responsive e-commerce platform for sports enthusiasts to browse, purchase, and manage sports equipment. Features secure authentication, dynamic product management, and an interactive UI with smooth animations. Built with React, Tailwind CSS, Firebase, Node.js, Express.js, and MongoDB. 🚀',
        image: projectImage4,
        color: 'bg-card',

        techUsed: ['React js', 'Node Js', 'Mongodb', 'Express js'],
        demoLink: 'https://ph-assignment-10-79f51.web.app/',
        codeLink: 'https://github.com/fiamanillah/EquiSports',
    },
    {
        id: 5,
        title: 'Career Craft - Your Personalized Career Guide',
        description:
            'Career Craft is a comprehensive career counseling platform that provides students and professionals with expert career advice, skill assessments, and personalized career roadmaps. It integrates an AI-driven recommendation system for better decision-making.',
        image: projectImage5,
        color: 'bg-card',

        techUsed: ['React js', 'Node Js', 'Mongodb', 'Express js'],
        demoLink: 'https://ph-assignment9-fiamanillah.netlify.app/',
        codeLink: 'https://github.com/fiamanillah/PH-Assignment-9',
    },
];

const ProjectSection: React.FC = () => {
    return (
        <div className="relative">
            {/* Main Section */}
            <Section className={'py-10 relative'}>
                <div className="flex flex-col justify-center text-center py-10 w-2/3 mx-auto max-mobile-lg:w-full z-10">
                    <h1>Projects</h1>
                    <p>
                        Explore a collection of my projects that showcase my skills in web
                        development, problem-solving, and creating user-friendly applications. Each
                        project is built with modern technologies and designed to deliver a seamless
                        user experience.
                    </p>
                </div>

                {/* Parallax Stack */}
                <div>
                    <ProjectParallaxStack projects={projects as Project[]} />
                </div>

                {/* Gradient Blur Effect */}
                <div className="absolute top-0 inset-0 blur-[120px] -z-10">
                    <div
                        style={{
                            clipPath:
                                'polygon(0% 90.5%, 36.75% 77.5%, 73.07% 74.24%, 100% 68.25%, 92.28% 77.5%, 100% 100%, 87.37% 79.84%, 75% 75%, 57.48% 85.62%, 32.25% 58.25%, 32.25% 90.5%)',
                        }}
                        className="sticky top-0 h-[100vh] w-full object-cover -z-10 bg-gradient-to-r from-primary/60 to-destructive/50"
                    />
                </div>
            </Section>
        </div>
    );
};

export default ProjectSection;
