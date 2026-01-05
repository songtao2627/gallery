import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

const LottieBackground: React.FC = () => {
  // REPLACE THIS URL WITH YOUR CHOSEN LOTTIE FILE JSON URL
  // Search for: "Fluid liquid waves", "Abstract colorful ribbons"
  // Recommended colors: Cyan, Lime Green, Yellow, Bright Blue
  // REPLACE THIS URL WITH YOUR CHOSEN LOTTIE FILE JSON URL
  // You can find free animations on LottieFiles.com.
  // Example: "https://lottie.host/..." or download a JSON and put it in public/
  const LOTTIE_URL = "https://assets9.lottiefiles.com/packages/lf20_5njp3vgg.json"; // Placeholder: Liquid Wave

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.8,
        backgroundColor: '#f8fafc', // bg-slate-50 equivalent
        overflow: 'hidden'
      }}
    >
      <Player
        autoplay
        loop
        src={LOTTIE_URL}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Ensures it covers the screen
        }}
        renderer="svg"
      />
    </div>
  );
};

export default LottieBackground;
