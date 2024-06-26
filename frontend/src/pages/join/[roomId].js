import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Canvas from '../../components/canvas';
import "../../app/globals.css";

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState(null);
  const [videoDuration, setVideoDuration] = useState(); // Default to 1 second
  const [videoUrl, setVideoUrl] = useState('');
  const [frameCount, setFrameCount] = useState(0); 
  const [isMerging, setIsMerging] = useState(false);
  const [frames, setFrames] = useState([]);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  


  useEffect(() => {
    if (roomId) {
      const socketInstance = io('https://emagazinek.onrender.com');
      setSocket(socketInstance);
      socketInstance.emit('joinRoom', roomId);   
      socketInstance.on('newChatMessage', (message) => {
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });
  

      // socketInstance.on('frameSaved', (data) => {
      //   console.log('New frame added', data.frame);
      //   setFrames((prevFrames) => [...prevFrames, data.frame.s3Url]); 
      //   setFrameCount((prevCount) => prevCount + 1);
      // });

      axios.get(`https://emagazinek.onrender.com/api/rooms/frames/${roomId}`)
        .then(response => {
        //   console.log('Frames fetched', response.data);
          const fetchedFrames = response.data;
          setFrameCount(fetchedFrames.length);
          setFrames(fetchedFrames);
        setFrameCount(fetchedFrames.length); 
        })
        .catch(error => console.error('Error fetching frames', error));
  
      return () => socketInstance.disconnect();
    }
    // axios.get(`https://emagazinek.onrender.com/api/rooms/chat/${roomId}`)
    //   .then(response => {
    //     // console.log('Chat messages fetched', response.data);
    //     const fetchedChatMessages = response.data;
    //     setChatMessages(fetchedChatMessages);
    //   })
    //   .catch(error => console.error('Error fetching chat messages', error));

    // return () => socketInstance.disconnect();
      }, [roomId]);

  const handleSendChatMessage = async () => {
    if (chatInput.trim()) {
      const newMessage = { createdBy: 'username', message: chatInput }; 
      await axios.post('https://emagazinek.onrender.com/api/rooms/chat', {
        roomId,
        message: chatInput,
        createdBy: 'username',
      })
      .then(response => {
        console.log('Chat message sent', response);
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      })
      .catch(error => console.error('Error sending chat message', error));
      
      socket.emit('sendChatMessage', { roomId, message: chatInput, createdBy: 'username' });

      // setChatMessages((prevMessages) => [...prevMessages, newMessage]); 
      setChatInput(''); 
    }
  };
  // const newChatMessage = (message) => {
  //   setChatMessages((prevMessages) => [...prevMessages, message]);
    
  // };
  

  const handleSaveFrame = async () => {
    const dataURL = document.querySelector('canvas').toDataURL();
    const base64Data = dataURL.split(':')[1];
    await axios.post('https://emagazinek.onrender.com/api/rooms/frames', {
      roomId,
      base64Data: base64Data, 
      createdBy: 'username', 
    }).then(response => {
        // console.log('Frame saved', response);
        const savedFrameUrl = response.data.Location;
        
        setFrames((prevFrames) => [...prevFrames, savedFrameUrl]);
        setFrameCount((prevCount) => prevCount + 1);
        })
        .catch(error => console.error('Error saving frame', error));
  };



  const handleMergeFrames = async () => {
    setIsMerging(true);

    const duration = videoDuration || 1;
    if(isNaN(duration) || duration <= 0) {
      alert('Invalid video duration');
      setIsMerging(false);
      return;
    }
    await axios.get(`https://emagazinek.onrender.com/api/rooms/merge-frames?roomId=${roomId}&videoLengthInSeconds=${duration}`)
      .then(response => {
        alert('Frames merged successfully!');
        setVideoUrl(`https://emagazinek.onrender.com${response.data.videoUrl}`);
        console.log(response.data.videoUrl);
      })
      .catch(error => alert('Error merging frames: ' + error.message))
      .finally(() => setIsMerging(false));
  };

  const handleInviteFriend = () => {
    const inviteLink = `https://emagazinek.vercel.app/join/${roomId}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        alert('Invite link copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying invite link: ', err);
        alert('Failed to copy invite link.');
      });
  };

  const fetchAndProcessFrame = async (frameUrl) => {
    try {

      const response = await axios({
        method: 'get',
        url: frameUrl,
        responseType: 'blob',
      });
  
      const reader = new FileReader();
      reader.readAsDataURL(response.data);
      reader.onloadend = function() {
        const base64data = reader.result;
        console.log('Base64 data:', base64data);
        return base64data;
      };
    } catch (error) {
      console.error('Error fetching and processing frame:', error);
    }
  };

  return (
    <div className="flex flex-row w-full bg-gray-100">
            {/* <div className="w-1/3 flex flex-col items-center h-screen">
                <h1 className='text-4xl text-black font-bold mt-10'>Frames</h1>
                <div className="frames-container w-full flex flex-col items-center justify-center bg-white shadow-lg mt-5 overflow-auto">
                {frames.length === 0 ? (
                    <div className="text-xl text-black font-semibold flex items-center justify-center h-full">No frames saved yet</div>
                ) : (
                    frames.map((frameUrl, index) => (
                        console.log(frameUrl),
                    <img key={index} src={fetchAndProcessFrame(frameUrl)} alt={`Frame ${index + 1}`} className="frame-image m-2" />
                    ))
                )}
                </div>
            </div> */}
            



      <div className="main-content flex-1">
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-4 m-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">Room: {roomId}</h1>
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
        <div className="flex justify-center space-x-4">
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
       
        
        {isMerging && <p className="text-center mt-5 text-black">Merging frames...</p>}
        {videoUrl && (
          <div className="video-container mt-10">
            <video controls>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
       
      </div>
    </div>
    </div>

    {/* chat starts here */}
    <div className="chat-container max-w-[400px] w-full bg-gray-100 p-4 m-4 flex flex-col shadow-lg h-screen ">
      <div className="messages flex-1 overflow-y-auto m-4 text-black">
      {chatMessages.map((msg, index) => (
        <p key={index}><strong>{msg.createdBy}:</strong> {msg.message}</p>
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
        <button onClick={handleSendChatMessage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
          Send
        </button>
      </div>
    </div>
  </div>
  // </div>
  );
};

export default Room;