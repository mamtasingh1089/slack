// import React from 'react'
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// const ChatMarkdown = ({text}) => {
//   return (
//     <div>
//       <ReactMarkdown
//        remarkPlugins={[remarkGfm]}
//     components={{
// p:({children})=>(
//     <p className='text-sm leading-relaxed whitespace-pre-wrap'>
//         {children}
//         </p>
//   ),
// strong:({children})=>(
//     <strong className='font-semibold'>{children}</strong>
// ),
// em:({children})=>(
// <em className='font-semibold'>{children}</em>
// ),
// code:({inline,children})=>
//     inline ? (
//         <code className='bg-gray-200 px-1 rounded text-xs'>
//             {children}
//         </code>
//     ):(
//         <pre className='bg-gray-900 text-white p-3 rounded text-xs overflow-x-auto'>
//             <code>{children}</code>
//         </pre>
//     ),
//     blockquote:({children})=>(
//         <blockquote className='border-l-4 border-gray-400 pl-3 italic text-sm'>
//             {children}
//         </blockquote>
//     ),
//     ul:({children})=>(
//         <ul className='list-disc ml-5 text-sm'>
//             {children}
//         </ul>
//     ),
//     ol:({children})=>(
//         <ol className='list-decimal ml-5 text-sm'>
//             {children}
//         </ol>
//     )
// }}
//     >
//         {text}
//       </ReactMarkdown>
//     </div>
//   )
// }

// export default ChatMarkdown
