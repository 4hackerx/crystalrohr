import React, { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  percentage: number;
  color?: string;
  noStripes?: boolean;
  animate?: boolean;
}

const ProgressStripe = ({
  percentage,
  color,
  noStripes,
  animate,
}: ProgressBarProps) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const span = spanRef.current;
    if (span) {
      const origWidth = `${percentage}%`;
      span.style.width = "0%";
      setTimeout(() => {
        span.style.transition = "width 1.2s";
        span.style.width = origWidth;
      }, 50);
    }
  }, [percentage]);

  const className = `meter ${color || ""} ${noStripes ? "nostripes" : ""} ${animate ? "animate" : ""}`;

  return (
    <div className={className}>
      <span ref={spanRef} style={{ width: `${percentage}%` }}>
        {animate && <span></span>}
      </span>
      <style jsx>{`
        .meter {
          box-sizing: content-box;
          height: 25px;
          position: relative;
          margin: 10px 0;
        }
        .meter > span {
          display: block;
          height: 100%;
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          background-color: rgb(43, 194, 83);
          background-image: linear-gradient(
            center bottom,
            rgb(43, 194, 83) 37%,
            rgb(84, 240, 84) 69%
          );
          box-shadow:
            inset 0 2px 9px rgba(255, 255, 255, 0.3),
            inset 0 -2px 6px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }
        .meter > span:after,
        .animate > span > span {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background-image: linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          );
          z-index: 1;
          background-size: 50px 50px;
          animation: move 2s linear infinite;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          overflow: hidden;
        }
        .animate > span:after {
          display: none;
        }
        @keyframes move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }
        .orange > span {
          background-image: linear-gradient(#f1a165, #f36d0a);
        }
        .red > span {
          background-image: linear-gradient(#f0a3a3, #f42323);
        }
        .purple > span {
          background-image: linear-gradient(#1f0a4f, #360C99);
        }
        .nostripes > span > span,
        .nostripes > span::after {
          background-image: none;
        }
      `}</style>
    </div>
  );
};

export default ProgressStripe;
