zip -r harness-code.zip harness/
zip -r harness-services.zip services/
zip -r harness-docs.zip docs/
zip -r harness-agents.zip .agents/
zip -r harness-root.zip $(grep harness * | cut -f1 -d: | sort -u)
zip -r harness-markdown.zip *md
zip -r harness-tests.zip tests/
