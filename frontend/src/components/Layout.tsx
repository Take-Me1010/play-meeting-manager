import { Container, Box } from "@mui/material";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
};

export function Layout({ children, maxWidth = "sm" }: LayoutProps) {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          padding: 2,
        }}
      >
        {children}
      </Box>
    </Container>
  );
}
