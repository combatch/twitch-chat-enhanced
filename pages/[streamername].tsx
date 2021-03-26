import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'
import styled from 'styled-components'
import tmi, { ChatUserstate } from 'tmi.js';
import find from 'lodash.find';

import { imgSearch } from '../src/utils/images'

export interface Chat {
  tags: ChatUserstate;
  message: string;
  media?: string;
}


// discard old message
// if (messages.length > 50) {
//   let oldMessages = [].slice.call(messages).slice(0, 10);

//   //  setMesssages(oldM)
// }

export const Home = (): React.ReactElement => {
  const router = useRouter()
  const { streamername }: any = router.query
  const [messages, setMesssages] = useState<Chat[]>([]);
  const [socketClient, setSocketClient] = useState();


  const imgRegex = new RegExp('img (.+)', 'i');
  const bottomDivRef = useRef(null);
  const scrollToBottom = (): void => {
    if (bottomDivRef !== null) {
      bottomDivRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  useEffect(() => {
    if (streamername !== undefined) {
      const client: any = new tmi.Client({
        connection: { reconnect: true },
        channels: [`${streamername}`]
      });
      setSocketClient(client)
      client.connect();
    }

  }, [streamername]);

  useEffect(() => {

    if (socketClient !== undefined) {
      socketClient.on('message', (channel: string, tags: ChatUserstate, message: string, self: any) => {
        let merged: Chat = { tags, message };
        const exists: boolean = !!find(messages, merged);
        if (!exists) {
          setMesssages(messages => [...messages, merged])
          scrollToBottom();
        }

        if (imgRegex.test(message)) {
          (async (): Promise<void> => {

            let imgQuery: any[] = message.split('img ');
            let imgQueryString: string = imgQuery.pop();

            const url: string | undefined = await imgSearch(imgQueryString);
            let image = {
              media: url!,
              message: '',
              tags: { 'display-name': 'MiyaoBot', 'message-type': 'botImage' }
            }
            setMesssages(messages => [...messages, image])
            scrollToBottom();

          })();
        }


      });

    }

  }, [socketClient]);

  console.log({ messages });

  return (<div>
    <Container>
      {messages.map((x: Chat, i: number) => {
        const { tags, message, media } = x
        const { 'message-type': messageType, 'display-name': displayName, color, } = tags
        if (media) {
          return (<div key={i}><img src={media} /> </div>)
        } else {
          return (<p key={i} className="textstroke"> <strong style={{ color: color }}>{displayName}</strong>: {message}</p>)
        }
      })}
    </Container>
    <div ref={bottomDivRef}></div>
  </div >)
}

const Container = styled.div`
  .textstroke {
  color: white;
  -webkit-font-smoothing: antialiased;
  text-shadow: #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px,
             #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px;
  //text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  }

`

export default Home;
