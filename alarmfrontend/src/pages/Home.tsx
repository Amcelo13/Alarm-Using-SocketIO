import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../app/hooks'
import axios from 'axios'
import useSound from 'use-sound';
import { io } from 'socket.io-client';
const socket = io("http://localhost:4000");
import alarmSound from '../assets/alarmsample.mp3' 
const Home = () => {
  
  const [play, { stop }] = useSound(alarmSound);
  const userName = useAppSelector((state) => state?.userData?.username)
  const userID = useAppSelector((state) => state?.userData?.id as string)
  const inputRef = useRef<HTMLInputElement>(null)
  const name = JSON.stringify(userName)
  const [userAlarms, setUserAlarms] = useState([] as any)
  const [notification, setNotification] = useState("")

  useEffect(() => {
    socket.on(userID, (message: string) => {
      setNotification(message)
      play()
      setTimeout(() => {
        setNotification("")
        stop()
      }, 6000);
    });
    return () => {
      socket.off("message");
    };
  }, []);

  const getALarms = async () => {
    const res = await axios.get(`http://localhost:4000/getAlarmsByUserName/${userID}`)
    setUserAlarms(res.data)
  }
  useEffect(() => {
    getALarms()
    
  }, [])

  const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const time = inputRef.current?.value
    const time1 = time?.split("T")[0] + " " + time?.split("T")[1]+":00"
    await axios.post(`http://localhost:4000/setAlarm`, { time: time1, userInfo: userID })
    getALarms()
  }
  const timeListToShow = (time: string): string => {
    const date = new Date(time);
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    let formattedDate = date.toLocaleString('en-US', options);
    return formattedDate;
}

  return (
    <div>
      {notification !== "" ?
      <div style={{
        width: "100vw",
        height: "10vh", 
        backgroundColor: "coral"}}> {notification} </div>:""}

      <div style={{ color: "wheat" }}>
        Hi  {name.slice(1, name.length - 1)}
      </div>
      <h2>Set an Alarm</h2>
      <form onSubmit={handelSubmit}>
        <label htmlFor="time">Alarm Time:</label>
        <input type="datetime-local" id="time" name="time"
          ref={inputRef} 
          placeholder="e.g., 2023-11-05T13:30:00" required 
          style={{marginRight:"2rem", padding:".6rem"}}/>
        <button type="submit">Set Alarm</button>
      </form>

      <h1>All Alarms</h1>
      <div>
        {userAlarms.map((alarm: any, key) => {
          return (
            <div key={alarm.userInfo}>
              <p>{timeListToShow(alarm.time)}</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Home