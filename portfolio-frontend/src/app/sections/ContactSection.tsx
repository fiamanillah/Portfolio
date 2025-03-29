import React from 'react';
import ContactForm from '@/components/HomePage/ContactForm';
import Section from '@/components/HomePage/Section';
import HugeiconsMailOpen from '@/assets/icons/HugeiconsMailOpen';
import SiPhoneDuotone from '@/assets/icons/SiPhoneDuotone';
import AkarIconsLocation from '@/assets/icons/AkarIconsLocation';
import MingcuteFacebookLine from '@/assets/icons/MingcuteFacebookLine';
import JamLinkedinCircle from '@/assets/icons/JamLinkedinCircle';
import RaphaelGithubalt from '@/assets/icons/RaphaelGithubalt';
import contact from '@/assets/elements/contact.gif';
import Image from 'next/image';

const ContactSection: React.FC = () => {
    return (
        <Section className={'relative z-20 min-h-screen flex items-center'}>
            <div className="text-center py-10 mobile-lg:w-9/12 mx-auto">
                <h1>Contact</h1>
                <p>
                    Whether you have a project in mind, need a consultation, have a job offer or
                    just want to connect, feel free to reach out. Let&apos;s build something amazing
                    together!
                </p>
            </div>
            <div className="flex gap-4 max-tablet-lg:flex-col">
                <div className="basis-1/3 bg-card p-4 border border-border rounded-xl">
                    <h1></h1>
                    <Image src={contact} alt="Contact" className="w-[50%] mx-auto" />
                    <div className="flex flex-col gap-3">
                        <span className="flex items-center text-primary text-xl gap-2 font-bold">
                            <HugeiconsMailOpen />
                            <a
                                href="mailto:fi@amanillah.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline font-bold hover:text-primary/90 translate-y-1"
                            >
                                fi@amanillah.com
                            </a>
                        </span>
                        <span className="flex items-center text-primary text-xl gap-2 font-bold">
                            <SiPhoneDuotone />
                            <a
                                href="https://wa.link/tghi4g"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline font-bold hover:text-primary/90 translate-y-1"
                            >
                                +8801608505647
                            </a>
                        </span>
                        <span className="flex items-center text-primary text-xl gap-2 font-bold">
                            <AkarIconsLocation />
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline font-bold hover:text-primary/90 translate-y-1"
                            >
                                Mirpur 1, Dhaka, Bangladesh
                            </a>
                        </span>
                    </div>
                    <div className="flex gap-3 text-4xl mt-4">
                        <a
                            href="https://www.facebook.com/fiamanillah.b2/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MingcuteFacebookLine />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/fi-amanillah/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <JamLinkedinCircle />
                        </a>
                        <a
                            href="https://github.com/fiamanillah"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <RaphaelGithubalt />
                        </a>
                    </div>
                </div>
                <div className="basis-2/3">
                    <ContactForm />
                </div>
            </div>
        </Section>
    );
};

export default ContactSection;
