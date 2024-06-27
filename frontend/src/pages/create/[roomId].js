import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import Canvas from "../../components/canvas";
import "../../app/globals.css";
import { CircularProgress } from "@mui/material";


const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState(null);
  const [videoDuration, setVideoDuration] = useState(); 
  const [videoUrl, setVideoUrl] = useState("");
  const [frameCount, setFrameCount] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

  const [inspirationPrompt, setInspirationPrompt] = useState("");
  const [inspirationImage, setInspirationImage] = useState(null);

  
  async function query(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/prompthero/openjourney-v4",
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    // console.log(response);
    const result = await response.blob();
    return URL.createObjectURL(result); 
  }
  
  const handleInspirationSubmit = async () => {
    if (!inspirationPrompt.trim()) return;
    setIsLoading(true); // Start loading
    try {
      const imageSrc = await query({ "inputs": inspirationPrompt });
      setInspirationImage(imageSrc);
      setInspirationPrompt("");
    } catch (error) {
      console.error("Error fetching inspiration image", error);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (roomId) {
      const socketInstance = io(`${API_URL}`);
      setSocket(socketInstance);
      socketInstance.emit("joinRoom", roomId);
      socketInstance.on("newChatMessage", (message) => {
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      axios
        .get(`${API_URL}/api/rooms/frames/${roomId}`)
        .then((response) => {
          const fetchedFrames = response.data;
          setFrameCount(fetchedFrames.length);
          setFrames(fetchedFrames);
          setFrameCount(fetchedFrames.length);
        })
        .catch((error) => console.error("Error fetching frames", error));

      axios
        .get(`${API_URL}/api/rooms/chat/${roomId}`)
        .then((response) => {
          const fetchedChatMessages = response.data;
          console.log(fetchedChatMessages);
        })
        .catch((error) => console.error("Error fetching chat messages", error));

      return () => socketInstance.disconnect();
    }
  }, [roomId, API_URL]);

  const handleSendChatMessage = async () => {
    if (chatInput.trim()) {
      const newMessage = { createdBy: "username", message: chatInput };
      await axios
        .post(`${API_URL}/api/rooms/chat`, {
          roomId,
          message: chatInput,
          createdBy: "username",
        })
        .then((response) => {
          console.log("Chat message sent", response);
          // setChatMessages((prevMessages) => [...prevMessages, newMessage]);
        })
        .catch((error) => console.error("Error sending chat message", error));

      socket.emit("sendChatMessage", {
        roomId,
        message: chatInput,
        createdBy: "username",
      });

      setChatInput("");
    }
  };


  const handleSaveFrame = async () => {
    const dataURL = document.querySelector("canvas").toDataURL();
    const base64Data = dataURL.split(",")[1];
    await axios
      .post(`${API_URL}/api/rooms/frames`, {
        roomId,
        base64Data: base64Data,
        createdBy: "username",
      })
      .then((response) => {
        const savedFrameUrl = response.data.Location;

        setFrames((prevFrames) => [...prevFrames, savedFrameUrl]);
        setFrameCount((prevCount) => prevCount + 1);
      })
      .catch((error) => console.error("Error saving frame", error));
  };

    const handleMergeFrames = async () => {
    setIsMerging(true);

    const duration = videoDuration || 1;
    if (isNaN(duration) || duration <= 0) {
      alert("Invalid video duration");
      setIsMerging(false);
      return;
    }
    await axios
      .get(
        `${API_URL}/api/rooms/merge-frames?roomId=${roomId}&videoLengthInSeconds=${duration}`,
      )
      .then((response) => {
        alert("Frames merged successfully!");
        setVideoUrl(`${API_URL}${response.data.videoUrl}`);
        console.log(response.data.videoUrl);
      })
      .catch((error) => alert("Error merging frames: " + error.message))
      .finally(() => setIsMerging(false));
  };

  
  const handleInviteFriend = () => {
    const inviteLink = `https://emagazinek.vercel.app/join/${roomId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        alert("Invite link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error copying invite link: ", err);
        alert("Failed to copy invite link.");
      });
  };
  const handleShareVideo = () => {
 
    const videoShareUrl = videoUrl; 
    navigator.clipboard.writeText(videoShareUrl)
      .then(() => {
        alert("Video link copied to clipboard! You can now paste and share it on your social media.");
      })
      .catch(err => console.error("Failed to copy video link: ", err));
  };
  const handleDownloadVideo = () => {
    const link = document.createElement('a');
    link.href = videoUrl; 
    link.download = "madewithemagazinek.mp4"; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
  };
  

  return (
    <div className="flex flex-col md:flex-row w-full bg-gray-100">
  
      
            <div className="inspiration-container max-w-[400px] w-full bg-gray-100 p-4 m-4 flex flex-col shadow-lg">
              <h1 className="text-xl md:text-3xl font-bold text-center mb-4 text-black">
                Get Inspiration
              </h1>

             {isLoading &&<div className="flex items-center justify-center">
              <CircularProgress />
              </div>
              }
              { inspirationImage && (
                <div className="image-container pb-4">
                  <img src={inspirationImage} alt="Inspiration" className="max-w-full h-auto" />
                </div>
              )}
              <input
                type="text"
                value={inspirationPrompt}
                onChange={(e) => setInspirationPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="input text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full px-3 py-2 mb-4"
              />
              <button
                onClick={handleInspirationSubmit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Generate Inspiration
              </button>
            </div>
        


      <div className="main-content flex-grow">
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
          <div className="bg-white shadow-xl rounded-lg p-4 m-4 w-full max-w-4xl">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-4 text-black">
              Room: {roomId}
            </h1>
            <div className="mb-5">
              <Canvas socket={socket} roomId={roomId} />
              <input
                type="text"
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                placeholder="Enter video duration in seconds"
                className="input duration-input text-black mt-2 w-full px-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="frame-counter mt-2 text-black ">
                <p>Frame Count: {frameCount}</p>
              </div>

              <button
                onClick={handleSaveFrame}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Frame
              </button>
              <button
                onClick={handleMergeFrames}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Merge Frames
              </button>
              <button
                onClick={handleInviteFriend}
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
              >
                Invite a Friend
              </button>
            </div>

            {isMerging && (
              <p className="text-center mt-5 text-black">Merging frames...</p>
            )}
            {videoUrl && (
              <div className="video-container mt-10 flex flex-col  items-center justify-center">
                <video controls>
                  <source src={videoUrl} type="video/mp4"  />
                  Your browser does not support the video tag.
                </video>
                <button onClick={handleShareVideo} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-2 align-center justify-center">
                Share Video
                </button>
                
              </div>
            )}
          </div>
        </div>
      </div>

      {/* chat starts here */}
      <div className="chat-container max-w-[400px] w-full bg-gray-100 p-4 m-4 flex flex-col shadow-lg h-screen ">
        <div className="messages flex-1 overflow-y-auto m-4 text-black">
          {chatMessages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.createdBy}:</strong> {msg.message}
            </p>
          ))}
        </div>
        <div className="p-4">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="input duration-input text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full px-3 py-2 mb-4"
          />
          <button
            onClick={handleSendChatMessage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;  