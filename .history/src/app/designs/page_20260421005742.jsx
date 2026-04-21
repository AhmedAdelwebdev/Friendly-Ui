'use client';

import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/lib/DataContext';
import { DesignCard } from '@/components/designs/DesignCard';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useRef } from "react";

export default function DesignsPage() {
  const { items, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Product');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false); 
  const topRef = useRef(null);

  const itemsPerPage = 12;

  const types = ['Design', 'Product']

  // const types = useMemo(() => {
  //   return [...new Set(items.map(i => i.type || 'Product'))];
  // }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return items
      .map((item) => {
        let score = 0;

        const title = item.title?.toLowerCase() || '';
        const desc = item.description?.toLowerCase() || '';
        const tags = item.tags?.join(' ').toLowerCase() || '';

        // Exact match (أعلى حاجة)
        if (title === query) score += 100;

        // Starts with
        if (title.startsWith(query)) score += 50;

        // Includes
        if (title.includes(query)) score += 30;
        if (desc.includes(query)) score += 10;
        if (tags.includes(query)) score += 20;

        // Fuzzy (لو كتب جزء صغير)
        if (!score && query.length > 2) {
          const words = title.split(' ');
          if (words.some(w => w.startsWith(query))) score += 15;
        }

        return { ...item, score };
      })
      .filter(item => {
        const matchesType = item.type === activeType;
        return query ? item.score > 0 && matchesType : matchesType;
      })
      .sort((a, b) => b.score - a.score);
  }, [items, searchQuery, activeType]);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeType]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (currentPage > 1 || searchQuery || activeType) {
      const timer = setTimeout(() => {
        topRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  return (
    <div className="py-10 md:py-16">

      {/* Loading */}
      {loading && items.length === 0 && (
        <LoadingOverlay message="Exploring library..." />
      )}

      <div className="w-full">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-heading text-primary mb-3">Shop & Gallery</h1>
          <p className="text-gray-500 font-medium text-xs md:text-base">
            Explore our dynamic catalog of products and designs.
          </p>
        </div>

        {/* Search + Filters */}
        <div ref={topRef} className={`relative w-[90vw] sm:max-w-[80vw] md:max-w-3xl mx-auto p-1 rounded-[27px] sm:rounded-full shadow-sm mb-10 bg-primary`}>

          <div className="flex flex-wrap gap-4 items-center">

            {/* Search */}
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-42 py-2 text-lg bg-body border border-primary/20 rounded-full outline-none"
              />
              {/* Mobile Toggle Button */}
              <SlidersHorizontal
                onClick={() => setShowFilters(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 sm:hidden text-gray-400" size={18}
              />
            </div>


            {/* Types (Desktop) */}
            <div className="absolute right-1 h-11 hidden sm:flex bg-body border-l-2 border-primary p-1 pl-1.5 rounded-full w-fit">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3.5 py-2 rounded-full text-xs transition-all ${activeType === type
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-primary'
                    }`}
                >
                  {type}s
                </button>
              ))}
            </div>
          </div>

          {/* Types (Mobile Dropdown) */}
          {showFilters && (
            <div className="sm:hidden mt-2 bg-body p-1 rounded-full flex flex-wrap gap-2">
              {types.map((type) => (
                <button key={type} onClick={() => { setActiveType(type); }}
                  className={`px-3 py-3 rounded-full text-xs transition-all grow ${activeType === type
                    ? 'bg-primary text-white'
                    : 'bg-body text-gray-500'
                    }`}
                >
                  {type}s
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Grid */}
        <div className="w-screen w-full max-w-6xl min-h-96 px-4 overflow-hidden scroll-mt-24">
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid grid-products gap-4">
                {paginatedItems.map((item, index) => (
                  <DesignCard key={item.id} item={item} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="sticky sm:relative bottom-4 p-4 bg-white mx-auto rounded-xl flex justify-center items-center gap-2 mt-12 shadow-sm border border-gray-100">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <span className="text-gray-500 px-4">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center mx-auto w-full grid place-items-center">
              <X size={32} className="size-14 p-3.5 mx-auto text-red-400 mb-4 bg-red-400/20 rounded-full" />
              <h3 className="text-xl text-primary mb-1">No products Found</h3>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary text-sm hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}