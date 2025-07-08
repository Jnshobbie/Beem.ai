"use client";
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export const countToken = (inputText) => {
  return inputText.trim().split(/\s+/).filter(word => word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const UpdateToken = useMutation(api.users.UpdateToken);
  const textareaRef = useRef(null);

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id
    });
    setMessages(result?.messages || []);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        GetAiResponse();
      }
    }
  }, [messages]);

  const GetAiResponse = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/ai-chat', {
        prompt: `${Prompt.CHAT_PROMPT}\n\n${messages.map(m => `${m.role}: ${m.content}`).join("\n")}`,
      });

      const raw = result.data.result;
      let aiContent = raw?.text || '[Empty response]';

      try {
        const parsedResponse = JSON.parse(aiContent);
        if (parsedResponse.response) {
          aiContent = parsedResponse.response;
        } else if (parsedResponse.text) {
          aiContent = parsedResponse.text;
        }
      } catch (parseError) {
        console.log('Response is not JSON, using as plain text');
      }

      const aiResp = {
        role: 'ai',
        content: aiContent
      };

      setMessages(prev => [...prev, aiResp]);

      await UpdateMessages({
        messages: [...messages, aiResp],
        workspaceId: id
      });

      const currentToken = Number(userDetail?.token);
      const tokensUsed = countToken(JSON.stringify(aiResp));
      const newToken = Math.max(isNaN(currentToken) ? 50000 : currentToken - tokensUsed, 0);

      if (userDetail?._id) {
        await UpdateToken({
          userId: userDetail._id,
          token: newToken
        });

        setUserDetail(prev => ({
          ...prev,
          token: newToken
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Chat generation error:", error);
      setLoading(false);
    }
  };

  const onGenerate = (input) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: input
      }
    ]);
    setUserInput('');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide px-4">
        {messages?.map((msg, index) => (
          <div key={index}
            className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7"
            style={{ backgroundColor: Colors.CHAT_BACKGROUND }}>
            {msg?.role === 'user' &&
              <Image src={userDetail?.picture || "/placeholder.png"} alt="userImage"
                width={35} height={35} className="rounded-full" />}
            <div className="flex flex-col gap-2">
              <ReactMarkdown>
                {typeof msg.content === 'string'
                  ? msg.content
                  : msg.content?.text || '[Empty response]'}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="p-3 rounded-lg mb-2 flex gap-2 items-center"
          style={{ backgroundColor: Colors.CHAT_BACKGROUND }}>
          <Loader2Icon className="animate-spin" />
          <h2>Generating response...</h2>
        </div>}
      </div>

     
      <div className="w-full max-w-3xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#121212] rounded-3xl shadow-inner px-4 py-3 w-full transition-all duration-300 border border-neutral-700">
          <textarea
            ref={textareaRef}
            placeholder="Ask Beem your AI engineer..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder:text-gray-400 min-h-[40px] max-h-[150px]"
          />
          <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">

            {userInput && (
              <ArrowRight
                onClick={() => onGenerate(userInput)}
                className="h-8 w-8 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 text-white"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView
