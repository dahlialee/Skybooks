import React, { useState, useEffect } from 'react';

const banners = [
  '/image/icon/slider_1.webp',
  '/image/icon/slider_2.webp',
  '/image/icon/slider_3.webp',
  '/image/icon/slider_5.webp'
];

const BannerBackground = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {banners.map((banner, index) => (
        <img
          key={index}
          src={banner}
          alt={`Banner ${index + 1}`}
          className={`
            absolute top-0 left-0 w-full h-full object-cover
            transition-opacity duration-1000 ease-in-out
            ${index === current ? 'opacity-100' : 'opacity-0'}
          `}
        />
      ))}
    </div>
  );
};

export default BannerBackground;
