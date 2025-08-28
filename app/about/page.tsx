import Container from "@/components/Container";
import Timeline, { TimelineItem } from "@/components/Timeline";
import GradientText from "@/components/GradientText";

const workHistory: TimelineItem[] = [
  {
    title: "Software Engineer",
    org: "ArborMetrics Solutions, LLC",
    location: "Asheville, NC",
    start: "March 2022",
    end: "August 2025",
    bullets: [
      "Architected enterprise SaaS platform serving 5,000+ users across multiple utility companies using .NET Core and React.js",
      "Reduced client onboarding time by 60% through development of configurable multitenant application framework",
      "Built administration console automating billing system processing $2M+ annually, reducing errors by 95%",
      "Led migration of legacy Xamarin applications to .NET MAUI, maintaining 99.9% uptime during transition",
      "Implemented CI/CD pipelines reducing deployment time by 60% and improving team productivity",
      "Mentored team of developers and established coding standards adopted across multiple teams"
    ]
  },
  {
    title: "Software Development Specialist",
    org: "Tech Talent & Strategy",
    location: "Charlotte, NC",
    start: "February 2020",
    end: "March 2022",
    bullets: [
      "Developed RESTful APIs serving 10,000+ requests daily using Spring Boot and Node.js",
      "Created responsive web applications using Angular and React.js with 98% mobile compatibility",
      "Implemented automated testing suite achieving 80% code coverage",
      "Collaborated in Agile team delivering features on 2-week sprint cycles",
      "Reduced bug count by 40% through implementation of code review process"
    ]
  },
  {
    title: "Technical Coordinator",
    org: "Davie County Public Library",
    location: "North Carolina",
    start: "January 2019",
    end: "February 2020",
    bullets: [
      "Developed Python automation scripts reducing manual data processing time by 50%",
      "Maintained SQL databases and implemented backup procedures ensuring zero data loss",
      "Led technology training programs for 200+ community members"
    ]
  }
];

const notableProjects: TimelineItem[] = [
  {
    title: "Enterprise Resource Management Platform",
    org: "Tech Stack: .NET Core, React, SQL Server, AWS",
    bullets: [
      "Designed and built scalable multi-tenant SaaS platform handling real-time data for 5,000+ field workers with offline-first architecture and automated billing integration"
    ]
  },
  {
    title: "Geospatial Asset Tracking System",
    org: "Tech Stack: .NET MAUI, ArcGIS, SQLite, ASP.NET Core",
    bullets: [
      "Developed cross-platform mobile solution processing 1M+ data points daily for vegetation management with real-time synchronization"
    ]
  },
  {
    title: "Social Media Platform (HERD)",
    org: "Tech Stack: Flutter, Firebase, Google Cloud Functions",
    bullets: [
      "Built real-time social application with end-to-end encrypted messaging, media handling, and event-driven architecture"
    ]
  }
];

const education: TimelineItem[] = [
  {
    title: "Computer Science & Information Technology",
    org: "North Carolina Community College System",
    start: "2019",
    end: "2024",
    bullets: [
      "Completed 90+ credit hours including Data Structures, Algorithms, Database Design, Software Engineering, Web Development"
    ]
  },
  {
    title: "Tech Talent & Strategy Full Stack Development Program",
    start: "2020",
    bullets: [
      "Intensive full-stack development bootcamp focusing on modern web technologies and best practices"
    ]
  }
];

export default function AboutPage(){
  return (
    <Container>
      <h1 className="text-3xl font-semibold mb-2">Work History - Jason Beaver</h1>
      <p className="text-muted-foreground mb-8">
        Full Stack Software Engineer with 4+ years of experience building enterprise applications and SaaS platforms. 
        Proven track record of delivering scalable solutions serving thousands of users, reducing operational costs, and improving system performance.
      </p>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Professional Experience</h2>
        <Timeline items={workHistory} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Notable Projects</h2>
        <Timeline items={notableProjects} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Education & Development</h2>
        <Timeline items={education} />
      </section>
    </Container>
  )
}
