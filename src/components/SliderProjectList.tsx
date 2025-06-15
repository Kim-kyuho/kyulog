'use client';

import { useEffect, useRef, useState } from 'react';
import KeenSlider from 'keen-slider';
import 'keen-slider/keen-slider.min.css';
import ProjectCard from './ProjectCard';
import type { KeenSliderInstance } from 'keen-slider';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Project = {
  title: string;
  description: string;
  image: string;
  link: string;
};

const sliderOptions = {
  loop: true,
  slides: {
    perView: 1,
    spacing: 0,
  },
  breakpoints: {
    '(min-width: 640px)': { slides: { perView: 2, spacing: 0 } },
    '(min-width: 1024px)': { slides: { perView: 3, spacing: 0 } },
  },
};

export default function SliderProjectList({ projects }: { projects: Project[] }) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [sliderInstance, setSliderInstance] = useState<KeenSliderInstance | null>(null);

  useEffect(() => {
    if (!sliderRef.current) return;
    const instance = new KeenSlider(sliderRef.current, sliderOptions);
    setSliderInstance(instance);
    return () => instance.destroy();
  }, []);

  return (
    <div className="relative w-full overflow-x-auto touch-pan-x scroll-smooth snap-x snap-mandatory">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => sliderInstance?.prev()}
          className="text-3xl text-gray-700 bg-white/30 backdrop-blur-md border border-white/40 rounded-full px-4 py-1 shadow-md hover:bg-white/50 transition-all"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => sliderInstance?.next()}
          className="text-3xl text-gray-700 bg-white/30 backdrop-blur-md border border-white/40 rounded-full px-4 py-1 shadow-md hover:bg-white/50 transition-all"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      <div ref={sliderRef} className="keen-slider flex">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="keen-slider__slide min-w-full sm:min-w-1/2 lg:min-w-1/3 px-2 box-border"
          >
            <ProjectCard {...project} />
          </div>
        ))}
      </div>
    </div>
  );
}