// src/app/contact/page.tsx
export default function ContactPage() {
  return (
    <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-md max-w-2xl mx-auto my-12 space-y-6">
      <h1 className="text-3xl font-bold">📬 Contact</h1>
      <p className="text-lg text-muted-foreground">
        You can contact me via the links below.
      </p>

      <ul className="space-y-4">
        <li>
          <a
            href="mailto:kgh9002@icloud.com"
            className="text-blue-600 hover:underline"
          >
            ✉️ Email: kgh9002@icloud.com
          </a>
        </li>
        <li>
          <a
            href="https://github.com/Kim-kyuho"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            💻 GitHub: @Kim-kyuho
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            🔗 LinkedIn: kgh9002
          </a>
        </li>
      </ul>
    </div>
  );
}