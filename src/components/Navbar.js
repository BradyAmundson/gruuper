import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { Navigate, useNavigate } from "react-router-dom";
import { SignOut, useAuthentication } from "../firebase/authService";
import logo from "../images/gruuper-logo.png";
import Stack from "@mui/material/Stack";

import CircularProgress from '@mui/material/CircularProgress';
import { getUser } from "../firebase/firestoreService";


const pages = ["Classrooms", "About"];
const settings = ["Profile", "Logout"];


function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const user = useAuthentication();
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const navigate = useNavigate();

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (e) => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = localStorage.getItem("userId");
        if (currentUser) {
          const userDataFromFirebase = await getUser(currentUser);
          setUserData(userDataFromFirebase);
          if (userDataFromFirebase && userDataFromFirebase.profileImageUrl) {
            setProfileImage(userDataFromFirebase.profileImageUrl);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileImage]);



  return (
    <AppBar position="static" sx={{ backgroundColor: "#1e5799" }}>
      <Container maxWidth="false">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Tooltip title="Home">
              <img
                src={logo}
                alt="Logo"
                className="logo"
                style={{
                  height: "3rem",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              />
            </Tooltip>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <Stack spacing={1}>
                {pages.map((item) => (
                  <Button
                    key={item}
                    onClick={() => navigate(item.toLowerCase())}
                    sx={{ color: "#000" }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Menu>
            <div style={{ width: "100%" }}>
              <img
                src={logo}
                alt="Logo"
                className="logo"
                style={{
                  height: "3rem",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              />
            </div>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page, index) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{
                  mx: index === 0 ? 2 : 0,
                  color: "white",
                  display: "block",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  lineHeight: 1.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#6db3f2",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  textAlign="center"
                  onClick={() => navigate(page.toLowerCase())}
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {page}
                </Typography>
              </Button>
            ))}
          </Box>


          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open profile">
              <IconButton onClick={() => navigate("/profile")} sx={{ p: 0 }}>
                {(isLoading || !profileImage) && (
                  <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                    <CircularProgress color="inherit" size={40} />
                  </div>
                )}
                {!isLoading && profileImage && (
                  <Avatar
                    color="secondary"
                    src={profileImage}
                    style={{
                      height: "40px",
                      width: "40px",
                      borderRadius: "50%",
                      fontSize: "24px",
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
