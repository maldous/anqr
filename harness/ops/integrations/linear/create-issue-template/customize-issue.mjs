export function customizeIssue(baseTemplate) {
  // Example customization - replace with your actual values
  const customized = { ...baseTemplate };

  // Customize title based on your issue
  customized.title = "[QR Engine] Fix memory leak in QR generation component";

  // Customize description sections with your specific details
  customized.description = customized.description
    .replace(
      "[Describe the problem clearly and concisely.]",
      "The QR generation component has a memory leak that causes increasing memory usage over time, eventually leading to out-of-memory errors in production.",
    )
    .replace(
      "[Explain why this problem exists.]",
      "The memory leak is caused by unclosed file handles in the canvas rendering library used for QR code generation. Each QR code generation leaves file handles open, accumulating over time.",
    )
    .replace(
      "[Who/what is affected by this problem?]",
      "Affects all users generating QR codes in the web application. Causes production outages when memory usage exceeds available resources.",
    )
    .replace(
      "[Propose a solution or approach to fix the problem]",
      "Implement proper cleanup handlers in the QR generation component to close file handles after each QR code generation. Add memory leak detection and automated cleanup processes.",
    );

  // Customize acceptance criteria
  customized.description = customized.description.replace(
    "- [ ]",
    `- [ ] Fix memory leak in QR generation component
- [ ] Add memory leak detection tests
- [ ] Update performance benchmarks
- [ ] Verify no breaking changes to existing functionality
- [ ] Code review completed by @team-member`,
  );

  // Customize evidence section
  customized.description = customized.description.replace(
    "**Error logs:**",
    `**Error logs:**
\`\`\`
Error: Process out of memory
    at QRGenerator.render (qr-generator.js:456:12)
    at QRGenerator.generate (qr-generator.js:123:18)
    at server.js:1234:23
\`\`\`

**Memory usage graph:**
![Memory usage increasing over time](https://example.com/memory-graph.png)`,
  );

  // Customize references
  customized.description = customized.description.replace(
    "**Related issues:**",
    `**Related issues:**
- Prior investigation into QR generation memory use
- Related issue addressing QR rendering stability

**Documentation:**
- [QR Generation Architecture](https://docs.example.com/qr-architecture)
- [Memory Management Best Practices](https://docs.example.com/memory-management)`,
  );

  return customized;
}
