import { IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleMode}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: "background.paper",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Icon
          icon={mode === "light" ? "solar:moon-bold" : "solar:sun-bold"}
          width={24}
          height={24}
        />
      </IconButton>
    </Tooltip>
  );
}
