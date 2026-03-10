// "use client"
// import React, { useState } from "react"

// const Tts: React.FC = (
//     {text}
// ) => {
// //   const [text, setText] = useState("")
//   const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
//   const [selectedVoice, setSelectedVoice] = useState<string>("")

//   const loadVoices = () => {
//     const availableVoices = window.speechSynthesis.getVoices()
//     setVoices(availableVoices)
//   }

//   const speak = () => {
//     if (!text) return

//     const utterance = new SpeechSynthesisUtterance(text)

//     const voice = voices.find(v => v.name === selectedVoice)
//     if (voice) {
//       utterance.voice = voice
//     }

//     utterance.rate = 1.1
//     utterance.pitch = 1.1

//     window.speechSynthesis.speak(utterance)
//   }

//   return (
//     <div>
//       <textarea
//         placeholder="Enter text..."
//         value={text}
//       />

//       <button onClick={loadVoices}>
//         Load Voices
//       </button>

//       <select
//         onChange={(e) => setSelectedVoice(e.target.value)}
//       >
//         {voices.map((voice) => (
//           <option key={voice.name} value={voice.name}>
//             {voice.name} ({voice.lang})
//           </option>
//         ))}
//       </select>

//       <button onClick={speak}>
//         Speak
//       </button>
//     </div>
//   )
// }

// export default Tts