import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'wouter';

export interface FooterLinkItem {
  href: string;
  label: string;
}

export interface FooterProps {
  copyright?: string;
  links?: FooterLinkItem[];
}

export function Footer({ copyright, links = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const copyrightText = copyright || `Superclient © ${currentYear}`;
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="body2" color="text.secondary">
          {copyrightText}
        </Typography>
        
        {links.length > 0 && (
          <Stack
            component="nav"
            direction="row"
            spacing={2}
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "flex-end" },
              rowGap: 1,
              maxWidth: "100%",
            }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                component={RouterLink}
                href={link.href}
                variant="body2"
                color="text.secondary"
                underline="hover"
                sx={{ maxWidth: "100%" }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
