import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'
import styled from 'styled-components'
import tmi, { ChatUserstate } from 'tmi.js';
import find from 'lodash.find';



export interface Chat {
  tags: ChatUserstate;
  message: string;
}


// discard old message
// if (messages.length > 50) {
//   let oldMessages = [].slice.call(messages).slice(0, 10);

//   //  setMesssages(oldM)
// }

export const Home = (): React.ReactElement => {
  const router = useRouter()
  const { streamername }: string = router.query
  const [messages, setMesssages] = useState<Chat[]>([]);
  const [socketClient, setSocketClient] = useState();


  useEffect(() => {
    if (streamername !== undefined) {
      const client = new tmi.Client({
        connection: { reconnect: true },
        channels: [`${streamername}`]
      });
      setSocketClient(client)
      client.connect();
    }

  }, [streamername]);

  useEffect(() => {

    if (socketClient !== undefined) {
      socketClient.on('message', (channel, tags: ChatUserstate, message: string, self) => {
        let merged: Chat = { tags, message };
        const exists: boolean = !!find(messages, merged);
        if (!exists) {
          setMesssages(messages => [...messages, merged])
        }
      });
    }

  }, [socketClient]);

  console.log({ messages });

  return (<div>
    <Title>Title</Title>
    {messages.map((x: Chat, i: number) => {
      const { tags, message } = x
      const { 'message-type': messageType, 'display-name': displayName, color, } = tags
      return (<p key={i}> <strong style={{ color: color }}>{displayName}</strong>: {message}</p>)
    })}
  </div >)
}

const Title = styled.h1`
  color: blue;
  font-size: 50px;
`




export default Home;
