"use client";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Colors from "@/data/Colors";
import Lookup from "@/data/Lookup";
import { ArrowRight, Link } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";

function Hero() {
  const [userInput, setUserInput] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask Beem to help you build...");
  const placeholderList = [
    "Ask Beem to build a landing page...",
    "Ask Beem to generate a blog...",
    "Ask Beem to automate your business...",
    "Ask Beem to build a full-stack app..."
  ];

  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();

  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }

    const msg = {
      role: "user",
      content: input,
    };

    setMessages(msg);

    const workspaceId = await CreateWorkspace({
      user: userDetail._id,
      messages: [msg],
    });

    router.push("/workspace/" + workspaceId);
  };

  // Animated placeholder effect
  useEffect(() => {
    let index = 0;
    let charIndex = 0;
    let currentText = "";
    let isDeleting = false;

    const interval = setInterval(() => {
      currentText = placeholderList[index];
      if (isDeleting) {
        setPlaceholder(currentText.substring(0, charIndex--));
        if (charIndex < 0) {
          isDeleting = false;
          index = (index + 1) % placeholderList.length;
        }
      } else {
        setPlaceholder(currentText.substring(0, charIndex++));
        if (charIndex === currentText.length + 10) {
          isDeleting = true;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center mt-36 xl:mt-10 gap-2 px-4">
      <h2 className="font-bold text-4xl text-white text-center">{Lookup.HERO_HEADING}</h2>
      <p className="text-gray-400 font-medium text-center">{Lookup.HERO_DESC}</p>

      <div
        className="rounded-2xl max-w-3xl w-full mt-6 shadow-lg"
        style={{ backgroundColor: "#141414", padding: "1.5rem" }}
      >
        <div className="flex items-center gap-2">
          <textarea
            placeholder={placeholder}
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            className="outline-none bg-transparent text-white w-full h-16 resize-none text-base placeholder-gray-400"
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-blue-500 p-2 h-8 w-8 rounded-md cursor-pointer text-white"
            />
          )}
        </div>
        <div className="mt-2">
          <Link className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      <div className="flex mt-6 flex-wrap max-w-2xl items-center justify-center gap-3">
        {Lookup.SUGGSTIONS.map((suggestion, index) => (
          <h2
            key={index}
            onClick={() => onGenerate(suggestion)}
            className="p-1 px-2 border border-gray-600 rounded-full text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            {suggestion}
          </h2>
        ))}
      </div>

      <SignInDialog openDialog={openDialog} closeDialog={(v) => setOpenDialog(v)} />
    </div>
  );
}

export default Hero;
