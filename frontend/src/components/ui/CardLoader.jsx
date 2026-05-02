import React from 'react';

export default function CardLoader() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .card-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 100px;
        }

        .card-loader .bar {
          display: inline-block;
          width: 3px;
          height: 20px;
          background-color: var(--accent);
          opacity: 0.5;
          border-radius: 10px;
          animation: scale-up4 1s linear infinite;
        }

        .card-loader .bar:nth-child(2) {
          height: 35px;
          margin: 0 5px;
          animation-delay: .25s;
        }

        .card-loader .bar:nth-child(3) {
          animation-delay: .5s;
        }

        @keyframes scale-up4 {
          20% {
            background-color: var(--accent);
            opacity: 1;
            transform: scaleY(1.5);
          }
          40% {
            transform: scaleY(1);
          }
        }
      `}} />
      <div className="card-loader">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </>
  );
}
