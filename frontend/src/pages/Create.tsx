"use client"
import React,{useState, useEffect} from 'react'
interface createRes {
  message:String
}
const Create:React.FC = () => {
  const [res, setRes] = useState<createRes>();
  const connectBackend = async()=>{
    const response = await fetch("http://127.0.0.1:8000/create",{
      method:"GET",
      headers:{
        "Content-Type":"application/json"
      }
    });

    const data = await response.json()
    console.log(data)
    setRes(data.message)
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