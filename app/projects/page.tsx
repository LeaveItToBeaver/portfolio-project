import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";

export default function Projects() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold mb-2">Projects</h1>
      <div className="space-y-4 mb-6">
        <div className="gradient-border rounded-2xl transition-all duration-300">
          <div className="p-5 bg-background rounded-xl">
            <div className="flex items-start gap-4">
              <Image
                src="/assets/icons/herd/icon.png"
                alt="HERD logo"
                width={128}
                height={128}
                className="rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">HERD (Flutter)</h2>
                <p className="text-sm text-muted-foreground">Passion project of mine - A new way to look at social media.</p>
                <div className="mt-3 flex gap-3">
                  <div className="gradient-border gradient-border-hover rounded-2xl">
                    <Link href="/projects/herd" className="block px-3 py-1 bg-background rounded-xl transition-colors">Details</Link>
                  </div>
                  <div className="gradient-border gradient-border-hover rounded-2xl">
                    <Link href="https://github.com/LeaveItToBeaver/Herd/blob/master/README.md" className="block px-3 py-1 bg-background rounded-xl transition-colors">GitHub</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="gradient-border rounded-2xl transition-all duration-300">
          <div className="p-5 bg-background rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">amlang</h2>
                <p className="text-sm text-muted-foreground">Experimental Programming Language with a lexer, parser, and execution engine built in Rust.</p>
                <div className="mt-3 flex gap-3">
                  <div className="gradient-border gradient-border-hover rounded-2xl">
                    <Link href="/projects/amlang" className="block px-3 py-1 bg-background rounded-xl transition-colors">Details</Link>
                  </div>
                  <div className="gradient-border gradient-border-hover rounded-2xl">
                    <Link href="https://github.com/LeaveItToBeaver/algorithmic-mathematics/blob/main/README.md" className="block px-3 py-1 bg-background rounded-xl transition-colors">GitHub</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}