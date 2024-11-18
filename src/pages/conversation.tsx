import { getHistory, StartConversation } from "@/redux/services/conversation.service";
import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "@/redux/slices/auth.slice";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/router";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Conversation() {
  const dispatch = useAppDispatch();
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
  });
  const [history, setHistory] = useState([]);

  const router = useRouter();

  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserText(transcript);
        await handleConversation({ message: transcript });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition]);

  const handleConversation = async (payload: { message: string }) => {
    try {
      const response = await StartConversation(payload);
      setAiResponse(response.conversation.aiResponse);
      speakText(response.conversation.aiResponse); // Ensure the AI response is spoken
      fetchHistory();
    } catch (error) {
      console.error("Error during conversation:", error);
      setAiResponse("Error getting response from AI.");
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const speakText = (text: string) => {
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      synth.speak(utterance);
    }
  };

  const handleStartConversation = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const handleStopConversation = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSendMessage = async () => {
    if (userText.trim()) {
      const messagePayload = { message: userText };
      await handleConversation(messagePayload);
      setUserText("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div>
      <div className="flex justify-between font-sarpanch items-center bg-teal-900 shadow-lg w-full h-10 py-8 px-4 md:p-8 text-white">
      <div><p className="mobile:text-2xl pc:text-4xl pad:p-5 mobile:p-0 font-sarpanch font-bold"><span className="text-black font-extrabold"> / </span><span className="text-white">Synthesis</span></p></div>
        <button
          onClick={handleLogout}
          className="bg-teal-700 shadow-2xl hover:bg-teal-600 text-white text-lg font-bold mobile:px-2 mobile:py-1 rounded-lg mobile:rounded-md"
        >
          Log-out
        </button>
      </div>

      <div className="flex flex-col font-sarpanch items-center justify-center min-h-screen bg-teal-900 p-4 mobile:pt-10 mobile:pb-8 pad:pb-0 pad:mb-0 pad: pc:pb-10 pc:pt-20">
        <div className="flex items-center mb-6">
          <button
            onClick={isListening ? handleStopConversation : handleStartConversation}
            className={`py-2 px-6 font-bold rounded-lg shadow-md hover:bg-green-700 transition-all duration-400 ease-in-out ${
              isListening ? "bg-red-500" : "bg-green-600"
            } text-white`}
          >
            {isListening ? "Stop Recording" : "Start Recording"}
          </button>
          <Mic
            onClick={isListening ? handleStopConversation : handleStartConversation}
            className={`ml-4 cursor-pointer text-4xl ${
              isListening ? "text-red-500" : "text-green-600"
            }`}
          />
        </div>

        <div className="flex mb-4 flex-col w-full max-w-lg">
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Type your message here..."
            className="border-none outline-none p-2 h-28 text-gray-700 font-bold rounded-t-2xl w-full"
          />

          <button
            onClick={handleSendMessage}
            className="bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all duration-300 ease-in-out w-full py-2 px-4 rounded-b-2xl md:mt-1 shadow-md"
          >
            Send
          </button>
        </div>

        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold text-teal-700">User Input</h2>
          <p className="p-3 border rounded mt-2 text-gray-500 font-semibold">
            {userText || "Waiting for input..."}
          </p>
        </div>

        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold text-teal-700">AI Response</h2>
          <p className="p-3 border rounded mt-2 text-gray-500 font-semibold">
            {aiResponse || "Awaiting response..."}
          </p>
        </div>

        {/* Conversation History Section with scroll */}
        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4 max-h-80 overflow-y-auto">
          <h2 className="text-lg font-bold text-teal-700">Conversation History</h2>
          <ul className="mt-3 space-y-2">
            {history.length > 0 ? (
              history.map((item: any, index) => (
                <li key={index} className="p-3 border-b last:border-b-0 text-gray-700">
                  <strong>User:</strong> {item.message} <br />
                  <strong>AI:</strong> {item.aiResponse}
                </li>
              ))
            ) : (
              <p className="text-gray-500 font-semibold">No conversation history available.</p>
            )}
          </ul>
        </div>

        {/* Voice Settings */}
        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg">
          <h2 className="text-lg font-bold text-teal-700">Voice Settings</h2>
          <div className="flex flex-col mt-4">
            <label className="text-teal-700 font-bold">Rate: {voiceSettings.rate}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })
              }
              className="mt-2"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label className="text-teal-700 font-bold">Pitch: {voiceSettings.pitch}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })
              }
              className="mt-2 text-black"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label className="text-teal-700 font-bold">Volume: {voiceSettings.volume}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })
              }
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
