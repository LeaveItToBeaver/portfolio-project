'use client';
import React from 'react';

interface SkillCategory {
  title: string;
  skills: string[];
}

const skillsData: SkillCategory[] = [
  {
    title: "Languages",
    skills: ["JavaScript", "TypeScript", "C#", "Python", "Java", "SQL", "Dart"],
  },
  {
    title: "Frontend",
    skills: ["React.js", "Angular", "Next.js", "Flutter", "React Native"],
  },
  {
    title: "Backend",
    skills: ["Node.js", "ASP.NET Core", "Spring Boot", "RESTful APIs"],
  },
  {
    title: "Database",
    skills: ["PostgreSQL", "SQL Server", "MongoDB", "Firebase"],
  },
  {
    title: "Cloud & DevOps",
    skills: ["AWS", "Google Cloud", "Docker", "CI/CD", "Azure DevOps"],
  },
  {
    title: "Testing",
    skills: ["Unit Testing", "Integration Testing", "TDD", "Selenium"],
  }
];

export default function SkillsSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-muted-foreground mb-4">Technical Arsenal</h3>

      <div className="space-y-4">
        {skillsData.map((category, index) => (
          <div
            key={category.title}
            className="group"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-foreground group-hover:text-orange-400 transition-colors">
                {category.title}
              </h4>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground border border-transparent hover:border-orange-400/30 hover:bg-orange-400/10 hover:text-orange-400 transition-all duration-200 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}