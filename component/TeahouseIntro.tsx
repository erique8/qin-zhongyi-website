"use client";

import { motion, useReducedMotion } from "motion/react";

import { TEAHOUSE_INTRO } from "./teahouseContent";
import styles from "./TeahouseIntro.module.css";

type Props = { onEnter: () => void };

export default function TeahouseIntro({ onEnter }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={styles.intro}
      aria-labelledby="intro-title"
      onClick={onEnter}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeInOut" }}
    >
      <div className={styles.rule} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{TEAHOUSE_INTRO.eyebrow}</p>
        <h1 id="intro-title" className={styles.title}>{TEAHOUSE_INTRO.title}</h1>
        <p className={styles.subtitle}>{TEAHOUSE_INTRO.subtitle}</p>
        <p className={styles.description}>{TEAHOUSE_INTRO.description}</p>
      </div>
      <footer className={styles.footer}>
        <button type="button" className={styles.enter} onClick={onEnter}>
          <span className={styles.enterMark} aria-hidden="true">↗</span>
          {TEAHOUSE_INTRO.enterHint}
        </button>
        <p>{TEAHOUSE_INTRO.footer}</p>
      </footer>
      <span className={styles.seal} aria-hidden="true">茶<br />馆</span>
    </motion.section>
  );
}
