import React, { useState, useEffect } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import LanguageIcon from "@material-ui/icons/Language";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import socketIOClient from "socket.io-client";

import { useGetConversations } from "../Services/chatService";
import { authenticationService } from "../Services/authenticationService";
import commonUtilites from "../Utilities/common";

const useStyles = makeStyles((theme) => ({
  subheader: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  globe: {
    backgroundColor: theme.palette.primary.dark,
  },
  subheaderText: {
    color: theme.palette.primary.dark,
  },
  list: {
    maxHeight: "calc(100vh - 112px)",
    overflowY: "auto",
  },
}));

const Conversations = (props) => {
  const classes = useStyles();
  const [conversations, setConversations] = useState([]);
  const [newConversation, setNewConversation] = useState(null);
  const getConversations = useGetConversations();

  // Returns the recipient name that does not
  // belong to the current user.
  const handleRecipient = (recipients) => {
    console.log({recipients});
    for (let i = 0; i < recipients.length; i++) {
      if (
        recipients[i].name !==
        authenticationService.currentUserValue.username
      ) {
        return recipients[i];
      }
    }
    return null;
  };

  useEffect(() => {
    getConversations().then((res) => setConversations(res));
  }, [newConversation]);

  useEffect(() => {
    let socket = socketIOClient("https://chit-chat-server.vercel.app");
    socket.on("messages", (data) => setNewConversation(data));

    return () => {
      socket.removeListener("messages");
    };
  }, []
  );

  return (
    <List className={classes.list}>
      <ListItem
        classes={{ root: classes.subheader }}
        onClick={() => {
          props.setScope("Global Chat");
        }}
      >
        <ListItemAvatar>
          <Avatar className={classes.globe}>
            <LanguageIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText className={classes.subheaderText} primary="Global Chat" />
      </ListItem>
      <Divider />

      {!!conversations && conversations.length>0 && (
        <React.Fragment>
          {conversations.map((c) => (
            <ListItem
              className={classes.listItem}
              key={c._id}
              button
              onClick={() => {
                props.setUser(handleRecipient(c.recipentObj));
                props.setScope(handleRecipient(c.recipentObj)?.name);
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {commonUtilites.getInitialsFromName(
                    handleRecipient(c.recipentObj)?.name
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={handleRecipient(c.recipentObj)?.name}
                secondary={<React.Fragment>{c.lastMessage}</React.Fragment>}
              />
            </ListItem>
          ))}
        </React.Fragment>
      )}
    </List>
  );
};

export default Conversations;
