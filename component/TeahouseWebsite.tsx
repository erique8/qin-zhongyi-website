"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import TeahouseExperience from "./TeahouseExperience";
import TeahouseIntro from "./TeahouseIntro";
import styles from "./TeahouseExperience.module.css";

export default function TeahouseWebsite() {
  const [page, setPage] = useState<"intro" | "experience">("intro");
  const hasEntered = useRef(false);

  const enterExperience = useCallback(() => {
    if (hasEntered.current) return;
    hasEntered.current = true;
    setPage("experience");
  }, []);

  useEffect(() => {
    if (page !== "intro") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.isComposing) return;
      if (event.key === " " || event.key === "Enter") event.preventDefault();
      enterExperience();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, enterExperience]);

  return (
    <main className={styles.website} data-page={page}>
      {/* The scene stays mounted beneath the intro and is revealed on entry. */}
      <TeahouseExperience isActive={page === "experience"} />
      <AnimatePresence>
        {page === "intro" && <TeahouseIntro key="intro" onEnter={enterExperience} />}
      </AnimatePresence>
    </main>
  );
}
