import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useLocation, useParams } from "wouter";
import CardSection from "../components/layout/CardSection";
import PageContainer from "../components/layout/PageContainer";

const projectsData: Record<string, any> = {
  picpay: {
    title: "Picpay",
    subtitle: "Redesign of PicPay website homepage",
    image: "/picpay-new-version.webp",
    link: "https://www.behance.net/gallery/221095447/Picpay",
    tags: ["UX Design", "Web Design", "Fintech"],
    overview:
      "Redesign of PicPay website homepage. In the new version of the project, we achieved significant results: there was nearly a 40% increase in new account registrations, showing more users are interested in and trusting the platform. Additionally, user retention time grew by 25%, indicating they are using the service longer, reflecting better experience and satisfaction.",
    challenge:
      "The original PicPay website had complex navigation, unclear value propositions, and inconsistent component usage. Users struggled to understand the platform's benefits and complete the registration process efficiently.",
    solution:
      "We focused on several key improvements: Improved texts to be clearer, more objective, and easier to understand, making navigation and app use simpler. Standardized and created components, ensuring a more consistent, organized, and intuitive user interface. Standardized button labels, making actions clearer and uniform across the platform, helping avoid confusion and improving usability.",
    results: [
      "40% increase in new account registrations",
      "25% growth in user retention time",
      "Approved on first review by executives",
      "Faster time to launch",
    ],
    process:
      "The pages were approved on the first review, and executives requested they be launched quickly, expecting positive results, which were confirmed by the data. These changes contributed to a smoother and more pleasant experience, directly supporting the increase in registrations and user retention.",
    skills: [
      "UX Research",
      "Information Architecture",
      "UI Design",
      "Design Systems",
      "Interaction Design",
      "User Testing",
    ],
  },
  "c6-bank": {
    title: "C6 Bank",
    subtitle: "Digital banking platform design",
    image: "/c6bank-project.webp",
    link: "https://www.behance.net/kahue",
    tags: ["Product Design", "Fintech", "Mobile"],
    overview:
      "Digital banking platform design focusing on user-centered interactions and intuitive financial workflows. This project combined extensive user research with modern design principles to create a seamless banking experience.",
    challenge:
      "Traditional banking interfaces are often complex and intimidating for users. The challenge was to simplify financial operations while maintaining security and compliance requirements.",
    solution:
      "Developed a clean, intuitive interface with progressive disclosure of information. Created reusable components for common banking operations and implemented clear visual hierarchy for transaction management.",
    results: [
      "Improved user onboarding completion rate",
      "Reduced support tickets related to navigation",
      "Positive user feedback on interface clarity",
    ],
    process:
      "Through iterative design and user testing, we validated each interaction pattern and refined the visual design to meet both user needs and business requirements.",
    skills: [
      "Product Design",
      "User Research",
      "Interaction Design",
      "Accessibility",
      "Mobile Design",
    ],
  },
  "btg-plus": {
    title: "BTG+",
    subtitle: "Investment platform redesign",
    image: "/btg-project.webp",
    link: "https://www.behance.net/kahue",
    tags: ["Product Design", "Finance", "UX Research"],
    overview:
      "Investment platform redesign combining research, design systems, and data-informed iteration for better user engagement. This project focused on making investment accessible to a broader audience.",
    challenge:
      "Complex financial data and investment terminology created barriers for new investors. The platform needed to educate users while maintaining professional credibility.",
    solution:
      "Implemented progressive education with contextual help, created visual representations of complex data, and designed intuitive workflows for investment decisions.",
    results: [
      "Increased user engagement with investment tools",
      "Higher conversion rate for new investors",
      "Improved user confidence in platform",
    ],
    process:
      "Data-driven design decisions based on user behavior analytics and continuous A/B testing ensured optimal user experience.",
    skills: [
      "UX Research",
      "Data Analysis",
      "Design Systems",
      "Information Architecture",
      "Interaction Design",
    ],
  },
  "bell-app": {
    title: "Bell App",
    subtitle: "Mobile application design",
    image: "/bell-app-project.webp",
    link: "https://www.behance.net/kahue",
    tags: ["Mobile Design", "App Design", "UX"],
    overview:
      "Mobile application design with focus on accessibility and seamless user experience across all touchpoints. This project prioritized inclusive design principles.",
    challenge:
      "Creating an accessible mobile experience that works for users of all abilities while maintaining modern design aesthetics.",
    solution:
      "Implemented WCAG accessibility guidelines, conducted testing with users with disabilities, and designed with touch-first interactions in mind.",
    results: [
      "WCAG AA compliance achieved",
      "Positive accessibility audit results",
      "Broader user base reach",
    ],
    process:
      "Accessibility was integrated from the beginning of the design process, not added as an afterthought.",
    skills: [
      "Mobile Design",
      "Accessibility (WCAG)",
      "User Testing",
      "Interaction Design",
      "UI Design",
    ],
  },
  "le-biscuit": {
    title: "Le Biscuit",
    subtitle: "E-commerce platform redesign",
    image: "/lebiscuit-project.webp",
    link: "https://www.behance.net/kahue",
    tags: ["E-commerce", "Web Design", "UX"],
    overview:
      "E-commerce platform redesign with improved product discovery and checkout experience. This project aimed to increase conversion rates and customer satisfaction.",
    challenge:
      "High cart abandonment rates and difficulty in product discovery were limiting sales. The platform needed a more intuitive shopping experience.",
    solution:
      "Redesigned product discovery with advanced filtering and recommendations, simplified checkout process, and improved product information presentation.",
    results: [
      "Reduced cart abandonment by 30%",
      "Increased average order value",
      "Improved customer satisfaction scores",
    ],
    process:
      "Through heatmap analysis, user interviews, and A/B testing, we continuously optimized the shopping experience.",
    skills: [
      "E-commerce UX",
      "Conversion Optimization",
      "User Research",
      "Interaction Design",
      "Data Analysis",
    ],
  },
};

export default function ProjectDetail() {
  const { project } = useParams<{ project: string }>();
  const [, setLocation] = useLocation();

  if (!project || !projectsData[project]) {
    return (
      <PageContainer>
        <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
          <Stack spacing={0.75}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Esse link não existe ou foi removido.
            </Typography>
          </Stack>
          <Box>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              variant="outlined"
              onClick={() => setLocation("/")}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Voltar para o início
            </Button>
          </Box>
        </Stack>
      </PageContainer>
    );
  }

  const data = projectsData[project];

  return (
    <PageContainer>
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        <Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            variant="text"
            onClick={() => setLocation("/")}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Voltar
          </Button>
        </Box>

        <Stack spacing={1}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {data.subtitle}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {data.tags.map((tag: string) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>

        {data.image ? (
          <CardSection size="flush" sx={{ overflow: "hidden" }}>
            <Box
              component="img"
              src={data.image}
              alt={data.title}
              sx={{ width: "100%", display: "block" }}
            />
          </CardSection>
        ) : null}

        <CardSection>
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Overview
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {data.overview}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={0.75}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Challenge
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {data.challenge}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={0.75}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Solution
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {data.solution}
              </Typography>
            </Stack>

            {Array.isArray(data.results) && data.results.length ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Results
                  </Typography>
                  <List dense disablePadding>
                    {data.results.map((result: string) => (
                      <ListItem key={result} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckRoundedIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={result}
                          primaryTypographyProps={{
                            variant: "body2",
                            sx: { color: "text.secondary" },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </>
            ) : null}

            <Divider />

            <Stack spacing={0.75}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Process
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {data.process}
              </Typography>
            </Stack>

            {Array.isArray(data.skills) && data.skills.length ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Skills Used
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {data.skills.map((skill: string) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Stack>
                </Stack>
              </>
            ) : null}

            {typeof data.link === "string" && data.link ? (
              <>
                <Divider />
                <Box>
                  <Button
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    endIcon={<OpenInNewRoundedIcon />}
                    sx={{ textTransform: "none", fontWeight: 800 }}
                  >
                    Ver no Behance
                  </Button>
                </Box>
              </>
            ) : null}
          </Stack>
        </CardSection>
      </Stack>
    </PageContainer>
  );
}
