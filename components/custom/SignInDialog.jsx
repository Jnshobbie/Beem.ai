import React, { useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Lookup from '@/data/Lookup'
import { Button } from '../ui/button'
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import uuid4 from 'uuid4';

function SignInDialog({ openDialog, closeDialog }) {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);
  const GetUser = useQuery(api.users.GetUser, userDetail?.email ? { email: userDetail.email } : 'skip');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo', 
          { headers: { Authorization: 'Bearer ' + tokenResponse?.access_token } },
        );

        const user = userInfo.data;
        
        // Create or get user
        const createdUser = await CreateUser({
          name: user?.name,
          email: user?.email,
          picture: user?.picture,
          uid: uuid4()
        });

        if (createdUser) {
          // Store user data in localStorage
          if (typeof window !== undefined) {
            localStorage.setItem('user', JSON.stringify(createdUser));
          }

          // Update user detail in context
          setUserDetail(createdUser);
          closeDialog(false);
        } else {
          console.error('Failed to create/get user');
        }
      } catch (error) {
        console.error('Error during sign in:', error);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center justify-center">
              <h2 className='font-bold tex-2xl text-center text-white'>{Lookup.SIGNIN_HEADING}</h2>
              <p className='mt-2 text-center'>{Lookup.SIGNIN_SUBHEADING}</p>
              <Button className="bg-blue-500 text-white hover:bg-blue-400 mt-3" onClick={googleLogin}>Sign In With Google</Button>
              <p>{Lookup.SIGNIn_AGREEMENT_TEXT}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default SignInDialog