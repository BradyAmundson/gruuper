import * as React from "react";
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

const pages = ["Classrooms", "About"];
const settings = ["Profile", "Logout"];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const user = useAuthentication();

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

  return (
    <AppBar position="static">
      <Container maxWidth="false">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
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
              {pages.map((item) => (
                <Button
                  key={item}
                  onClick={() => navigate(item.toLowerCase())}
                  sx={{ color: "#fff" }}
                >
                  {item}
                </Button>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
            onClick={() => navigate("/")}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                <Typography
                  textAlign="center"
                  onClick={() => navigate(page.toLowerCase())}
                >
                  {page}
                </Typography>
              </Button>
            ))}
          </Box>
          {user ? <SignOut /> : <div />}

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open profile">
              <IconButton onClick={() => navigate("/profile")} sx={{ p: 0 }}>
                <Avatar
                  color="secondary"
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%", // Make it circular
                    backgroundColor: "#2196f3", // Add a background color
                    color: "#ffffff", // Text color
                    fontSize: "24px", // Adjust the font size
                  }}
                >
                  {localStorage.getItem("firstName") &&
                  localStorage.getItem("firstName").length > 0
                    ? localStorage.getItem("firstName")[0]
                    : "?"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
