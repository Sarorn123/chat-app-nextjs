import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import ChatAppBar from "./app_bar";
import SendIcon from "@mui/icons-material/Send";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import moment from "moment";
import InputEmoji from "react-input-emoji";

const MessageItem = styled("Box")(({ theme }) => ({
  backgroundColor: "#e6e6e6",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  color: "black",
  borderRadius: "20px 20px 20px 0px",
  marginTop: "1rem",

  // [theme.breakpoints.up('lg')]: {
  //   backgroundColor: green[500],
  // },
}));

const MessageItemOwn = styled("Box")(({ theme }) => ({
  backgroundColor: "#0083ff",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  color: "white",
  borderRadius: "20px 20px 0px 20px",
  marginTop: "1rem",

  // [theme.breakpoints.up('lg')]: {
  //   backgroundColor: green[500],
  // },
}));

const SideBarLastText = styled("Box")(({ theme }) => ({
  fontSize: "1rem",
  color: "white",
  marginTop: ".5rem",

  [theme.breakpoints.down("md")]: {
    fontSize: ".8rem",
  },
}));

const SidbarUserName = styled("Typography")(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "white",

  [theme.breakpoints.down("lg")]: {
    fontSize: "1rem",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: ".8rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: ".7rem",
  },
}));

const MessageText = styled("Typography")(({ theme }) => ({
  fontSize: "1.5rem",
  [theme.breakpoints.down("md")]: {
    fontSize: "1rem",
  },
}));

const DateTime = styled("Typography")(({ theme }) => ({
  fontSize: "1rem",
  marginTop: ".5rem",
}));

const InputBox = styled("input")(({ theme }) => ({
  border: "none",
  outline: "none",
  backgroundColor: "rgba(255,255,255, 0.3)",
  width: "100%",
  height: "3rem",
  color: "white",
  fontSize: "1.5rem",
  padding: "1rem 2rem",
  marginBottom: "2rem",
  "&::placeholder": {
    color: "white",
    fontSize: "1rem",
    textAlign: "center",
  },
}));

function Chat({ currentUser }) {
  console.log("currentUser", currentUser);
  const [chatHistory, setChatHistory] = useState([]);
  const [singlefriend, setSingleFriend] = useState(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [laoading, setLaoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [reload, setReload] = useState(false);
  const [cancelFindNewFri, setCancelFindNewFri] = useState("none");
  const currenRoom = useRef();
  const messageRef = useRef(null);
  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function getAllFriendsMessaged() {
      const chat_room = collection(db, "chatrooms");
      const q = query(
        chat_room,
        where("room", "array-contains", currentUser?.uid)
      );
      const querySnapshort = await getDocs(q);
      const chat_history = [];
      await Promise.all(
        querySnapshort.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .map(async (room_object) => {
            const friendID = room_object.room.filter(
              (id) => id != currentUser.uid
            )[0];
            const usersRef = doc(db, "users", friendID);
            const user_snap = await getDoc(usersRef);
            const history_room_user = {
              ...user_snap.data(),
              id: friendID,
            };
            chat_history.push(history_room_user);
          })
      );
      setChatHistory(chat_history);
    }

    getAllFriendsMessaged();
  }, [currentUser.uid, reload]);

  const startChatRoom = async (friend) => {
    currenRoom.current = false;
    setSingleFriend(friend);
    const chat_room = collection(db, "chatrooms");
    const q = query(chat_room);
    const querySnapshort = await getDocs(q);
    const array_chat = querySnapshort.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    for (let i = 0; i < array_chat.length; i++) {
      const roomObj = array_chat[i];
      if (
        (roomObj.room[0] === currentUser?.uid &&
          roomObj.room[1] === friend.id) ||
        (roomObj.room[0] === friend.id && roomObj.room[1] === currentUser?.uid)
      ) {
        currenRoom.current = roomObj.id;
        break;
      }
    }

    if (currenRoom.current) {
      const q = query(
        collection(db, "chats"),
        where("room_id", "==", currenRoom.current),
        orderBy("created_at", "asc")
        // limit(10)
      );
      onSnapshot(q, (querySnapshot) => {
        const chatsNow = [];
        querySnapshot.forEach((doc) => {
          chatsNow.push(doc.data());
        });
        setChats(chatsNow);
      });
    } else {
      setChats([]);
      const room = {
        room: [currentUser.uid, friend?.id],
      };
      const Id = uuidv4();
      currenRoom.current = Id;
      await setDoc(doc(db, "chatrooms", Id), room);
    }
  };

  const sentMessage = async () => {
    const messageData = {
      message: message,
      avatar: currentUser?.photoURL,
      username: currentUser?.displayName,
      created_at: serverTimestamp(),
      user_id: currentUser?.uid,
      room_id: currenRoom.current,
    };
    setMessage("");
    await setDoc(doc(db, "chats", uuidv4()), messageData);
  };

  const find_new_friend = async () => {
    setCancelFindNewFri("block");
    const user_db = collection(db, "users");
    const q = query(user_db, where("email", "!=", currentUser?.email));
    const querySnapshort = await getDocs(q);
    const users_array = querySnapshort.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    const new_fri = [];
    users_array.forEach((user) => {
      if (
        user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.username.toLowerCase().includes(searchKeyword.toLowerCase())
      ) {
        new_fri.push(user);
      }
    });
    setChatHistory(new_fri);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const styles = {
    big_container: {
      display: "flex",
      height: "100vh",
    },
    left_side_bar_container: {
      width: "20%",
      backgroundColor: "#0083ff",
      position: "fixed",
      height: "100vh",
    },
    right_side_bar_container: {
      width: "80%",
      position: "absolute",
      right: "0",
    },
    cancel_text: {
      backgroundColor: "red",
      padding: ".6rem 1rem",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer",
      textAlign: "center",
      display: cancelFindNewFri,
    },

    side_bar_avatar: {
      cursor: "pointer",
      borderRadius: "2rem",
      width: "4rem",
      height: "4rem",
      border: "1px solid gray",
      marginRight: "1rem",
      border: "2px solid white",
    },
    chat_header: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "1rem",
      boxShadow: "0px -10px 20px 0px gray",
      height: "10vh",
      position: "fixed",
      zIndex: "2000",
      top: "0",
      zIndex: "2",
    },
    chat_header_avatar: {
      cursor: "pointer",
      borderRadius: "2rem",
      border: "2px solid gray",
      width: {
        xl: "4rem",
        lg: "4rem",
        md: "3rem",
        sm: "2rem",
        xs: "2rem",
      },
      height: {
        xl: "4rem",
        lg: "4rem",
        md: "3rem",
        sm: "2rem",
        xs: "2rem",
      },
    },
    chat_header_username: {
      ml: 2,
      fontSize: {
        xl: "2rem",
        lg: "2rem",
        md: "1.5rem",
        sm: "1rem",
        xs: "1rem",
      },
      fontWeight: "bold",
    },
    chat_header_last_active: {
      ml: 2,
      fontSize: {
        xl: "1rem",
        lg: "1rem",
        md: ".6rem",
        sm: ".6rem",
        xs: ".6rem",
      },
      fontWeight: "bold",
      color: "gray",
      marginTop: ".5rem",
    },
    chat_header_no_user: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "1rem",
      boxShadow: "0px -10px 20px 0px gray",
      height: "10vh",
    },
    chat_header_text_no_user: { ml: 2, fontSize: "2rem", fontWeight: "bold" },
    chat_item_container: {
      display: "flex",
      alignItems: "end",
      width: "100%",
      padding: "1rem",
    },
    chat_avatar: {
      borderRadius: "2rem",
      width: "2rem",
      height: "2rem",
      marginRight: "1rem",
    },
    chat_item_container_own: {
      display: "flex",
      alignItems: "end",
      width: "100%",
      justifyContent: "flex-end",
      padding: "1rem",
    },
    chat_avatar_own: {
      borderRadius: "2rem",
      width: "2rem",
      height: "2rem",
      marginLeft: "1rem",
    },
    no_message_item_container: {
      justifyContent: "center",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "center",
      height: "70vh",
    },
    no_message_text: {
      ml: 2,
      fontSize: {
        xl: "2rem",
        lg: "2rem",
        md: "1.5rem",
        sm: "1.5rem",
        sm: "1rem",
      },
      fontWeight: "bold",
    },
    // SENT MESSAGE CONTAINER
    sent_message_container: {
      display: "flex",
      alignItems: "center",
      width: "80%",
      position: "fixed",
      bottom: "0",
      backgroundColor: "#e6e6e6",
      justifyContent: "space-between",
      padding: "0rem 1rem",
    },
    sent_message_input: {
      border: "none",
      padding: "2rem",
      backgroundColor: "#e6e6e6",
      width: "70%",
      outline: "none",
    },
    sent_message_icon: {
      cursor: "pointer",
      color: "gray",
      fontSize: {
        xl: "3rem",
        lg: "3rem",
        md: "2rem",
        sm: "2rem",
        xs: "2rem",
      },
      transition: ".3s",
      "&:hover": {
        color: "#0083ff",
      },
    },
  };

  return (
    <>
      <Box sx={styles.big_container} component="div">
        <Box sx={styles.left_side_bar_container} component="div">
          <ChatAppBar />
          <Box component="div">
            <InputBox
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                if (searchKeyword) {
                  find_new_friend();
                }
              }}
              placeholder="Find new friend ?"
            />
          </Box>

          <Typography
            onClick={() => {
              setReload(!reload);
              setCancelFindNewFri("none");
              setSearchKeyword("");
            }}
            sx={styles.cancel_text}
          >
            Cancel
          </Typography>

          <Box>
            {chatHistory
              ? chatHistory.map((friend) => (
                  <Box
                    key={friend.id}
                    onClick={() => {
                      startChatRoom(friend);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "1rem",
                      cursor: "pointer",
                      transition: ".3s",
                      background:
                        friend.id === singlefriend?.id
                          ? "rgba(255,255,255, 0.2)"
                          : "",
                      "&:hover": {
                        background: "rgba(255,255,255, 0.3)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={friend.avatar}
                      sx={styles.side_bar_avatar}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <SidbarUserName>{friend.username}</SidbarUserName>
                      <SideBarLastText>
                        {friend.lastSeen
                          ? moment(friend.ChatAppBarlastSeen?.toDate()).format(
                              "LT"
                            )
                          : ""}
                      </SideBarLastText>
                    </Box>
                  </Box>
                ))
              : ""}
          </Box>
        </Box>
        <Box component="div" sx={styles.right_side_bar_container}>
          <Box component="div" sx={styles.chat_header}>
            {singlefriend ? (
              <>
                <Box
                  component="img"
                  src={singlefriend.avatar}
                  sx={styles.chat_header_avatar}
                />
                <Box>
                  <Typography sx={styles.chat_header_username} variant="h3">
                    {singlefriend.username}
                  </Typography>
                  <Typography sx={styles.chat_header_last_active} variant="h3">
                    Last Active :{" "}
                    {moment(singlefriend?.lastSeen.toDate()).fromNow()}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography sx={styles.chat_header_text_no_user} variant="h3">
                  Start A Chat
                </Typography>
              </>
            )}
          </Box>

          <Box
            component="div"
            sx={{
              marginTop: "7rem",
              marginBottom: "7rem",
            }}
          >
            {chats.length !== 0 ? (
              chats.map((message) =>
                message.user_id !== currentUser.uid ? (
                  <Box
                    component="div"
                    sx={styles.chat_item_container}
                    key={message.id}
                  >
                    <Box
                      component="img"
                      src={message.avatar}
                      sx={styles.chat_avatar}
                    />
                    <MessageItem>
                      <MessageText>{message.message}</MessageText>
                      <DateTime>
                        {message.created_at
                          ? moment(message.created_at.seconds * 1000).format(
                              "LT"
                            )
                          : ""}
                      </DateTime>
                    </MessageItem>
                  </Box>
                ) : (
                  <Box
                    component="div"
                    sx={styles.chat_item_container_own}
                    key={message.id}
                  >
                    <MessageItemOwn>
                      <MessageText>{message.message}</MessageText>
                      <DateTime>
                        {message.created_at
                          ? moment(message.created_at.seconds * 1000).format(
                              "LT"
                            )
                          : ""}
                      </DateTime>
                    </MessageItemOwn>
                    <Box
                      component="img"
                      src={message.avatar}
                      sx={styles.chat_avatar_own}
                    />
                  </Box>
                )
              )
            ) : (
              <Box sx={styles.no_message_item_container}>
                <Box
                  component="img"
                  src="/image/chat_image.gif"
                  sx={{ width: "50%" }}
                />
                <Typography sx={styles.no_message_text}>
                  Let's Start A Chat With Someone
                </Typography>
              </Box>
            )}

            <Box sx={{ marginBottom: "100" }} ref={messageRef}></Box>
          </Box>
          {singlefriend ? (
            <Box sx={styles.sent_message_container}>
              <InputEmoji
                value={message}
                onChange={setMessage}
                placeholder="Type a message"
                onEnter={sentMessage}
                cleanOnEnter
              />
              <Box>
                {/* <AttachFileIcon sx={styles.sent_message_icon} />*/}
                <SendIcon sx={styles.sent_message_icon} onClick={sentMessage} />
              </Box>
            </Box>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </>
  );
}

export default Chat;
