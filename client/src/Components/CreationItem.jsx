import React from 'react'

const CreationItem = ({ item }) => {
    return (
        <div className='p-4 max-w-5xl cursor-pointer text-sm bg-white border border-gray-200 rounded-lg'>
            <div className='flex justify-between items-center gap-4'>
                <div>
                    <h2>
                        {item.prompt}
                    </h2>
                    <p>
                        {item.type} - {new Date(item.createdAt).toLocaleDateString()}
                     </p>
                </div> 
                <button></button>
            </div>
        </div>
    )
}

export default CreationItem
