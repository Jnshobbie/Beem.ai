"use client"
import React, { useEffect, useState } from 'react'; 
import { ThemeProvider as NextThemesProvider } from "next-themes"; 
import Header from '@/components/custom/Header';
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import AppSideBar from '@/components/custom/AppSideBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ActionContext } from '@/context/ActionContext';
import { useRouter } from 'next/navigation';

function Provider({children}) {
    const [messages, setMessages] = useState(); 
    const [userDetail, setUserDetail] = useState(); 
    const [action,setAction]=useState(); 
    const router=useRouter(); 
    const convex = useConvex(); 
    

    useEffect(() => {
        IsAutheicated(); 
    }, [])

    const IsAutheicated = async() => {
        if(typeof window !== undefined) {
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                if (!user?.email) 
                    router.push('/')
                    return;

                //Fetch from database 
                const result = await convex.query(api.users.GetUser, {
                    email: user.email 
                });

                // Ensure user has a token
                if (result) {
                    // Convert token to number and ensure it's valid
                    const token = Number(result.token);
                    const userWithToken = {
                        ...result,
                        token: isNaN(token) ? 50000 : token // Default to 50000 if token is NaN
                    };
                    setUserDetail(userWithToken);
                    // Update localStorage with the correct token
                    localStorage.setItem('user', JSON.stringify(userWithToken));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
    }

    return ( 
        <div className="flex flex-col min-h-screen">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}>
                <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
                    <MessagesContext.Provider value={{messages, setMessages}}>
                        <ActionContext.Provider value={{action,setAction}}>
                        <NextThemesProvider  
                            attribute="class"
                            defaultTheme="dark" 
                            enableSystem
                            disableTransitionOnChange 
                        >  
                            <SidebarProvider defaultOpen={false}>
                                <div className="flex flex-col flex-1">
                                    <Header/>  
                                    <div className="flex flex-1">
                                        <AppSideBar/>
                                        <main className="flex-1">
                                            {children}
                                        </main>
                                    </div>
                                </div>
                            </SidebarProvider>
                        </NextThemesProvider>
                        </ActionContext.Provider>
                    </MessagesContext.Provider>  
                </UserDetailContext.Provider> 
            </GoogleOAuthProvider>
        </div>
    ) 
}

export default Provider 