import { useState, useRef } from "react";
import { gsap } from "gsap/all";

function useHandleStepperPosition(maxStepCount) {
  const [offset, setOffset] = useState(0);
  const [stepCount, setStepCount] = useState(1);
  const stepperRef = useRef();
  const stepperContentRef = useRef();

  const goNextStepperContent = () => {
    updateOffsetValueToForward();
    updateStepCountToForward();
    const nextOffsetValue = offset - stepperRef.current.offsetWidth;
    gsap.to(stepperRef.current, { duration: 0.5, x: nextOffsetValue });
  };

  const updateOffsetValueToForward = () => {
    setOffset((prev) => {
      return stepCount < maxStepCount - 1 ? prev - stepperRef.current.offsetWidth : prev;
    });
  };

  const updateStepCountToForward = () => {
    setStepCount((prev) => {
      return prev < maxStepCount ? prev + 1 : prev;
    });
  };

  const goClickedStep = (clickedStepNumber) => {
    const nextOffsetValue = (clickedStepNumber - 1) * -stepperRef.current.offsetWidth;
    gsap.to(stepperRef.current, { duration: 0.5, x: nextOffsetValue });
    setOffset(nextOffsetValue);
    setStepCount(clickedStepNumber);
  };

  return [stepCount, stepperRef, stepperContentRef, goNextStepperContent, goClickedStep];
}

export default useHandleStepperPosition;
