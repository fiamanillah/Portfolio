import Section from '@/components/HomePage/Section';
import Image from 'next/image';
import profile1 from '@/assets/images/profile1.png';
import HugeiconsUniversity from '@/assets/icons/HugeiconsUniversity';
import * as motion from 'motion/react-client';

const aboutText = `
    Hi, I'm Fi Amanillah, a passionate and detail-oriented MERN Stack Developer with expertise in building dynamic, responsive, and user-friendly web applications. 
    Proficient in React, Redux, Node.js, Express, MongoDB, and Mongoose, I specialize in crafting seamless full-stack solutions. My skill set also includes modern 
    front-end technologies like Tailwind CSS, JavaScript, HTML, and CSS, ensuring visually appealing and efficient designs. With a strong foundation in Linux and a 
    commitment to clean, maintainable code, I thrive on solving complex problems and delivering high-quality digital experiences. Let's build something amazing together!
`;

const educationData = [
    {
        id: 1,
        degree: 'Bachelor in Computer Science and Engineering',
        institution: 'European University of Bangladesh',
        duration: '2024 - present',
        icon: <HugeiconsUniversity />,
    },
    {
        id: 2,
        degree: 'Higher Secondary Certificate',
        institution: 'Milestone College, Dhaka',
        duration: '2020 - 2022',
        icon: <HugeiconsUniversity />,
    },
    {
        id: 3,
        degree: 'Secondary School Certificate',
        institution: 'Shandhani School and college',
        duration: '2020',
        icon: <HugeiconsUniversity />,
    },
];

const AboutSection = () => {
    return (
        <Section className="relative py-10">
            <div className="flex max-mobile-lg:flex-col-reverse gap-2 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="bg-card basis-2/12 rounded-lg border overflow-hidden"
                >
                    <div className="bg-muted flex justify-between items-center p-2">
                        <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 bg-red-500 rounded-full"></div>
                            <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full"></div>
                            <div className="w-3.5 h-3.5 bg-green-500 rounded-full"></div>
                        </div>
                        <p>@fiamanillah</p>
                    </div>
                    <div className="w-60">
                        <Image
                            src={profile1}
                            alt="Fi Amanillah"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="h-1 p-3 bg-muted"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="basis-10/12"
                >
                    <h1 className="mb-3">About me</h1>
                    <p className="text-xl max-mobile-lg:text-lg">{aboutText}</p>
                </motion.div>
            </div>

            <div className="py-5">
                <h1 className="py-2">Education</h1>
                <div className="space-y-4">
                    {educationData.map((education, index) => (
                        <motion.div
                            key={education.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{
                                duration: 0.6,
                                ease: 'easeOut',
                                delay: 0.2 * index,
                            }}
                            className="flex max-mobile-lg:flex-col justify-between bg-card p-4 border border-border rounded-lg"
                        >
                            <div className="flex gap-2">
                                <div className="border-l-4 border-primary pl-2">
                                    <h3>{education.degree}</h3>
                                    <span className="flex items-center gap-2">
                                        {education.icon} {education.institution}
                                    </span>
                                </div>
                            </div>
                            <div className="max-mobile-lg:mt-2">
                                <span>{education.duration}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

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
    );
};

export default AboutSection;
