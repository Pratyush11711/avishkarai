// Shared SVG filter powering the "liquid wave" hover distortion on CaseStudyCard.
// Rendered once; every card references it via `filter: url(#liquid-wave)`.
export function LiquidDistortionFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", overflow: "hidden" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id="liquid-wave"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.028"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="7s"
              values="0.012 0.028;0.02 0.018;0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="28"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
