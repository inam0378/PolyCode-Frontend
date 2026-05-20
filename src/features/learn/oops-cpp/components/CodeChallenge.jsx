import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  definePolycodeMonacoTheme,
  getVSCodeEditorOptions,
  POLYCODE_VSCODE_THEME,
} from "../../../../shared/utils/monacoTheme";

export default function CodeChallenge({
  challenge,
  accentColor,
  isCompleted,
  onComplete,
  initialCode,
  onCodeChange,
}) {
  const [code, setCode] = useState(initialCode || challenge.starterCode);
  const [results, setResults] = useState(null); // null | { passed, tests }
  const [output, setOutput] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const activeChallengeId = useRef(challenge.id);

  useEffect(() => {
    const challengeChanged = activeChallengeId.current !== challenge.id;

    if (challengeChanged) {
      activeChallengeId.current = challenge.id;
      setCode(initialCode || challenge.starterCode);
      setResults(null);
      setOutput(null);
      setShowSolution(false);
      return;
    }

    if (typeof initialCode === "string") {
      setCode((currentCode) =>
        currentCode === challenge.starterCode ? initialCode : currentCode,
      );
    }
  }, [challenge.id, challenge.starterCode, initialCode]);

  // Simulated test runner — checks code string heuristically
  // In production: hook into your backend compiler (BrowserExecutor / Piston API)
  function runTests() {
    setRunning(true);
    setResults(null);
    setOutput({
      status: "running",
      stdout: "Running checks...",
      expected: simulateCppOutput(challenge.solutionCode),
    });

    setTimeout(() => {
      const testResults = challenge.tests.map((test) => {
        // Heuristic checks based on solution keywords
        const solutionKeywords = extractKeywords(
          challenge.solutionCode,
          test.id,
        );
        const passed = solutionKeywords.every((kw) => code.includes(kw));
        return { ...test, passed };
      });

      const allPassed = testResults.every((t) => t.passed);
      setResults({ passed: allPassed, tests: testResults });
      setOutput({
        status: allPassed ? "pass" : "fail",
        stdout:
          simulateCppOutput(code) ||
          (allPassed
            ? simulateCppOutput(challenge.solutionCode)
            : "No console output detected yet. Add cout statements, then run again."),
        expected: simulateCppOutput(challenge.solutionCode),
      });
      if (allPassed && !isCompleted) {
        Promise.resolve(onComplete()).catch((error) => {
          console.error("Unable to save lesson progress:", error);
        });
      }
      setRunning(false);
    }, 800);
  }

  function extractKeywords(sol, testId) {
    const explicit = challenge.tests.find((test) => test.id === testId)
      ?.keywords;
    if (explicit) return explicit;

    // Per-test keyword extraction from solution code
    // Maps test index → structural signals to look for in user code
    const lines = sol.split("\n").filter(Boolean);
    switch (testId) {
      case 1:
        return [
          lines
            .find((l) => l.includes("class"))
            ?.trim()
            .split(" ")[1]
            ?.replace("{", "") || "class",
        ].filter(Boolean);
      case 2:
        return [
          lines
            .find((l) => l.includes("(") && !l.includes("//"))
            ?.match(/\w+\s*\(/)?.[0]
            .trim() || "",
        ].filter(Boolean);
      case 3:
        return [
          lines.find((l) => l.includes("cout"))?.includes("cout") ? "cout" : "",
        ].filter(Boolean);
      case 4:
        return ["cout"].filter(Boolean);
      default:
        return [];
    }
  }

  function cleanLiteral(value = "") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
    }
    return trimmed;
  }

  function collectKnownValues(source) {
    const values = new Map();
    const declarations =
      /\b(?:string|int|double|float|char|bool|auto)\s+([A-Za-z_]\w*)\s*=\s*("[^"]*"|'[^']*'|[-+]?\d+(?:\.\d+)?|true|false)/g;
    const memberAssignments =
      /\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*=\s*("[^"]*"|'[^']*'|[-+]?\d+(?:\.\d+)?|true|false)/g;
    const assignments =
      /\b([A-Za-z_]\w*)\s*=\s*("[^"]*"|'[^']*'|[-+]?\d+(?:\.\d+)?|true|false)/g;

    for (const match of source.matchAll(declarations)) {
      values.set(match[1], cleanLiteral(match[2]));
    }
    for (const match of source.matchAll(memberAssignments)) {
      values.set(`${match[1]}.${match[2]}`, cleanLiteral(match[3]));
    }
    for (const match of source.matchAll(assignments)) {
      if (!values.has(match[1])) values.set(match[1], cleanLiteral(match[2]));
    }

    return values;
  }

  function renderCoutPart(part, values) {
    const token = part.trim().replace(/;$/, "");
    if (!token || token === "cout") return "";
    if (token === "endl") return "\n";
    if (token === '"\\n"' || token === "'\\n'") return "\n";
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return cleanLiteral(token);
    }
    if (/^[-+]?\d+(\.\d+)?$/.test(token)) return token;
    if (values.has(token)) return values.get(token);
    return "";
  }

  function simulateCppOutput(source = "") {
    const values = collectKnownValues(source);
    const outputLines = [];

    source.split("\n").forEach((rawLine) => {
      const line = rawLine.split("//")[0];
      if (!line.includes("cout")) return;
      const rendered = line
        .split("<<")
        .map((part) => renderCoutPart(part, values))
        .join("");
      if (rendered) outputLines.push(rendered);
    });

    return outputLines.join("").trim();
  }

  function resetCode() {
    setCode(challenge.starterCode);
    onCodeChange?.(challenge.starterCode);
    setResults(null);
    setOutput(null);
    setShowSolution(false);
  }

  return (
    <div className="oops-challenge">
      {/* Problem statement */}
      <div className="oops-problem-panel">
        <div className="oops-problem-header">
          <h3 className="oops-problem-title">{challenge.title}</h3>
          {isCompleted && (
            <span
              className="oops-problem-solved"
              style={{ color: accentColor }}
            >
              ✓ Solved
            </span>
          )}
        </div>
        <p className="oops-problem-desc">{challenge.description}</p>

        {/* Test cases */}
        <div className="oops-test-cases">
          <div className="oops-test-cases-label">Acceptance Tests</div>
          {(results ? results.tests : challenge.tests).map((t) => (
            <div
              key={t.id}
              className={`oops-test-row ${
                results ? (t.passed ? "oops-test-pass" : "oops-test-fail") : ""
              }`}
            >
              <span className="oops-test-icon">
                {results ? (t.passed ? "✓" : "✗") : "○"}
              </span>
              <span className="oops-test-label">{t.label}</span>
              {results && !t.passed && t.hint && (
                <span className="oops-test-hint">Hint: {t.hint}</span>
              )}
            </div>
          ))}
        </div>

        <div
          className={`oops-output-panel ${
            output?.status ? `oops-output-${output.status}` : ""
          }`}
        >
          <div className="oops-output-head">
            <span>Output</span>
            <small>{output ? "after last run" : "waiting for run"}</small>
          </div>
          <pre className="oops-output-body">
            {output?.stdout || "Run your code to see console output here."}
          </pre>
          {output?.expected && (
            <div className="oops-expected-output">
              <span>Expected</span>
              <code>{output.expected}</code>
            </div>
          )}
        </div>
      </div>

      {/* Editor panel */}
      <div className="oops-editor-panel">
        <div className="oops-editor-topbar">
          <span className="oops-editor-lang">C++ · main.cpp</span>
          <div className="oops-editor-actions">
            <button
              className="oops-editor-action"
              onClick={resetCode}
              title="Reset"
            >
              ↺ Reset
            </button>
            <button
              className="oops-editor-action"
              onClick={() => setShowSolution(!showSolution)}
            >
              {showSolution ? "Hide Solution" : "💡 Solution"}
            </button>
          </div>
        </div>

        <div className="oops-editor">
          <Editor
            height="100%"
            language="cpp"
            value={showSolution ? challenge.solutionCode : code}
            beforeMount={definePolycodeMonacoTheme}
            theme={POLYCODE_VSCODE_THEME}
            onChange={(value) => {
              if (!showSolution) {
                const nextCode = value || "";
                setCode(nextCode);
                onCodeChange?.(nextCode);
              }
            }}
            options={getVSCodeEditorOptions({
              fontSize: 14,
              readOnly: showSolution,
            })}
          />
        </div>

        {/* Run bar */}
        <div className="oops-run-bar">
          {results && (
            <div
              className={`oops-verdict ${results.passed ? "oops-verdict-pass" : "oops-verdict-fail"}`}
            >
              {results.passed
                ? `✓ All tests passed!`
                : `${results.tests.filter((t) => t.passed).length}/${results.tests.length} tests passed`}
            </div>
          )}
          <button
            className="oops-run-btn"
            style={{ "--accent": accentColor }}
            onClick={runTests}
            disabled={running || showSolution}
          >
            {running ? (
              <span className="oops-run-spinner">⟳ Running…</span>
            ) : (
              "▶ Run & Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
