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
    <>
      <div className="flex justify-between items-center bg-blue-600 shadow-lg w-full h-16 py-8 px-4 md:p-8 text-white">
        <h1 className="md:text-3xl text-lg font-bold">AI Conversation</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={isListening ? handleStopConversation : handleStartConversation}
            className={`py-2 px-6 rounded-lg shadow-md ${
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

        <div className="flex mb-4 flex-col md:flex-row w-full max-w-lg">
          <input
            type="text"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Type your message here..."
            className="border p-3 text-gray-700 rounded-lg w-full md:w-2/3"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-3 md:mt-0 md:ml-3 shadow-md"
          >
            Send
          </button>
        </div>

        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold text-blue-600">User Input</h2>
          <p className="p-3 border rounded mt-2 text-gray-700">
            {userText || "Waiting for input..."}
          </p>
        </div>

        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold text-blue-600">AI Response</h2>
          <p className="p-3 border rounded mt-2 text-gray-700">
            {aiResponse || "Awaiting response..."}
          </p>
        </div>

        {/* Conversation History Section with scroll */}
        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mb-4 max-h-80 overflow-y-auto">
          <h2 className="text-lg font-semibold text-blue-600">Conversation History</h2>
          <ul className="mt-3 space-y-2">
            {history.length > 0 ? (
              history.map((item: any, index) => (
                <li key={index} className="p-3 border-b last:border-b-0 text-gray-700">
                  <strong>User:</strong> {item.message} <br />
                  <strong>AI:</strong> {item.aiResponse}
                </li>
              ))
            ) : (
              <p className="text-gray-500">No conversation history available.</p>
            )}
          </ul>
        </div>

        {/* Voice Settings */}
        <div className="w-full max-w-lg bg-white shadow-md p-4 rounded-lg mt-4">
          <h2 className="text-lg font-semibold text-blue-600">Voice Settings</h2>
          <div className="flex flex-col mt-4">
            <label className="text-gray-600">Rate: {voiceSettings.rate}</label>
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
            <label className="text-gray-600">Pitch: {voiceSettings.pitch}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) =>
                setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })
              }
              className="mt-2"
            />
          </div>
          <div className="flex flex-col mt-4">
            <label className="text-gray-600">Volume: {voiceSettings.volume}</label>
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
    </>
  );
}
