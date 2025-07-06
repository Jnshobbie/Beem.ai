"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "../../data/Lookup";
import { MessagesContext } from "../../context/MessagesContext";
import axios from "axios";
import Prompt from "../../data/Prompt";
import { Loader2Icon } from "lucide-react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams } from "next/navigation";
import { countToken } from "./ChatView";
import { UserDetailContext } from "../../context/UserDetailContext";
import SandpackPreviewClient from "./SandpackPreviewClient";
import { ActionContext } from "../../context/ActionContext";

function CodeView() {
  const { id } = useParams();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const { messages } = useContext(MessagesContext);
  const UpdateFiles = useMutation(api.workspace.UpdateFiles);
  const UpdateToken = useMutation(api.users.UpdateToken);
  const convex = useConvex();
  const [loading, setLoading] = useState(false);
  const {action,setAction}=useContext(ActionContext); 

  useEffect(() => {
    id && GetFiles();
  }, [id])

  useEffect(()=>{
    setActiveTab('preview');
  },[action])

  const GetFiles = async () => {
    setLoading(true);
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    const mergedFiles = { ...Lookup.DEFAULT_FILE, ...result.fileData };
    setFiles(mergedFiles);
    setLoading(false);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        GenerateAiCode();
      }
    }
  }, [messages]);

  const GenerateAiCode = async () => {
    setLoading(true);
    const recentMessages = messages.slice(-5);
    const PROMPT = `CONTEXT: ${JSON.stringify(recentMessages)}\n\nINSTRUCTION: ${Prompt.CODE_GEN_PROMPT}`;

    try {
      const result = await axios.post("/api/gen-ai-code", { prompt: PROMPT });
      const aiResp = result.data;
      const mergedFiles = { ...Lookup.DEFAULT_FILE, ...aiResp?.files };
      setFiles(mergedFiles);

      await UpdateFiles({
        workspaceId: id,
        files: aiResp?.files,
      });

      // Ensure token is a valid number because i was getting a error at first in the database
      const currentToken = Number(userDetail?.token);
      const tokensUsed = countToken(JSON.stringify(aiResp));
      const newToken = Math.max(isNaN(currentToken) ? 50000 : currentToken - tokensUsed, 0);

      console.log(" Used Tokens:", tokensUsed, "Remaining:", newToken);

      if (userDetail?._id) {
        await UpdateToken({
          userId: userDetail._id,
          token: newToken
        });
        
        // Update local user detail
        setUserDetail(prev => ({
          ...prev,
          token: newToken
        }));
      }

      setLoading(false);
    } catch (err) {
      console.error(" Code generation error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#181818] w-full p-2 border">
        <div className="flex items-center flex-wrap shrink-0 bg-black p-1 justify-center rounded-full w-[140px] gap-3">
          <h2
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer ${
              activeTab === "code"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : ""
            }`}
          >
            Code
          </h2>
          <h2
            onClick={() => setActiveTab("preview")}
            className={`text-sm cursor-pointer ${
              activeTab === "preview"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : ""
            }`}
          >
            Preview
          </h2>
        </div>
      </div>

      <SandpackProvider
        files={files}
        template="react"
        theme="dark"
        customSetup={{
          dependencies: {
            ...Lookup.DEPENDANCY,
          },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
      >
        <SandpackLayout>
          <SandpackFileExplorer style={{ height: "80vh" }} />
          {activeTab === "code" && (
            <SandpackCodeEditor style={{ height: "80vh" }} />
          )}
          {activeTab === "preview" && (
           <>
           <SandpackPreviewClient/>
           </>
          )}
        </SandpackLayout>
      </SandpackProvider>

      {loading && (
        <div className="p-10 bg-gray-900 opacity-80 absolute top-0 rounded-lg w-full h-full flex items-center justify-center">
          <Loader2Icon className="animate-spin h-10 w-10 text-white" />
          <h2 className="text-white ml-4">Generating your files...</h2>
        </div>
      )}
    </div>
  );
}

export default CodeView;
