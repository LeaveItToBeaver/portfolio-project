import Container from "@/components/Container";
import GradientText from "@/components/GradientText";
import SkillsSection from "@/components/SkillsSection";
import Link from "next/link";
import Typewriter from "@/components/Typewriter";
import FidgetSelector from "@/components/Fidgets/FidgetSelector";

export default function Home() {
  return (
    <Container>
      <section className="items-center">
        <div className="grid lg:grid-cols-[1fr,400px] gap-12 items-start">
          {/* Left side - Main content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Jason Beaver —
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              <GradientText>
                <Typewriter phrases={['Full Stack Engineer', 'Flutter Enthusiast', 'Software Architect', 'API Designer']} />
              </GradientText>
            </h2>
            <p className="text-lg text-muted-foreground">
              I love building fun stuff.
              <br /> This is my portfolio and dev blog.
            </p>
            <div className="flex gap-3">
              <div className="gradient-border gradient-border-hover rounded-2xl transition-all duration-300">
                <Link href="/projects" className="block px-4 py-2 rounded-xl bg-background shadow-card transition-colors">
                  View Projects
                </Link>
              </div>
              <div className="gradient-border gradient-border-hover rounded-2xl transition-all duration-300">
                <Link href="/blog" className="block px-4 py-2 rounded-xl bg-background shadow-card transition-colors">
                  Read the Blog
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Skills */}
          <div className="lg:sticky lg:top-24">
            <div className="gradient-border gradient-border-hover rounded-2xl transition-all duration-300">
              <div className="p-6 bg-background rounded-xl">
                <SkillsSection />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-16">
        <FidgetSelector />
      </section>
    </Container>
  );
}
