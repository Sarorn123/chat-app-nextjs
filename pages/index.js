import { Box } from "@mui/material";
import styles from "../styles/Home.module.css";
import Auth from "../components/Auth/auth";

export default function Home() {
  return (
    <Box className={styles.container}>
      <Auth />
    </Box>
  );
}
