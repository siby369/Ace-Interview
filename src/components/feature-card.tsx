'use client';

import React from 'react';
import Floating3DCard from './floating-3d-card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  delay = 0 
}) => {
  return (
    <Floating3DCard 
      className="h-full"
      intensity={10}
    >
      <div 
        className="group relative h-full p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-primary/50 animate-fade-up"
        style={{
          animationDelay: `${delay}s`,
        }}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold font-headline text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

      </div>
    </Floating3DCard>
  );
};

export default FeatureCard;

