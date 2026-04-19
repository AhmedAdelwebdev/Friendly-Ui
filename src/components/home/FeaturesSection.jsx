'use client';

import { features } from '@/lib/data';
import { Layout, Smartphone, Package, Layers } from 'lucide-react';

const iconMap = {
  Layout: <Layout size={24} />,
  Smartphone: <Smartphone size={24} />,
  Package: <Package size={24} />,
  Layers: <Layers size={24} />,
};

export const FeaturesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-gray-100/50">
      <div className=" mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-heading text-gray-900 mb-2">
            Why Choose Friendly UI?
          </h2>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            We build experiences that are beautiful, functional, and easy to use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={feature.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 transition-transform">
                {iconMap[feature.icon] || <Layers size={24} />}
              </div>
              <h3 className="text-lg  text-gray-900 mb-2 font-heading">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
