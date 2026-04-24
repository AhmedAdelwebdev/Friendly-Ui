'use client';

import { Mail, MessageCircle, Briefcase, Award, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const skills = [
    { name: 'UI/UX Design', level: '95%' },
    { name: 'Web Development', level: '90%' },
    { name: 'Mobile App Design', level: '85%' },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 pb-16 lg:pb-24 overflow-hidden reveal animate-up">
        <div className="mx-auto px-4 sm:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image Area */}
            <div className="relative w-full max-w-sm animate-zoom-in reveal animate-up">
              <div className="absolute inset-0 m-auto size-3/4 dark:bg-primary/50 blur-3xl rounded-full"></div>
              <div className="relative z-10 aspect-square rotate-2 hover:rotate-0 duration-500 reveal animate-up">
                <Image src="/Friendly-Ui.png" className="size-full" width={100} height={100} alt="" unoptimized />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left space-y-5 animate-fade-in-left">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs shadow-sm">
                Hello there, I'm Ahmed Adel
              </div>
              <h1 className="text-3xl lg:text-5xl font-heading text-gray-900 leading-tight">
                Creative <span className="text-primary">Friendly</span> Experiences
              </h1>
              <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                I'm a passionate UI/UX Designer and Creative Developer dedicated to building clean, aesthetic, and user-centric interfaces.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4 animate-fade-in-up delay-200">
                <Link href="https://wa.me/201044197802" target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-8 py-3 rounded-2xl text-base hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg">
                  <MessageCircle size={18} /> WhatsApp Me
                </Link>
                <Link href="mailto:friendlyui.ahmed@gmail.com" className="border border-primary/20 text-primary px-8 py-3 rounded-2xl text-base hover:bg-primary/5 transition-all flex items-center gap-2">
                  <Mail size={18} /> Contact Email
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100/50 py-12 lg:py-16 animate-fade-in-up reveal animate-up">
        <div className="mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <StatCard icon={<Briefcase size={24} />} title="3+ Years Exp." desc="Designing for global clients since 2023." />
            <StatCard icon={<Zap size={24} />} title="Fast Delivery" desc="High-quality results with maximum efficiency." />
            <StatCard icon={<Award size={24} />} title="Award Winning" desc="Recognized for excellence in UI design." />
          </div>
        </div>
      </section>

      {/* Skills & Bio */}
      <section className="py-16 lg:py-24 animate-fade-in-up">
        <div className="mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-2xl lg:text-4xl font-heading text-gray-900">Why Friendly UI?</h2>
              <div className="space-y-4 text-sm lg:text-base text-gray-500 font-medium leading-relaxed">
                <p>Friendly UI is a mission to make digital interactions feel more human. I believe that good design should be felt, not just seen.</p>
                <p>When you choose to work with me, you're gaining a partner committed to your product's success.</p>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-2xl lg:text-3xl font-heading text-gray-900 mb-8">Main Skills</h2>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-gray-900 text-sm lg:text-base">{skill.name}</span>
                      <span className="text-primary text-sm">{skill.level}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
                      <div className="h-full bg-primary rounded-full" style={{ width: skill.level }} />
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

function StatCard({ icon, title, desc }) {
  return (
    <div className="text-center lg:text-left space-y-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up">
      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto lg:mx-0">
        {icon}
      </div>
      <h3 className="text-lg font-heading">{title}</h3>
      <p className="text-gray-500 text-sm font-medium">{desc}</p>
    </div>
  );
}

