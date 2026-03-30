"use client";

import { useRef, useState } from "react";

const faqList = [
  {
    question: "Which AI tools does this work with?",
    answer: (
      <p>
        Any AI that accepts images — ChatGPT, Claude, Gemini, Cursor, Windsurf, and more. Export your annotated screenshot as PNG and paste it in. The AI sees your numbered pins and knows exactly what you&apos;re pointing at.
      </p>
    ),
  },
  {
    question: "How is this different from a regular screenshot?",
    answer: (
      <p>
        Regular screenshots need a paragraph of explanation: &quot;see the button on the left, below the nav, next to the icon...&quot; With numbered annotations, you just say &quot;fix #1&quot; or &quot;change #3 to blue.&quot; Zero ambiguity.
      </p>
    ),
  },
  {
    question: "Is it really free?",
    answer: (
      <p>
        Yes. Every feature is fully unlocked — unlimited screenshots, all export formats, no watermarks, no account required. We&apos;re focused on making the best annotation tool possible and getting it into as many hands as we can.
      </p>
    ),
  },
  {
    question: "Do recipients need to install anything?",
    answer: (
      <p>
        No. Only the person creating annotations needs the extension. When you export, annotations are baked into the PNG image. Share it via Slack, email, Teams, or paste it into any AI chat — recipients see your feedback with no install required.
      </p>
    ),
  },
  {
    question: "Is my data private?",
    answer: (
      <p>
        100%. Everything runs locally in your Chrome browser. Your screenshots, annotations, and exports never leave your machine. Nothing is uploaded to any server, ever.
      </p>
    ),
  },
  {
    question: "What browsers are supported?",
    answer: (
      <p>
        Chrome 88 and above (Manifest V3). This includes Chromium-based browsers like Brave and Edge.
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
