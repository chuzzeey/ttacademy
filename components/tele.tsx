import React from 'react';

const TelegramButton = () => {
  return (
    <>
      <a
        href="https://t.me/techblazeracademy"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-[#00d98a] to-[#00965f] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#00d98a]/25 transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.54-.44.68-.89.42l-2.49-1.84-1.2 1.16c-.13.13-.24.24-.49.24l.17-2.47 4.63-4.18c.2-.18-.05-.28-.31-.1l-5.72 3.6-2.47-.78c-.54-.17-.55-.54.11-.8l9.66-3.72c.45-.16.84.11.7.81z"/>
        </svg>
        Join our telegram community
      </a>
    </>
  );
};

export default TelegramButton;