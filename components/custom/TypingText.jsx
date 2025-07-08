import React, { useEffect, useState } from 'react';

function TypingText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <div className="whitespace-pre-line text-white">{displayedText}</div>;
}

export default TypingText;
