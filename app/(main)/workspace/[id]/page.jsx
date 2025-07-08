import ChatView from '@/components/custom/ChatView'
import CodeView from '@/components/custom/CodeView' 
import React from 'react'

function Workspace ({ params }) {
    // Extract the id parameter from the dynamic route
    const { id } = params;
    
    console.log("Workspace ID:", id);
    
    return (
        <div className='p-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <ChatView workspaceId={id}/>
                <div className='col-span-2'>
                <CodeView workspaceId={id}/>
                </div>
            </div>
        </div> 
    )
}

export default Workspace 