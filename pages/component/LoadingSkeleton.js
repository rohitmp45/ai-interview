import { Backdrop, Box, Skeleton, Stack, Typography } from "@mui/material";

export default function LoadingSkeleton({open}) {
  return (
    <Backdrop
      open={open}
      sx={{
        color: "common.white",
        zIndex: (theme) => theme.zIndex.drawer + 1000,
        backgroundColor: "rgba(62, 111, 136, 0.3)",
      }}
    >
      <Stack
        height={120}
        alignItems={"center"}
        justifyContent={"center"}
        overflow={"hidden"}
        spacing={4}
        sx={{ backgroundColor: "common.white", borderRadius: 1, p: 4, color:"common.black" }}
      >
        loading....
      </Stack>
    </Backdrop>
  );
}
