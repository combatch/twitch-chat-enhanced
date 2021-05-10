import React from 'react';
import { Chat } from './[streamername]';

interface IChatmessageProps {
	messages: Chat[]
}

const ChatMessage: React.FunctionComponent<IChatmessageProps> = ({ messages }: IChatmessageProps) => {
	return (
		<React.Fragment>
			{(messages.length > 400
				? messages.slice(Math.max(messages.length - 400, 0))
				: messages)
			.map((x: Chat, i: number) => {
				const { tags, message, media } = x;
				const { 'message-type': messageType, 'display-name': displayName, color } = tags;

				if (media) {
					return <div key={i}><img src={media} /></div>;
				} else {
					return <p key={i} className="textstroke"><strong style={{ color: color }}>{displayName}</strong>: {message}</p>;
				}
			})}
		</React.Fragment>
	);
};

export default ChatMessage;