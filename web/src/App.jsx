import { useState } from "react";

import StepperHeader from "./components/StepperHeader";
import StepperContent from "./components/StepperContent";
import Nav from "./components/Nav";
import TrainAnimation from "./components/TrainAnimation";
import PreviousMailModal from "./components/PreviousMailModal";

import useHandleStepperPosition from "./hooks/useHandleStepperPosition";
import useCheckLocalstorageEmails from "./hooks/useCheckLocalstorageEmails";
import useHandleRequests from "./hooks/useHandleRequests";

const stepperStepNames = ["İstasyon Bilgisi", "Gün ve Saat Bilgisi", "Bildirim Yöntemi"];
const maxStepCount = stepperStepNames.length;

function App() {
  const [notificationPreference, setNotificationPreference] = useState("email");
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [stepCount, stepperRef, stepperContentRef, goNextStepperContent, goClickedStep] = useHandleStepperPosition(maxStepCount);
  const [previousSearches, removeEmailFromPreviousSearchesAndLocalStorage, addMailToPreviousSearches, checkLocalStorageAndAddEmail] =
    useCheckLocalstorageEmails(setShowModal);

  const [submitData, cancelSearch] = useHandleRequests({
    notificationPreference,
    setSearchButtonDisabled,
    removeEmailFromPreviousSearchesAndLocalStorage,
    addMailToPreviousSearches,
    checkLocalStorageAndAddEmail,
  });

  return (
    <div className='w-full h-screen bg-[rgb(17,24,39)]'>
      {/* Navbar */}
      <Nav setShowModal={setShowModal} />

      <div className='max-w-[42rem] mx-auto pt-5 overflow-hidden bg-gray-800 rounded'>
        {/* StepperHeader */}
        <StepperHeader steps={stepperStepNames} currentStep={stepCount} goClickedStep={goClickedStep} />

        {/* Stepper Content */}
        <StepperContent
          stepperRef={stepperRef}
          stepperContentRef={stepperContentRef}
          notificationPreference={notificationPreference}
          goNextStepperContent={goNextStepperContent}
          stepCount={stepCount}
          setNotificationPreference={setNotificationPreference}
          submitData={submitData}
          searchButtonDisabled={searchButtonDisabled}
        />

        <TrainAnimation />

        <PreviousMailModal
          showModal={showModal}
          setShowModal={setShowModal}
          previousSearches={previousSearches}
          cancelSearch={cancelSearch}
        />
      </div>
    </div>
  );
}

export default App;
