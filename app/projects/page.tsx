import Container from "@/components/Container";
import Link from "next/link";

export default function Projects() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold mb-6">Projects</h1>
      <div className="space-y-4">
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">HERD (Flutter)</h2>
          <p className="text-sm text-muted-foreground">Scalable social app with event-driven Cloud Functions and CQRS-style feed.</p>
          <div className="mt-3 flex gap-3">
            <Link href="/projects/herd" className="rounded-xl border px-3 py-1">Details</Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
