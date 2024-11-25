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
    responsiveVoice: any;
  }
}

export default function Conversation() {
  const dispatch = useAppDispatch();
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
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
      // Configure recognition settings
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";


      // Handle recognition results
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserText(transcript);
        await handleConversation({ message: transcript });
      };

      // Handle recognition errors
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      // Handle recognition end
      recognition.onend = () => {
        setIsListening(false);
      };
    }

  }, [recognition]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkResponsiveVoice = setInterval(() => {
        if (window.responsiveVoice) {
          console.log("ResponsiveVoice is available!");
          console.log("Available Voices:", window.responsiveVoice.getVoices());
          clearInterval(checkResponsiveVoice);
        } else {
          console.warn("ResponsiveVoice is not yet available.");
        }
      }, 500);
    }
  },[])
  

  const handleConversation = async (payload: { message: string }) => {
    try {
      const response = await StartConversation(payload);
      setAiResponse(response.conversation.aiResponse);
      speakText(response.conversation.aiResponse); // Speak AI response
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
    if (typeof window !== "undefined" && window.responsiveVoice) {
      console.log("Speaking with ResponsiveVoice:", text);
      window.responsiveVoice.speak(
        text,
        "UK English Male", // Choose a voice from the available voices
        {
          pitch: voiceSettings.pitch, // Use voice settings for pitch
          rate: voiceSettings.rate,   // Use voice settings for rate
          volume: voiceSettings.volume, // Use voice settings for volume
          onend: () => console.log("Speech finished"),
        }
      );
    } else if (synth) {
      console.warn("ResponsiveVoice is not available or script not loaded, falling back to speechSynthesis.");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      synth.speak(utterance);
    } else {
      console.error("No speech synthesis method available.");
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

  const handleCopy = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset copy status after 2 seconds
      });
    }
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
            className="border-none outline-none p-2 h-28 text-black font-bold rounded-t-2xl w-full"
          />

          <button
            onClick={handleSendMessage}
            className="bg-green-600 text-white font-bold text-xl hover:bg-green-700 transition-all duration-300 ease-in-out w-full py-2 px-4 rounded-b-2xl md:mt-1 shadow-md"
          >
            Send
          </button>
        </div>

        <div className="sm:flex-none pad:flex gap-10 mb-4 w-full max-w-lg">
          <div className="w-full max-w-lg bg-teal-800 shadow-md rounded-lg mb-4">
            <h2 className="text-lg font-bold text-white p-2">Scan User Input</h2>
            <textarea
              className="p-2 border rounded-xl mt-2 text-gray-500 font-semibold h-52 pad:w-[30rem] w-full border-none outline-none resize-none"
              value={userText || "Waiting for input..."}
              readOnly
            />
          </div>

          <div className="w-full max-w-lg bg-teal-800 shadow-md rounded-lg mb-4">
          
            {/* Header with Copy Icon */}
            <div className="flex justify-between items-center p-2">
            <h2 className="text-lg font-bold text-white">AI Response</h2>
            <button
              onClick={handleCopy}
              className="text-white flex items-center gap-1 hover:opacity-80 transition-opacity"
              title="Copy AI Response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16h8M8 12h8m-9 8h10a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{copySuccess ? "Copied!" : "Copy"}</span>
            </button>
           </div>
              <textarea
                className="p-2 border rounded-xl mt-2 text-black font-semibold h-52 pad:w-[30rem] w-full border-none outline-none resize-none"
                value={aiResponse || "Awaiting response..."}
                readOnly
              />
          </div>
        </div>



        <div className="sm:flex-none pad:flex gap-10 mb-4 w-full max-w-lg">

          <div>
          {/* Conversation History Section with scroll */}
          <div className="w-full max-w-lg rounded-lg mb-4 bg-teal-800 shadow-md">
          {/* Title and Dropdown Toggle */}
          <div
            className="flex justify-between items-center cursor-pointer w-[30rem] p-2"
            onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
          >
            <h2 className="text-lg font-bold text-white">Conversation History</h2>
            <span
              className={`text-white transition-transform transform ${
                historyDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>

          {/* Conversation History Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out bg-white rounded-sm ${
              historyDropdownOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="mb-1 p-2 space-y-2">
              {history.length > 0 ? (
                history.map((item: any, index: number) => (
                  <li key={index} className="p-3 text-gray-700">
                    <strong>User:</strong> {item.message} <br />
                    <strong>AI:</strong> {item.aiResponse}
                  </li>
                ))
              ) : (
                <p className="text-gray-500 font-semibold">
                  No conversation history available.
                </p>
              )}
            </ul>
            </div>
          </div>
          </div>



        <div>
          <div className="w-full max-w-lg bg-teal-800 shadow-md rounded-lg">
          {/* Title and Dropdown Toggle */}
            <div
              className="flex justify-between items-center w-[30rem] p-2 cursor-pointer"
              onClick={() => setVoiceDropdownOpen(!voiceDropdownOpen)}
            >
              <h2 className="text-lg font-bold text-white">Voice Settings</h2>
              <span
                className={`transition-transform transform text-white ${
                  voiceDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </div>

              {/* Settings Content with Transition */}
              <div
                className={` overflow-hidden transition-all duration-500 delay-200 ease-in-out ${
                  voiceDropdownOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-3 text-white">
                  {/* Rate Setting */}
                  <div className="flex flex-col">
                    <label className="font-bold">Rate: {voiceSettings.rate}</label>
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
                  {/* Pitch Setting */}
                  <div className="flex flex-col mt-4">
                    <label className="font-bold">Pitch: {voiceSettings.pitch}</label>
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
                  {/* Volume Setting */}
                  <div className="flex flex-col mt-4">
                    <label className="font-bold">Volume: {voiceSettings.volume}</label>
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
          </div>
        </div>
      </div>
    </div>
  );
}
