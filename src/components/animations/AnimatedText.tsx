import React from 'react';
import { m, Variants } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', once = true }) => {
  const chars = text.split("");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.03, 
        delayChildren: 0.04 * i 
      },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(8px)", 
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <m.div
      className={`overflow-hidden flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {chars.map((char, index) => (
        <m.span variants={child} key={index}>
          {char === " " ? "\u00A0" : char}
        </m.span>
      ))}
    </m.div>
  );
};
