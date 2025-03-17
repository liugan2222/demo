import React from 'react'

interface DemoProps {
  altTxt: string;
}

export default function Demo({ altTxt }: DemoProps) {
  return (
    <div>
      <div className='flex justify-center pt-48'>
        <h1 className='text-6xl'>{altTxt}</h1>
      </div>
    </div>
  )
}
