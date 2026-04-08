import React, { useEffect, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  className?: string;
  characters?: string;
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  className = '',
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?'
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only scramble when `text` changes to trigger the animation
    if (!text) return;
    
    let iteration = 0;
    setIsAnimating(true);
    let interval: ReturnType<typeof setInterval>;

    const maxIterations = text.length;

    interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split('')
          .map((_, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setIsAnimating(false);
        setDisplayText(text);
      }

      iteration += 1 / 3; // speed of settling per tick
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, characters]);

  return (
    <span className={`${className} ${isAnimating ? 'opacity-80' : 'opacity-100'}`}>
      {displayText}
    </span>
  );
};
