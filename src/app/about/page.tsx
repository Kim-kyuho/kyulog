// src/app/about/page.tsx
export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Introduction Section (Top Card) */}
      <div className="group bg-white hover:bg-sky-200 dark:hover:bg-gray-800 shadow-xl transition duration-300 hover:shadow-sky-200/50 dark:hover:shadow-none dark:bg-gray-800 rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-950 dark:text-gray-100">
          問い続けるビルダー(Doubt-Driven Builder) 
        </h1>
        <p className="text-lg leading-7 text-blue-950 dark:text-gray-100 transition duration-300 mb-1">
          技術や設計を鵜呑みにせず、常に「なぜそうなっているのか」を考えることを大切にしています。
          単にコードを書くのではなく、システム全体の文脈や構造、そして設計に至るまでの思考を理解することに価値を感じています。
        </p>
      </div>

      {/* Qualifications & Skills Section (Bottom Card) */}
      <div className="group bg-white hover:bg-pink-200 dark:hover:bg-gray-800 shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-none transition duration-300 dark:bg-gray-800 rounded-xl p-3 mb-8">
        <p className="text-lg leading-7 text-red-950 dark:text-gray-100 transition duration-300 mb-1">
          <strong>保有資格:</strong> 日本語能力試験N1、(韓国)情報処理技師資格
        </p>
      </div>

      <div className="group bg-white hover:bg-emerald-200 dark:hover:bg-gray-800 shadow-xl hover:shadow-emerald-200/50 dark:hover:shadow-none transition duration-300 dark:bg-gray-800 rounded-xl p-3">
        <p className="text-lg font-bold text-yellow-950 dark:text-gray-100 transition duration-300 mb-2">
          使用スキル:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { src: "csharp.svg", label: "C#" },
            { src: "java.svg", label: "Java" },
            { src: "javascript.svg", label: "JavaScript" },
            { src: "typescript.svg", label: "TypeScript" },
            { src: "react.svg", label: "React" },
            { src: "nextjs.svg", label: "Next.js" },
            { src: "aspnet.svg", label: "ASP.NET" },
            { src: "oracle.svg", label: "Oracle DB" },
            { src: "sqlserver.svg", label: "SQL Server" },
            { src: "postgresql.svg", label: "PostgreSQL" },
          ].map((tech, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-4 rounded-lg shadow-md bg-white/50 dark:bg-gray-900 transition-transform hover:scale-105 justify-start"
            >
              <img src={`/tech-icons/${tech.src}`} alt={tech.label} className="w-7 h-7" />
              <span className="text-gray-800 dark:text-gray-100 font-medium">{tech.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
