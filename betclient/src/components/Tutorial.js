import Joyride from "react-joyride";

function Tutorial({ show, onClose }) {
  const steps = [
    {
      target: ".navbar",
      content: "Aici e meniul principal!",
    },
    {
      target: ".profile-button",
      content: "De aici intri la profilul tău.",
    },
    {
      target: ".training-section",
      content: "Aici îți antrenezi jucătorii.",
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={show}
      continuous
      showSkipButton
      callback={(data) => {
        if (data.status === "finished" || data.status === "skipped") {
          //onClose();
        }
      }}
    />
  );
}
export default Tutorial;

