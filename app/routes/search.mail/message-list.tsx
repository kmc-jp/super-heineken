import styles from "./message-list.css";
import { Message, MessageResult } from "./models";
import { createM2WUrl } from "./utils";
import { faCalendar, faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";
import { truncate } from "~/utils";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface MessageListItemProps {
  message: Message;
  mailBaseURL: string;
}

function MessageListItem(props: MessageListItemProps) {
  const dateStr = new Date(props.message.date).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const message = props.message;
  return (
    <div className="MessageListItem mb-2">
      <div className="row">
        <div className="col-md-10 offset-md-1">
          <a
            href={createM2WUrl(
              props.mailBaseURL,
              props.message.category,
              props.message.index,
            )}
          >
            <h3>
              {
                // Some mails have very long subjects.
                truncate(props.message.subject, 160)
              }
            </h3>
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-md-10 offset-md-1">
          <p className="small mb-1">
            <FontAwesomeIcon icon={faEnvelope} />
            &ensp;{message.category}: {message.from}&ensp;&#x279C;&ensp;
            {message.to.join(", ")}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-10 offset-md-1">
          <p className="small mb-2">
            <FontAwesomeIcon icon={faCalendar} />
            &ensp;{dateStr}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-10 offset-md-1">
          <p dangerouslySetInnerHTML={{ __html: message.body }} />
        </div>
      </div>
    </div>
  );
}

interface MessageListProps {
  messageResult: MessageResult;
  mailBaseURL: string;
}

export function MessageList(props: MessageListProps) {
  return (
    <div className="MessageList">
      {props.messageResult.messages.map((item) => (
        <MessageListItem
          key={item.id}
          message={item}
          mailBaseURL={props.mailBaseURL}
        />
      ))}
    </div>
  );
}
