import Image from 'next/image'
import React, { useContext } from 'react'
import { Button } from '../ui/button'
import Colors from '@/data/Colors'
import { UserDetailContext } from '@/context/UserDetailContext'
import { Download as LucideDownload, Rocket } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '../ui/sidebar'
import { ActionContext } from '@/context/ActionContext'

function Header() { 
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const path= usePathname();
    const {toggleSidebar}=useSidebar();
    const {action,setAction}=useContext(ActionContext); 

    const onActionBtn=(action)=>{
        setAction({
            actionType:action, 
            time5stamp:Date.now() 
        })
    }
     

    return (
        <div className='p-4 flex justify-between items-center h-[60px]'>
            <div className="relative w-[100px] h-[100px] -mt-1">
                <Image 
                    src={'/logo.png'} 
                    alt='logo' 
                    fill
                    className="object-contain"
                />
            </div>     
            {(!userDetail || !userDetail.name) ? (
                <div className='flex gap-5'>
                    <Button variant="ghost">Sign in</Button>
                    <Button className="text-white" style={{
                        backgroundColor: Colors.BLUE 
                    }}>Get Started</Button>  
                </div>
            ) : (
                path?.includes('workspace') && (
                    <div className='flex gap-2 items-center'>
                        <Button variant="ghost" onClick={()=>onActionBtn('export')}><LucideDownload /> Export </Button>
                        <Button className='bg-blue-500 text-white hover:bg-blue-600'
                        onClick={()=>onActionBtn('deploy')}><Rocket />Deploy</Button>
                        {userDetail && (
                            <Image 
                                src={userDetail?.picture} 
                                alt='user' 
                                width={30} 
                                height={30}
                                className='rounded-full w-[30px] cursor-pointer'
                                onClick={toggleSidebar}
                            />
                        )}
                    </div>
                )
            )}
        </div> 
    )
}

export default Header 