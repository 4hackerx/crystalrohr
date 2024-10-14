import React from "react";

import { Button } from "@/components/atoms/button";
import useTextToSpeech from "@/hooks/use-text-to-speech";

const SpeechControls = ({ text }: { text: string }) => {
  const { speak, cancel, isSpeaking, error } = useTextToSpeech();

  const handleSpeak = () => {
    if (text.trim()) {
      speak(text);
    }
  };

  if (!text.trim()) {
    return null;
  }

  return (
    <div>
      <div className="flex space-x-2">
        <Button onClick={handleSpeak} disabled={isSpeaking}>
          {isSpeaking ? "Speaking..." : "Speak"}
        </Button>
        {isSpeaking && (
          <Button onClick={cancel} variant="secondary">
            Stop
          </Button>
        )}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SpeechControls;
