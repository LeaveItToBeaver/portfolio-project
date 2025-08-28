import Container from "@/components/Container";

export default function HerdProject() {
    return (
        <Container>
            <h1 className="text-3xl font-semibold mb-4">amlang</h1>
            <div className="prose prose-invert">
                <p>This page supports GIFs and code samples embedded from blog posts, or add them inline here.</p>
                <p><img src="https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif" alt="demo gif" /></p>
                <pre>
                    <code className="language-dart">
                        // Example Dart snippet
                    // TODO: replace with real code
                    </code>
                </pre>
            </div>
        </Container>
    )
}
