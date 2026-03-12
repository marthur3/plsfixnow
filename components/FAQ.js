"use client";

import { useRef, useState } from "react";

const faqList = [
  {
    question: "Does this work with PowerPoint and Power BI?",
    answer: (
      <p>
        Yes. Capture any PowerPoint slide (via PowerPoint Online or the desktop app in your browser), any Power BI dashboard, Google Slides, Tableau, or any other web-based presentation tool. If you can see it in Chrome, you can annotate it.
      </p>
    ),
  },
  {
    question: "How is this different from just taking a regular screenshot?",
    answer: (
      <p>
        Regular screenshots force you to write &quot;see the bar chart in the bottom-left, below the revenue header...&quot; With numbered annotations, you just say &quot;fix #1&quot; or &quot;change the color at #3.&quot; Your team sees exactly what you mean — zero guesswork.
      </p>
    ),
  },
  {
    question: "Is it really free? What's the catch?",
    answer: (
      <p>
        No catch. Every feature is fully unlocked — unlimited markups, all export formats, no watermarks, no account required. We want to build the best feedback tool for teams and we&apos;re focused on getting it into as many hands as possible right now.
      </p>
    ),
  },
  {
    question: "How does Copy for AI work?",
    answer: (
      <p>
        Click &quot;Copy for AI&quot; in the share menu and your annotated screenshot gets copied with a structured prompt baked into the image. Paste it directly into ChatGPT, Claude, or Cursor and the AI can read both your screenshot and your numbered annotations to give you targeted fixes.
      </p>
    ),
  },
  {
    question: "Can my team use this without installing anything?",
    answer: (
      <p>
        Only the person creating annotations needs the extension. When you export, the annotations are baked into the image. Share the PNG or PDF via email, Slack, or Teams — recipients see your feedback without installing anything.
      </p>
    ),
  },
  {
    question: "Is my data private?",
    answer: (
      <p>
        100%. Everything runs locally in your browser. Your screenshots, annotations, and exports never leave your machine — nothing is uploaded to any server.
      </p>
    ),
  },
];

const Item = ({ item }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
