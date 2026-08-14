import { useEffect, useState } from "react";
import { BIBLE_VERSES } from "@/shared/constants/bible-verses";

export function useBibleVerseRotator() {
  const [currentVerse, setCurrentVerse] = useState(BIBLE_VERSES[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    setCurrentVerse(BIBLE_VERSES[randomIndex]);

    const verseInterval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
      setCurrentVerse(BIBLE_VERSES[nextIndex]);
    }, 3000);

    return () => clearInterval(verseInterval);
  }, []);

  return currentVerse;
}
