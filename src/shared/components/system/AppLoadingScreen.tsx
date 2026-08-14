import { useEffect, useState } from "react";
import { BIBLE_VERSES } from "../constant/bible-verses";

interface AppLoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function AppLoadingScreen({
  isVisible,
  onComplete,
}: AppLoadingScreenProps) {
  const [currentVerse, setCurrentVerse] = useState(BIBLE_VERSES[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Set initial random verse
      const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
      setCurrentVerse(BIBLE_VERSES[randomIndex]);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      // Change verse every 3 seconds
      const verseInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
        setCurrentVerse(BIBLE_VERSES[randomIndex]);
      }, 3000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(verseInterval);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Cross Icon */}
      <div className="mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-church-orange">
          <svg
            className="text-white"
            fill="none"
            height="32"
            viewBox="0 0 24 24"
            width="32"
          >
            <path
              d="M12 2L12 22M2 12L22 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mb-6">
        <h2 className="font-medium text-gray-800 text-xl">Loading.</h2>
      </div>

      {/* Bible Verse */}
      <div className="mb-8 max-w-lg px-6 text-center">
        <p className="text-gray-600 text-sm italic leading-relaxed">
          {currentVerse.verse}
        </p>
        <p className="mt-2 text-gray-500 text-xs">- {currentVerse.reference}</p>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-80 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-church-orange transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
