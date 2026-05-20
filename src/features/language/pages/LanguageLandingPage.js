import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Brain,
  Code2,
  FileText,
  Layers3,
  Play,
  Sparkles,
} from "lucide-react";

const languageMeta = {
  javascript: {
    name: "JavaScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    color: "#f7df1e",
    description:
      "Build interactive web apps, understand the runtime, and practice modern frontend and backend patterns.",
  },
  python: {
    name: "Python",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    color: "#3776ab",
    description:
      "Learn clean syntax, automation, data structures, APIs, and practical problem solving with Python.",
  },
  java: {
    name: "Java",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
    color: "#e76f00",
    description:
      "Master object-oriented design, strong typing, backend foundations, and production-style Java patterns.",
  },
  cpp: {
    name: "C++",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
    color: "#659ad2",
    description:
      "Understand memory, object-oriented design, performance, pointers, and the machinery behind modern systems.",
  },
  "c++": {
    name: "C++",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
    color: "#659ad2",
    description:
      "Understand memory, object-oriented design, performance, pointers, and the machinery behind modern systems.",
  },
  c: {
    name: "C",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg",
    color: "#555555",
    description:
      "Study low-level programming, memory layout, systems concepts, and precise control over data.",
  },
  rust: {
    name: "Rust",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
    color: "#dea584",
    description:
      "Learn ownership, borrowing, safety, performance, and modern systems programming without fear.",
  },
  go: {
    name: "Go",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
    color: "#00add8",
    description:
      "Build fast services, learn concurrency, and work with simple, pragmatic backend patterns.",
  },
  php: {
    name: "PHP",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
    color: "#777bb4",
    description:
      "Explore server-side development, web fundamentals, forms, APIs, and practical application structure.",
  },
  sql: {
    name: "SQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    color: "#336791",
    description:
      "Query data, shape tables, reason about joins, and learn database habits that scale.",
  },
};

const generalCourses = [
  {
    title: "Core Documentation Path",
    tag: "Docs",
    icon: FileText,
    description: "Read curated guides, examples, syntax notes, and reference material.",
    href: "/hub",
  },
  {
    title: "Practice Playground",
    tag: "Hands-on",
    icon: Play,
    description: "Experiment with code, run snippets, and test ideas as you learn.",
    href: "/playground",
  },
  {
    title: "Daily Challenge",
    tag: "Routine",
    icon: Brain,
    description: "Build a steady habit with small problems and feedback.",
    href: "/daily-challenge",
  },
];

const courseCatalog = {
  cpp: [
    {
      title: "OOPs C++",
      tag: "Interactive Course",
      icon: Boxes,
      description:
        "Classes, constructors, inheritance, polymorphism, design principles, and real coding challenges.",
      href: "/learn/oops-cpp",
      accent: "#b8ff00",
    },
    {
      title: "Pointers C++",
      tag: "Memory Course",
      icon: Layers3,
      description:
        "Addresses, dereferencing, nullptr, arrays, 2D arrays, smart pointers, callbacks, and safety.",
      href: "/learn/pointers-cpp",
      accent: "#00d4ff",
    },
  ],
  "c++": [
    {
      title: "OOPs C++",
      tag: "Interactive Course",
      icon: Boxes,
      description:
        "Classes, constructors, inheritance, polymorphism, design principles, and real coding challenges.",
      href: "/learn/oops-cpp",
      accent: "#b8ff00",
    },
    {
      title: "Pointers C++",
      tag: "Memory Course",
      icon: Layers3,
      description:
        "Addresses, dereferencing, nullptr, arrays, 2D arrays, smart pointers, callbacks, and safety.",
      href: "/learn/pointers-cpp",
      accent: "#00d4ff",
    },
  ],
};

function normalizeLanguage(value = "") {
  return decodeURIComponent(value).trim();
}

function languageKey(value = "") {
  return value.toLowerCase().replace(/\s+/g, "");
}

export default function LanguageLandingPage({ selectedLanguage, onLanguageSelect }) {
  const { language } = useParams();
  const displayLanguage = normalizeLanguage(language || selectedLanguage || "Programming");
  const key = languageKey(displayLanguage);
  const meta = languageMeta[key] || {
    name: displayLanguage,
    icon: "💻",
    color: "#00d4ff",
    description:
      "Explore curated documentation, examples, practice tools, and learning paths for this language.",
  };
  const courses = [...(courseCatalog[key] || []), ...generalCourses];

  React.useEffect(() => {
    if (displayLanguage && displayLanguage !== "Programming") {
      onLanguageSelect?.(displayLanguage, { stay: true });
    }
  }, [displayLanguage, onLanguageSelect]);

  return (
    <main className="language-landing" style={{ "--language-color": meta.color }}>
      <section className="language-landing-hero">
        <div className="language-hero-copy">
          <span className="language-hero-kicker">
            <Sparkles size={15} />
            Your {meta.name} learning space
          </span>
          <h1>{meta.name}</h1>
          <p>{meta.description}</p>
          <div className="language-hero-actions">
            <Link className="language-primary-btn" to="/hub">
              <BookOpen size={18} />
              Docs Hub
            </Link>
            <Link className="language-secondary-btn" to="/playground">
              <Code2 size={18} />
              Open Playground
            </Link>
          </div>
        </div>
        <div className="language-hero-mark" aria-hidden="true">
          <div className="language-hero-icon">
            {typeof meta.icon === "string" && meta.icon.startsWith("http") ? (
              <img src={meta.icon} alt="" />
            ) : (
              <span>{meta.icon}</span>
            )}
          </div>
        </div>
      </section>

      <section className="language-course-section">
        <div className="language-section-head">
          <span>Available Courses</span>
          <h2>Choose how you want to learn {meta.name}</h2>
        </div>
        <div className="language-course-grid">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Link
                key={course.title}
                to={course.href}
                className="language-course-card"
                style={{ "--course-accent": course.accent || meta.color }}
              >
                <div className="language-course-icon">
                  <Icon size={22} />
                </div>
                <span>{course.tag}</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <strong>
                  Start <ArrowRight size={16} />
                </strong>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
