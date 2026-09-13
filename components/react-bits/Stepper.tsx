"use client";

/**
 * Vendored from React Bits (reactbits.dev/components/stepper).
 * Shell, type, and motion adapted to the site token system.
 */

import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { clsx } from "clsx";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  stepLabels?: string[];
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  stepLabels,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const goTo = (next: number) => {
    if (next === currentStep) return;
    setDirection(next > currentStep ? 1 : -1);
    updateStep(next);
  };

  const handleBack = () => {
    if (currentStep > 1) goTo(currentStep - 1);
  };

  const handleNext = () => {
    if (!isLastStep) goTo(currentStep + 1);
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(1);
    onStepChange(1);
  };

  return (
    <div className="flex w-full flex-col" {...rest}>
      <div
        className={clsx(
          "w-full overflow-hidden rounded-[32px] bg-deep-navy",
          stepCircleContainerClassName
        )}
      >
        <div
          className={clsx(
            "flex w-full items-start gap-2 px-6 pt-8 md:px-12 md:pt-10",
            stepContainerClassName
          )}
        >
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: goTo,
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    label={stepLabels?.[index]}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={goTo}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          reducedMotion={reducedMotion}
          className={contentClassName}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={clsx("px-6 pb-8 md:px-12 md:pb-10", footerClassName)}>
            <div
              className={clsx(
                "flex items-center border-t border-white/10 pt-6",
                currentStep !== 1 ? "justify-between" : "justify-end"
              )}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex min-h-11 items-center type-body-sm text-smoke transition-colors duration-200 hover:text-paper-white"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-primary px-6 py-3 type-body text-text-inverse transition-colors duration-200 hover:bg-primary-hover"
                {...nextButtonProps}
              >
                {isLastStep ? "Start over" : nextButtonText}
                <span aria-hidden className="text-[18px] leading-none">
                  →
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  reducedMotion: boolean;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  reducedMotion,
  children,
  className = "",
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(280);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : Math.max(parentHeight, 240) }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 280, damping: 34, mass: 0.8 }
      }
      className={className}
    >
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            reducedMotion={reducedMotion}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  reducedMotion: boolean;
  onHeightReady: (height: number) => void;
}

function SlideTransition({
  children,
  direction,
  reducedMotion,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={reducedMotion ? fadeVariants : stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: EASE }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -18 : 18,
    opacity: 0,
  }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <div className="px-6 py-10 md:px-12 md:py-12">{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
  label?: string;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
  label,
}: StepIndicatorProps) {
  const status =
    currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disableStepIndicators}
      aria-current={status === "active" ? "step" : undefined}
      className={clsx(
        "group relative flex min-h-11 shrink-0 items-center gap-3 text-left",
        disableStepIndicators && "pointer-events-none opacity-50"
      )}
    >
      <motion.span
        animate={status}
        initial={false}
        variants={{
          inactive: { scale: 1, backgroundColor: "#1b2b4a", color: "#6b6e86" },
          active: { scale: 1.06, backgroundColor: "#3040ff", color: "#ffffff" },
          complete: { scale: 1, backgroundColor: "#3040ff", color: "#ffffff" },
        }}
        transition={{ duration: 0.28, ease: EASE }}
        className="flex h-8 w-8 items-center justify-center rounded-full font-semibold"
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4 text-paper-white" />
        ) : status === "active" ? (
          <motion.span
            layoutId="principle-step-dot"
            className="h-2.5 w-2.5 rounded-full bg-paper-white"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        ) : (
          <span className="font-mono text-[11px] tabular-nums">{step}</span>
        )}
      </motion.span>
      {label ? (
        <span
          className={clsx(
            "hidden type-caption max-w-[14ch] transition-colors duration-200 lg:block",
            status === "active" ? "text-paper-white" : "text-smoke group-hover:text-paper-white/80"
          )}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  return (
    <div className="relative mx-1 mt-4 h-px min-w-6 flex-1 overflow-hidden bg-white/12">
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary"
        initial={false}
        animate={{ width: isComplete ? "100%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.08, duration: 0.28, ease: "easeOut" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
