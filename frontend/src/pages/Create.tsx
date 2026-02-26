"use client"
import React,{useState, useEffect} from 'react'

const Create:React.FC = () => {
  const [res, setRes] = useState<String>();
  const connectBackend = async()=>{
    const response = await fetch("http://127.0.0.1:8000/generate",{
      method:"POST",
      headers:{
        "Content-Type":"text/plain"
      }
    });

    const data = await response.text()
    console.log(data)
    setRes(data)
  }

  useEffect(()=>{
    connectBackend()
  },[])
  return (
    <div>
      {res}
    </div>
  )
}

export default Create