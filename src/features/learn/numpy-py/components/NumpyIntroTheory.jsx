import React, { useState } from "react";
import RunnableCodeBlock from "../../shared/RunnableCodeBlock";

function plainText(text = "") {
  return text.replace(/\*\*/g, "").replace(/`/g, "");
}

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="numpy-inline-code">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

function NumpyTheoryBlock({ block, step, accentColor }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  if (block.type === "text") {
    return (
      <article className="numpy-step-card">
        <div className="numpy-step-head">
          <span className="numpy-step-num" style={{ background: accentColor }}>
            {step}
          </span>
          <span className="numpy-step-label">In simple words</span>
        </div>
        <p className="numpy-step-text">
          <InlineText text={block.content} />
        </p>
      </article>
    );
  }

  if (block.type === "callout") {
    const labels = { info: "Good to know", tip: "Helpful tip", warning: "Watch out" };
    const icons = { info: "💡", tip: "✨", warning: "⚠️" };
    return (
      <aside className={`numpy-tip-box numpy-tip-${block.variant}`}>
        <span className="numpy-tip-icon">{icons[block.variant] || "💡"}</span>
        <div>
          <strong>{labels[block.variant] || "Note"}</strong>
          <p>
            <InlineText text={block.content} />
          </p>
        </div>
      </aside>
    );
  }

  if (block.type === "code") {
    return (
      <div className="numpy-step-code">
        <div className="numpy-step-head">
          <span className="numpy-step-num numpy-step-num-code" style={{ color: accentColor }}>
            ▶
          </span>
          <span className="numpy-step-label">Try it yourself</span>
        </div>
        {block.label && <p className="numpy-code-caption">{block.label}</p>}
        <RunnableCodeBlock
          block={block}
          accentColor={accentColor}
          language="python"
        />
      </div>
    );
  }

  if (block.type === "diagram") {
    return (
      <article className="numpy-step-card numpy-diagram-card">
        <div className="numpy-step-head">
          <span className="numpy-step-num" style={{ background: accentColor }}>
            {step}
          </span>
          <span className="numpy-step-label">{block.title}</span>
        </div>
        <div className="numpy-diagram-grid">
          {block.nodes.map((node) => (
            <div
              key={node.id}
              className="numpy-diagram-item"
              style={{ "--node-color": node.color || accentColor }}
            >
              <h4>{node.label}</h4>
              <ul>
                {node.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (block.type === "quiz") {
    const answered = selectedQuiz !== null;
    const correct = selectedQuiz === block.answer;

    return (
      <article className={`numpy-quiz-card ${answered ? (correct ? "correct" : "wrong") : ""}`}>
        <div className="numpy-step-head">
          <span className="numpy-step-num" style={{ background: accentColor }}>
            ?
          </span>
          <span className="numpy-step-label">Quick check — no pressure!</span>
        </div>
        <p className="numpy-quiz-question">
          <InlineText text={block.question} />
        </p>
        <div className="numpy-quiz-options">
          {block.options.map((option, index) => {
            const isSelected = selectedQuiz === index;
            const isAnswer = block.answer === index;
            return (
              <button
                key={option}
                type="button"
                className={`numpy-quiz-option ${
                  answered && isAnswer ? "answer" : ""
                } ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedQuiz(index)}
              >
                {String.fromCharCode(65 + index)}. <InlineText text={option} />
              </button>
            );
          })}
        </div>
        {answered && (
          <p className="numpy-quiz-feedback">
            <strong>{correct ? "Nice!" : "Not quite — that's okay."}</strong>{" "}
            <InlineText text={block.explanation} />
          </p>
        )}
      </article>
    );
  }

  return null;
}

export default function NumpyIntroTheory({
  lesson,
  noteDraft,
  onNoteChange,
  onSaveNote,
  confidence,
  onConfidenceChange,
  onGoChallenge,
}) {
  const accentColor = lesson.chapterColor || "#4f46e5";
  const firstText = lesson.theory.find((block) => block.type === "text");
  let stepCounter = 0;

  return (
    <div className="numpy-intro-theory">
      <header className="numpy-lesson-hero" style={{ "--numpy-accent": accentColor }}>
        <span className="numpy-chapter-badge">{lesson.chapterTitle}</span>
        <h2 className="numpy-lesson-title">{lesson.title}</h2>
        <p className="numpy-lesson-hook">
          {plainText(firstText?.content) ||
            "We'll explain this idea in plain English — no jargon overload."}
        </p>
      </header>

      <div className="numpy-learn-path">
        <div className="numpy-path-label">
          <span>Your learning path</span>
          <small>Read → run code → check yourself</small>
        </div>

        {lesson.theory.map((block, index) => {
          const needsStep =
            block.type === "text" || block.type === "diagram" || block.type === "quiz";
          const step = needsStep ? ++stepCounter : stepCounter;

          return (
            <NumpyTheoryBlock
              key={`${block.type}-${index}`}
              block={block}
              step={step || index + 1}
              accentColor={accentColor}
            />
          );
        })}
      </div>

      <div className="numpy-notes-panel">
        <h3>📝 Your notes</h3>
        <p className="numpy-notes-hint">
          Write anything you want to remember — in your own words.
        </p>
        <textarea
          value={noteDraft}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Example: ndarray = a neat row of numbers I can math on all at once..."
        />
        <button type="button" className="numpy-notes-save" onClick={onSaveNote}>
          Save note
        </button>
      </div>

      <div className="numpy-confidence-panel">
        <h3>How do you feel about this lesson?</h3>
        <div className="numpy-confidence-options">
          {[
            ["review", "😅 Need another read"],
            ["almost", "🙂 Getting it"],
            ["ready", "🚀 Ready for the challenge"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={confidence === value ? "active" : ""}
              onClick={() => onConfidenceChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="numpy-theory-footer">
        <button
          type="button"
          className="numpy-challenge-cta"
          style={{ "--numpy-accent": accentColor }}
          onClick={onGoChallenge}
        >
          Ready? Try the coding challenge →
        </button>
      </div>
    </div>
  );
}
