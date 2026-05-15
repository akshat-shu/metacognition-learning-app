'use client';

import styles from './MessageBubble.module.css';

type Props = {
  role: 'user' | 'student';
  content: string;
  tag?: string;
};

export default function MessageBubble({ role, content, tag }: Props) {
  const isUser = role === 'user';
  return (
    <div className={`${styles.wrap} ${isUser ? styles.wrapUser : styles.wrapStudent}`}>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleStudent}`}>
        <p className={styles.text}>{content}</p>
        {tag && !isUser && <p className={styles.tag}>{tag}</p>}
      </div>
    </div>
  );
}
