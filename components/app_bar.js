import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";

const HeaderText = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: "150",
  color: "white",
  fontWeight: "bold",
  [theme.breakpoints.down("lg")]: {
    fontSize: "1.5rem",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "1.3rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: ".7rem",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: ".6rem",
  },
}));

export default function ChatAppBar() {
  const styles = {
    box_container: {
      flexGrow: 1,
      height: "10vh",
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      padding: {
        xl: "1rem",
        lg: "1rem",
        md: "1rem",
        sm: ".5rem",
        xs: ".5rem",
      },
      color: "white",
    },
    log_out_icon: {
      fontSize: {
        xl: "3rem",
        lg: "3rem",
        md: "2.5rem",
        sm: "2rem",
        xs: "1.5rem",
      },
      cursor: "pointer",
    },
  };

  return (
    <Box sx={styles.box_container}>
      <HeaderText>Super Chat</HeaderText>
      <LogoutIcon
        sx={styles.log_out_icon}
        onClick={() => {
          signOut(auth);
        }}
      />
    </Box>
  );
}
