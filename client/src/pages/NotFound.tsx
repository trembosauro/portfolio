import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "wouter";
import CardSection from "../components/layout/CardSection";

export default function NotFound() {
  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <CardSection size="lg">
        <Stack spacing={2.5} alignItems="flex-start">
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            404
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={RouterLink}
              href="/login"
              variant="contained"
              size="large"
            >
              Ir para login
            </Button>
            <Button
              component={RouterLink}
              href="/profile"
              variant="outlined"
              size="large"
            >
              Abrir perfil
            </Button>
          </Stack>
        </Stack>
      </CardSection>
    </Box>
  );
}
