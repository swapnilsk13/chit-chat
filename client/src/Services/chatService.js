import useHandleResponse from '../Utilities/handle-response';
import authHeader from '../Utilities/auth-header';
import { useSnackbar } from 'notistack';

// Receive global messages
export function useGetGlobalMessages() {
    const { enqueueSnackbar } = useSnackbar();
    const handleResponse = useHandleResponse();
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const getGlobalMessages = () => {
        return fetch(
          `https://chit-chat-server.vercel.app/messages/globalMessages`,
          requestOptions
        )
          .then(handleResponse)
          .catch(() =>
            enqueueSnackbar("Could not load Global Chat", {
              variant: "error",
            })
          );
    };

    return getGlobalMessages;
}

// Send a global message
export function useSendGlobalMessage() {
    const { enqueueSnackbar } = useSnackbar();
    const handleResponse = useHandleResponse();

    const sendGlobalMessage = body => {
        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: JSON.stringify({ message: body, global: true }),
        };

        return fetch(
          `https://chit-chat-server.vercel.app/messages/global`,
          requestOptions
        )
          .then(handleResponse)
          .catch((err) => {
            console.log(err);
            enqueueSnackbar("Could send message", {
              variant: "error",
            });
          });
    };

    return sendGlobalMessage;
}

// Get list of users conversations
export function useGetConversations() {
    const { enqueueSnackbar } = useSnackbar();
    const handleResponse = useHandleResponse();
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const getConversations = () => {
        return fetch(
          `https://chit-chat-server.vercel.app/messages/conversationList`,
          requestOptions
        )
          .then(handleResponse)
          .catch(() =>
            enqueueSnackbar("Could not load chats", {
              variant: "error",
            })
          );
    };

    return getConversations;
}

// get conversation messages based on
// to and from id's
export function useGetConversationMessages() {
    const { enqueueSnackbar } = useSnackbar();
    const handleResponse = useHandleResponse();
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    const getConversationMessages = id => {
        return fetch(
          `https://chit-chat-server.vercel.app/messages/conversationByUser/query?userId=${id}`,
          requestOptions
        )
          .then(handleResponse)
          .catch(() =>
            enqueueSnackbar("Could not load chats", {
              variant: "error",
            })
          );
    };

    return getConversationMessages;
}

export function useSendConversationMessage() {
    const { enqueueSnackbar } = useSnackbar();
    const handleResponse = useHandleResponse();

    const sendConversationMessage = (id, body) => {
        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: JSON.stringify({ sender: id, message: body }),
        };

        return fetch(
          `https://chit-chat-server.vercel.app/messages/personal`,
          requestOptions
        )
          .then(handleResponse)
          .catch((err) => {
            console.log(err);
            enqueueSnackbar("Could send message", {
              variant: "error",
            });
          });
    };

    return sendConversationMessage;
}
