import React from 'react'

interface IProps {
    altTxt: string;
  }

export default function Demo(props: any) {
  return (
    <div>
      <div className='flex justify-center pt-48'>
        <h1 className='text-6xl'>{props.altTxt}</h1>
      </div>
    </div>
  )
}
