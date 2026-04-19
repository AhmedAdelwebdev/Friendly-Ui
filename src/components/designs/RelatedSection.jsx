'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DesignCard } from '@/components/designs/DesignCard';

export const RelatedSection = ({ relatedItems }) => {
  return (
    <section className="bg-gray-50 py-10 border-t border-gray-100">
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-2xl font-heading text-gray-900 mb-2">You Might Also Like</h2>
            <p className="text-sm text-gray-400 font-medium tracking-tight">Hand-picked designs similar to this one</p>
          </div>
          <Link href="/designs" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all text-sm tracking-widest">
            Browse All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-products gap-4">
          {relatedItems.map((relatedItem, index) => (
            <DesignCard key={index} item={relatedItem} index={index} related={true}/>
          ))}
        </div>
      </div>
    </section>
  )
};
