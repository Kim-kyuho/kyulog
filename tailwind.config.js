// tailwind.config.js
module.exports = {
    darkMode: "media",
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
      "./scripts/**/*.{ts,js}",
      "./posts/**/*.{md,mdx}",      // 블로그 글까지 포함
      "./public/**/*.html"          // 혹시 정적 html 쓰는 경우까지 커버
    ],
    theme: {
      extend: {
        colors: {
          pastel: {
            blue: "#a7d3f2",
            pink: "#f9c5d1",
            green: "#b7e4c7",
            yellow: "#fce38a",
            purple: "#cdb4db",
            gray: "#f8f9fa",
          },
        },
        typography: {
          DEFAULT: {
            css: {
              'code': {
                color: '#e11d48', // 예시: rose-600
                backgroundColor: '#f3f4f6', // gray-100
                padding: '0.2em 0.4em',
                borderRadius: '0.25rem',
                fontWeight: '500',
              },
              'pre code': {
                backgroundColor: 'transparent',
                padding: '0',
                borderRadius: '0',
              },
              pre: {
                backgroundColor: '#1f2937', // gray-800
                color: '#f9fafb',
                padding: '1em',
                borderRadius: '0.5rem',
                overflowX: 'auto',
              },
            },
          },
          dark: {
            css: {
              color: '#d1d5db', // 다크모드 기본 텍스트 색상 (gray-300)
              a: { color: '#93c5fd' }, // 링크 색상 (blue-300)
              strong: { color: '#f9fafb' },
              code: { color: '#fca5a5' }, // red-300
              'pre code': {
                backgroundColor: 'transparent',
              },
              pre: {
                backgroundColor: '#1f2937',
                color: '#f9fafb',
              },
            },
          },
        },
      },
    },
    plugins: [require('@tailwindcss/typography')],
    
  };