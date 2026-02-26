"use client"
import React, { useState, type FormEvent } from "react"

interface ReqBody {
  topic: string
  subject?: string
  chaos_score?: number
  style: "sigma" | "delulu" | "conspiracy" | "npc"
}

const Create: React.FC = () => {
  const [res, setRes] = useState<string | null>(null)
  const [reqBody, setReqBody] = useState<ReqBody>({
    topic: "",
    subject: "",
    chaos_score: undefined,
    style: "conspiracy"
  })

  const handleChange =(
    e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  )=>{
    const {name, value} = e.target;
    if(name === "chaos_score"){
      const num = value === "" ? undefined : Number(value);
      setReqBody({
        ...reqBody,chaos_score: Number.isNaN(num) ? undefined : num
      })

      return;
    }

    setReqBody({
      ...reqBody,
      [name]:value
    })


  }

  const handleSubmit= async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();

    try{
      const response = await fetch("http://127.0.0.1:8000/generate",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body : JSON.stringify(reqBody),
      })
      

      if (!response.ok){
        throw new Error(`Request Failed:${response.status}`)
      }

      if (!response.body){
        const text = await response.text()
        setRes(text)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let done = false

      while (!done){
        const result = await reader.read();
        done = result.done

        if(result.value){
          const chunk = decoder.decode(result.value, {stream:true})

          setRes(prev=>(prev??"")+chunk)
        }
      }

    }catch(err)
    {
      console.error(err)
    }

  }
  return (
    <>
      {res !== null ? (
        <div>
          <h2>Generated Brainrot:</h2>
          <p>{res}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="topic"
            placeholder="Topic"
            onChange={handleChange}
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            onChange={handleChange}
          />

          <input
            type="number"
            name="chaos_score"
            placeholder="Chaos Score"
            min={1}
            max={100}
            onChange={handleChange}
          />

          <select name="style" onChange={handleChange}>
            <option value="sigma">Sigma</option>
            <option value="delulu">Delulu</option>
            <option value="conspiracy">Conspiracy</option>
            <option value="npc">NPC</option>
          </select>

          <button type="submit">Submit</button>
        </form>
      )}
    </>
  )
}

export default Create
