import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../../firebase";
import styled from "styled-components";
import { Box } from "@mui/system";

const HeaderText = styled("Typography")(({ theme }) => ({
  fontSize: "5rem",
  fontWeight: "bold",
  color: "black",
}));

const SingUpText = styled("Typography")(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "150",
  color: "black",
}));

const BoxContainer = styled("Box")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
}));

function Login() {
  const loginWithGoogle = () => {
    signInWithPopup(auth, provider);
  };

  return (
    <BoxContainer>
      <HeaderText>Super Chat</HeaderText>
      <Box
        onClick={loginWithGoogle}
        sx={{
          boxShadow: "0px 0px 5px 0px gray",
          padding: ".2rem 1rem",
          cursor: "pointer",
          borderRadius: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        <SingUpText>Sing Up With Google Account</SingUpText>
        <Box
          component="img"
          src="https://logowik.com/content/uploads/images/985_google_g_icon.jpg"
          sx={{ width: "5rem" }}
        />
      </Box>

      <SingUpText>Have Fun !</SingUpText>
    </BoxContainer>
  );
}

export default Login;
