import React from "react";

function RightArrowSvg({ passed = false }) {
  return (
    <svg
      aria-hidden='true'
      className='w-4 h-4 ml-2 sm:ml-4'
      fill='none'
      stroke={passed ? "#3B79E1" : "#A0AEC0"}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 5l7 7-7 7M5 5l7 7-7 7'></path>
    </svg>
  );
}

function StepTitle({ isLastStep = false, number = 0, passed = false, stepText = "", currentStep = 1, onClick }) {
  passed = number <= currentStep;
  return (
    <li
      onClick={onClick}
      className={`flex items-center border rounded border-gray-600 px-[2px] sm:px-3 py-2 cursor-pointer text-xs sm:text-sm hover:bg-gray-700/20 ${
        passed && "text-blue-600 dark:text-blue-500"
      }`}
    >
      <span
        className={`flex items-center justify-center w-6 h-6 mr-2 text-xs rounded-full shrink-0 border-[0.08rem] sm:border-[0.12rem] ${
          passed && "dark:border-blue-500 border-blue-600"
        } `}
      >
        {number}
      </span>
      {stepText}
      {isLastStep ? null : <RightArrowSvg passed={passed} />}
    </li>
  );
}

function StepperHeader({ steps = [], currentStep = 1, goClickedStep }) {
  const goThisStep = (stepNumber) => {
    goClickedStep(stepNumber);
  };

  return (
    <>
      <ol className='mt-1 py-3 pb-7 flex items-center justify-center w-full space-x-1 text-sm font-medium text-center text-gray-500  border-b border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700  sm:space-x-4'>
        {steps.map((text, index) => {
          return (
            <StepTitle
              onClick={() => goThisStep(index + 1)}
              key={"step-" + index}
              isLastStep={index === steps.length - 1}
              number={index + 1}
              stepText={text}
              currentStep={currentStep}
            />
          );
        })}
      </ol>
    </>
  );
}

export default StepperHeader;
