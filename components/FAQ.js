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
    question: "Do I need the Pro version?",
    answer: (
      <p>
        The free version gives you 5 annotated markups per day — enough for most individual reviewers. Upgrade to Pro if your team reviews presentations daily and needs unlimited markups with watermark-free exports.
      </p>
    ),
  },
  {
    question: "Can my team use this without installing anything?",
    answer: (
      <p>
        Only the person creating annotations needs the extension. When you export, the annotations are baked into the image. Share the PNG via email, Slack, or Teams — recipients see your feedback without installing anything.
      </p>
    ),
  },
  {
    question: "Can I get a refund if it doesn't work for me?",
    answer: (
      <p>
        Yes. Request a full refund within 7 days of purchase. Just email contact.givemethanks@gmail.com and we&apos;ll process it immediately.
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
