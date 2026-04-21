'use client';

import { Mail, MessageCircle, ArrowUpRight, Briefcase, Award, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function AboutPage() {
  const skills = [
    { name: 'UI/UX Design', level: '95%' },
    { name: 'Web Development', level: '90%' },
    { name: 'Mobile App Design', level: '85%' },
  ];

  return (
    <div className="min-h-screen  pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 overflow-hidden">
        <div className=" mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Image Area */}
            <div className="relative w-full max-w-sm">
              <div className="aspect-square rounded-3xl relative overflow-hidden shadow-lg rotate-2 group hover:rotate-0 transition-transform duration-500 border-4 border-white">
                <Image src="/Friendly-Ui.png" className="size-full" width={100} height={100} alt="" unoptimized/>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left space-y-5">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs  shadow-sm">
                👋 Hello there, I'm Ahmed Adel
              </div>
              <h1 className="text-3xl md:text-5xl font-heading text-gray-900 leading-tight">
                Creative <span className="text-primary italic">Friendly</span> Experiences
              </h1>
              <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                I'm a passionate UI/UX Designer and Creative Developer dedicated to building clean, aesthetic, and user-centric interfaces.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                <Link href="https://t.me/Friendly_Ui" target="_blank" rel="noopener noreferrer" className="bg-[#0088cc] text-white px-8 py-3 rounded-2xl  text-base hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#0088cc]/20">
                  <MessageCircle size={18} /> Telegram Me
                </Link>
                <Link href="mailto:friendlyui.ahmed@gmail.com" className="border border-primary/20 text-primary px-8 py-3 rounded-2xl  text-base hover:bg-primary/5 transition-all flex items-center gap-2">
                  <Mail size={18} /> Contact Email
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100/50 py-12 md:py-16">
        <div className=" mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={<Briefcase size={24} />} title="3+ Years Exp." desc="Designing for global clients since 2023." delay={0} />
            <StatCard icon={<Zap size={24} />} title="Fast Delivery" desc="High-quality results with maximum efficiency." delay={100} />
            <StatCard icon={<Award size={24} />} title="Award Winning" desc="Recognized for excellence in UI design." delay={200} />
          </div>
        </div>
      </section>

      {/* Skills & Bio */}
      <section className="py-16 md:py-24">
        <div className=" mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-2xl md:text-4xl font-heading text-gray-900">Why Friendly UI?</h2>
              <div className="space-y-4 text-sm md:text-base text-gray-500 font-medium leading-relaxed">
                <p>Friendly UI is a mission to make digital interactions feel more human. I believe that good design should be felt, not just seen.</p>
                <p>When you choose to work with me, you're gaining a partner committed to your product's success.</p>
              </div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-heading text-gray-900 mb-8">Main Skills</h2>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className=" text-gray-900 text-sm md:text-base">{skill.name}</span>
                      <span className="text-primary  text-sm">{skill.level}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: skill.level }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, title, desc, delay = 0 }) {
  return (
    <div className="text-center md:text-left space-y-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto md:mx-0">
        {icon}
      </div>
      <h3 className="text-lg  font-heading">{title}</h3>
      <p className="text-gray-500 text-sm font-medium">{desc}</p>
    </div>
  );
}

function SocialLink({ icon, href }) {
  return (
    <a href={href} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all border border-gray-100 shadow-sm hover:shadow-md">
      {icon}
    </a>
  );
}
