"use client";

type ShareRowProps = { title: string };

const BUTTON =
  "grid size-11 place-items-center rounded-full border border-ink-2 transition-colors hover:bg-ink-2 hover:text-paper";

const ICON = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export default function ShareRow({ title }: ShareRowProps) {
  const shareEmail = () => {
    const url = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  };

  const shareFacebook = () => {
    const url = window.location.href;
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
      "_blank",
      "noopener",
    );
  };

  const shareLinkedIn = () => {
    const url = window.location.href;
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(url),
      "_blank",
      "noopener",
    );
  };

  const shareX = () => {
    const url = window.location.href;
    window.open(
      "https://x.com/intent/post?url=" +
        encodeURIComponent(url) +
        "&text=" +
        encodeURIComponent(title),
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        aria-label="Share by email"
        className={BUTTON}
        onClick={shareEmail}
      >
        <svg {...ICON} aria-hidden>
          <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
          <polyline points="3.5,6.5 12,13 20.5,6.5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Share on Facebook"
        className={BUTTON}
        onClick={shareFacebook}
      >
        <svg {...ICON} aria-hidden>
          <path d="M14.75 4.5h-1.5A3.25 3.25 0 0 0 10 7.75V19.5" />
          <path d="M7.5 11.5h6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Share on LinkedIn"
        className={BUTTON}
        onClick={shareLinkedIn}
      >
        <svg {...ICON} aria-hidden>
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
          <path d="M8 11v5.5" />
          <path d="M8 7.9v.2" />
          <path d="M12 16.5V11" />
          <path d="M12 13.4a2.35 2.35 0 0 1 4.7 0v3.1" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Share on X"
        className={BUTTON}
        onClick={shareX}
      >
        <svg {...ICON} aria-hidden>
          <path d="M5 5l14 14" />
          <path d="M19 5L5 19" />
        </svg>
      </button>
    </div>
  );
}
