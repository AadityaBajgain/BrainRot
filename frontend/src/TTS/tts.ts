
const tts = (text:string, chaos:number)=>{
    const  utterance = new SpeechSynthesisUtterance(text);

    if (chaos <= 3) {
    utterance.rate = 0.95
    utterance.pitch = 1
    } else if (chaos <= 7) {
    utterance.rate = 1.1
    utterance.pitch = 1.1
    } else {
    utterance.rate = 1.25
    utterance.pitch = 1.2
    }

    window.speechSynthesis.speak(utterance)
}

const voices = window.speechSynthesis.getVoices()
const englishVoices = voices.filter(v => v.lang.includes("en"))