'use client';

import React from 'react';
import styles from './Prose.module.css';

// ── Inline parser ──────────────────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, and plain text
function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className={styles.code}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part || null;
  });
}

// ── Block parser ───────────────────────────────────────────────────────────
// Line-by-line: headings (#/##/###), bullet lists (- / * / •),
// numbered lists (1. 2. …), blockquotes (>), and paragraphs.
function parseBlocks(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // Buffers for multi-line groups
  let paraLines:    string[] = [];
  let bulletItems:  string[] = [];
  let orderedItems: string[] = [];

  const flushPara = () => {
    if (!paraLines.length) return;
    const content = paraLines.map((l, i) => (
      <React.Fragment key={i}>
        {parseInline(l)}
        {i < paraLines.length - 1 && <br />}
      </React.Fragment>
    ));
    nodes.push(<p key={key++} className={styles.p}>{content}</p>);
    paraLines = [];
  };

  const flushBullets = () => {
    if (!bulletItems.length) return;
    nodes.push(
      <ul key={key++} className={styles.list}>
        {bulletItems.map((item, i) => (
          <li key={i} className={styles.listItem}>{parseInline(item)}</li>
        ))}
      </ul>
    );
    bulletItems = [];
  };

  const flushOrdered = () => {
    if (!orderedItems.length) return;
    nodes.push(
      <ol key={key++} className={`${styles.list} ${styles.orderedList}`}>
        {orderedItems.map((item, i) => (
          <li key={i} className={styles.listItem}>{parseInline(item)}</li>
        ))}
      </ol>
    );
    orderedItems = [];
  };

  const flushAll = () => { flushPara(); flushBullets(); flushOrdered(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trimStart();

    // ── Empty line → close open groups ──
    if (!trimmed) {
      flushAll();
      continue;
    }

    // ── Headings ──
    if (trimmed.startsWith('### ')) {
      flushAll();
      nodes.push(<h5 key={key++} className={styles.h5}>{parseInline(trimmed.slice(4))}</h5>);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushAll();
      nodes.push(<h4 key={key++} className={styles.h4}>{parseInline(trimmed.slice(3))}</h4>);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushAll();
      nodes.push(<h3 key={key++} className={styles.h3}>{parseInline(trimmed.slice(2))}</h3>);
      continue;
    }

    // ── Bullet list ──
    if (/^[-*•]\s+/.test(trimmed)) {
      flushPara();
      flushOrdered();
      bulletItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    // ── Numbered list ──
    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushPara();
      flushBullets();
      orderedItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      continue;
    }

    // ── Blockquote ──
    if (trimmed.startsWith('> ')) {
      flushAll();
      nodes.push(
        <blockquote key={key++} className={styles.blockquote}>
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // ── Horizontal rule ──
    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushAll();
      nodes.push(<hr key={key++} className={styles.hr} />);
      continue;
    }

    // ── Regular text — accumulate into paragraph ──
    // If we were building a list, flush it first
    flushBullets();
    flushOrdered();
    paraLines.push(trimmed);
  }

  flushAll();
  return nodes;
}

// ── Component ──────────────────────────────────────────────────────────────
type Props = { text: string; className?: string };

export default function Prose({ text, className }: Props) {
  return (
    <div className={`${styles.prose} ${className ?? ''}`}>
      {parseBlocks(text)}
    </div>
  );
}
