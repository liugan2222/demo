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
      {/* <div className="h-[414px] p-6 bg-white rounded-md shadow border border-zinc-300 flex-col justify-start items-start gap-6 inline-flex">
        <div className="self-stretch h-[50px] flex-col justify-start items-start gap-1.5 flex">
            <div className="self-stretch text-zinc-950 text-2xl font-semibold font-['Inter'] leading-normal">Create an account</div>
            <div className="self-stretch text-zinc-600 text-sm font-normal font-['Inter'] leading-tight">Enter your email below to create your account</div>
        </div>
        <div className="self-stretch h-[228px] flex-col justify-start items-start gap-4 flex">
            <div className="self-stretch justify-start items-center gap-6 inline-flex">
                <div className="grow shrink basis-0 h-10 px-4 py-2 bg-white rounded border border-zinc-500 justify-center items-center gap-2 flex">
                    <div className="w-4 h-4 relative" />
                    <div className="text-zinc-900 text-sm font-medium font-['Inter'] leading-tight">Button</div>
                </div>
                <div className="grow shrink basis-0 h-10 px-4 py-2 bg-white rounded border border-zinc-500 justify-center items-center gap-2 flex">
                    <div className="w-4 h-4 relative" />
                    <div className="text-zinc-900 text-sm font-medium font-['Inter'] leading-tight">Button</div>
                </div>
            </div>
            <div className="self-stretch h-4 flex-col justify-center items-start gap-6 flex">
                <div className="w-[147.15px] px-2 bg-white justify-center items-center gap-2.5 inline-flex">
                    <div className="text-center text-zinc-600 text-xs font-normal font-['Inter'] leading-none">OR CONTINUE WITH</div>
                </div>
                <div className="self-stretch h-[0px] flex-col justify-start items-start gap-2.5 flex">
                    <div className="self-stretch h-[0px] border border-zinc-300"></div>
                </div>
            </div>
            <div className="self-stretch h-[140px] flex-col justify-start items-start gap-4 flex">
                <div className="self-stretch h-[62px] flex-col justify-start items-start gap-2 flex">
                    <div className="self-stretch text-zinc-900 text-sm font-medium font-['Inter'] leading-[14px]">E-mail</div>
                    <div className="self-stretch h-10 flex-col justify-start items-start gap-2 flex">
                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded border border-zinc-500 justify-start items-center gap-1 inline-flex">
                            <div className="grow shrink basis-0 text-zinc-600 text-sm font-normal font-['Inter'] leading-tight">m@example.com</div>
                        </div>
                    </div>
                </div>
                <div className="self-stretch h-[62px] flex-col justify-start items-start gap-2 flex">
                    <div className="self-stretch text-zinc-900 text-sm font-medium font-['Inter'] leading-[14px]">Password</div>
                    <div className="self-stretch h-10 flex-col justify-start items-start gap-2 flex">
                        <div className="self-stretch h-10 px-3 py-2 bg-white rounded border border-zinc-500 justify-start items-center gap-1 inline-flex">
                            <div className="grow shrink basis-0 text-zinc-600 text-sm font-normal font-['Inter'] leading-tight">*********</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="self-stretch h-10 px-4 py-2 bg-green-700 rounded justify-center items-center gap-2 inline-flex">
            <div className="text-white text-sm font-medium font-['Inter'] leading-tight">Create account</div>
        </div>
      </div> */}
    </div>
  )
}
