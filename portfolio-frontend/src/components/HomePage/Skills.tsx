'use client';

import { motion } from 'motion/react'; // Keep the motion import as it is
import TablerBrandRedux from '@/assets/icons/TablerBrandRedux';
import NoniconsReact16 from '@/assets/icons/NoniconsReact16';
import TeenyiconsTailwindSolid from '@/assets/icons/TeenyiconsTailwindSolid';
import NoniconsNode16 from '@/assets/icons/NoniconsNode16';
import SimpleIconsExpress from '@/assets/icons/SimpleIconsExpress';
import TablerBrandNextjs from '@/assets/icons/TablerBrandNextjs';
import SimpleIconsMongodb from '@/assets/icons/SimpleIconsMongodb';
import SimpleIconsMongoose from '@/assets/icons/SimpleIconsMongoose';
import UiwLinux from '@/assets/icons/UiwLinux';
import MingcuteVscodeFill from '@/assets/icons/MingcuteVscodeFill';
import DeviconPlainWebstorm from '@/assets/icons/DeviconPlainWebstorm';
import DeviconPlainPostman from '@/assets/icons/DeviconPlainPostman';
import TeenyiconsGitSolid from '@/assets/icons/TeenyiconsGitSolid';
import HugeiconsGithub from '@/assets/icons/HugeiconsGithub';
import { IconParkOutlineHtmlFive } from '@/assets/icons/IconParkOutlineHtmlFive';
import { FluentJavascript20Filled } from '@/assets/icons/FluentJavascript20Filled';
import { IconoirCss3 } from '@/assets/icons/IconoirCss3';
import { HugeiconsTypescript01 } from '@/assets/icons/HugeiconsTypescript01';
import { TablerServer } from '@/assets/icons/TablerServer';
import { SimpleIconsCpanel } from '@/assets/icons/SimpleIconsCpanel';
import { RiVercelFill } from '@/assets/icons/RiVercelFill';
import { TablerBrandDocker } from '@/assets/icons/TablerBrandDocker';

// Define the type for a skill
interface Skill {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Type for the icon component
    name: string; // Name of the skill
}

// Define the type for the categories object
interface Categories {
    [key: string]: Skill[]; // Each category is a key with an array of Skill objects
}

const Skills: React.FC = () => {
    // Define the categories object
    const categories: Categories = {
        language: [
            { icon: IconParkOutlineHtmlFive, name: 'Html' },
            { icon: IconoirCss3, name: 'Css' },
            { icon: FluentJavascript20Filled, name: 'Javascript' },
            { icon: HugeiconsTypescript01, name: 'Typescript' },
        ],
        frontend: [
            { icon: NoniconsReact16, name: 'React Js' },
            { icon: TablerBrandRedux, name: 'Redux' },
            { icon: TablerBrandNextjs, name: 'Next js' },
            { icon: TeenyiconsTailwindSolid, name: 'Tailwind Css' },
        ],
        backend: [
            { icon: NoniconsNode16, name: 'Node Js' },
            { icon: SimpleIconsExpress, name: 'Express Js' },
        ],
        database: [
            { icon: SimpleIconsMongodb, name: 'MongoDb' },
            { icon: SimpleIconsMongoose, name: 'Mongoose' },
        ],

        DevOps: [
            { icon: TeenyiconsGitSolid, name: 'Git' },
            { icon: HugeiconsGithub, name: 'Github' },
            { icon: TablerBrandDocker, name: 'Docker' },

            { icon: TablerServer, name: 'Vps' },
            { icon: UiwLinux, name: 'Linux' },
            { icon: SimpleIconsCpanel, name: 'Cpanel' },
            { icon: RiVercelFill, name: 'Vercel' },
        ],
        tools: [
            { icon: MingcuteVscodeFill, name: 'Vs code' },
            { icon: DeviconPlainWebstorm, name: 'Webstorm' },
            { icon: DeviconPlainPostman, name: 'Postman' },
        ],
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            {Object.entries(categories).map(([category, skills]) => (
                <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-semibold mb-3 capitalize">{category}</h2>
                    <div className="flex flex-wrap justify-start items-center gap-5">
                        {skills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1, // Cascading effect
                                    ease: 'easeOut',
                                }}
                                viewport={{ once: true }}
                                className="bg-secondary text-secondary-foreground text-2xl py-2 px-3 font-bold flex gap-2 items-center justify-center border border-border rounded-lg hover:bg-secondary/90 hover:shadow-lg"
                            >
                                <skill.icon className="w-7 h-7" />
                                {skill.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Skills;
