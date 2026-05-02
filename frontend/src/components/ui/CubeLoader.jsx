import React from 'react';

export default function CubeLoader() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .cube-spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px;
        }

        .cube-spinner {
          width: 60px;
          height: 60px;
          --clr: var(--accent);
          --clr-alpha: rgba(16, 185, 129, 0.15);
          animation: cube-spinner-anim 1.6s infinite ease;
          transform-style: preserve-3d;
        }

        .cube-spinner > div {
          background-color: var(--clr-alpha);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 3.5px solid var(--clr);
          border-radius: 4px;
        }

        .cube-spinner div:nth-of-type(1) {
          transform: translateZ(-30px) rotateY(180deg);
        }

        .cube-spinner div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }

        .cube-spinner div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }

        .cube-spinner div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }

        .cube-spinner div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }

        .cube-spinner div:nth-of-type(6) {
          transform: translateZ(30px);
        }

        @keyframes cube-spinner-anim {
          0% {
            transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
          }
          50% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
          }
          100% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
          }
        }
      `}} />
      <div className="cube-spinner-container">
        <div className="cube-spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    </>
  );
}
