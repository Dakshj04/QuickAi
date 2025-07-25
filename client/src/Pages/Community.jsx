import { useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { dummyPublishedCreationData } from '../assets/assets'
import { Heart } from 'lucide-react'

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const fetchCreations = async () => {
    setCreations(dummyPublishedCreationData)
  }
  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  return (
    <div className='flex-1 flex h-full flex-col gap-6 p-6'>
     <h1 className='text-xl font-semibold'>Creations</h1>
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 '>
        {creations.map((creation, index) => (
          <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
            <img src={creation.content} alt="" className='w-full h-full object-cover rounded-lg' />
            <div className=' absolute bottom-0 top-0 right-0 left-3 flex gap-2
            items-end justify-end group-hover:justify-between p-3
            group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
            <p className='text:sm hidden group-hover:block'>{creation.prompt}</p>
            <div className='flex gap-1 items-center'>
              <p>{creation.likes.length}</p>
              <Heart className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600 ' : 'text-white'}`} />
            </div>
          </div>
          </div>
         ))}
    </div>
    </div >
  )
}

export default Community
