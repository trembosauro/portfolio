import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { useLocation } from "wouter";
import api from "../api";
import CardSection from "../components/layout/CardSection";

const highlights = [
  {
    title: "Pipeline visual",
    desc: "Arraste negócios entre etapas. Veja o que está parado e o que avança.",
  },
  {
    title: "Agenda integrada",
    desc: "Lembretes, tarefas e follow-ups no mesmo lugar que suas vendas.",
  },
  {
    title: "Controle financeiro",
    desc: "Entradas, saídas e categorias para saber onde o dinheiro vai.",
  },
  {
    title: "Contatos organizados",
    desc: "Campos personalizados, categorias e histórico em cada ficha.",
  },
];

const plans = [
  {
    title: "Start",
    description: "Ideal para quem está começando ou trabalha sozinho.",
    detail: "Até 3 usuários • Todos os módulos",
  },
  {
    title: "Scale",
    description: "Para times em crescimento que precisam de mais controle.",
    detail: "Até 25 usuários • Permissões avançadas",
  },
  {
    title: "Enterprise",
    description: "Para operações complexas com governança e suporte dedicado.",
    detail: "Usuários ilimitados • SLA garantido",
  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "reset">(
    "request"
  );
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [showRecoveryConfirm, setShowRecoveryConfirm] = useState(false);

  const persistUser = (
    user?: { name?: string | null; email?: string },
    token?: string
  ) => {
    if (!user?.email) {
      return;
    }
    window.localStorage.setItem(
      "sc_user",
      JSON.stringify({ name: user.name || "", email: user.email })
    );
    if (token) {
      window.localStorage.setItem("sc_active_session", token);
    }
    const stored = window.localStorage.getItem("sc_accounts");
    const nextAccount = {
      name: user.name || "",
      email: user.email,
      lastUsed: Date.now(),
      token: token || "",
    };
    try {
      const parsed = stored
        ? (JSON.parse(stored) as (typeof nextAccount)[])
        : [];
      const deduped = parsed.filter(account => account.email !== user.email);
      const nextAccounts = [nextAccount, ...deduped].slice(0, 3);
      window.localStorage.setItem("sc_accounts", JSON.stringify(nextAccounts));
    } catch {
      window.localStorage.setItem("sc_accounts", JSON.stringify([nextAccount]));
    }
  };

  const getErrorDetails = (
    error: unknown
  ): { status?: number; code?: string } => {
    const response = (
      error as { response?: { status?: number; data?: { error?: string } } }
    )?.response;
    return { status: response?.status, code: response?.data?.error };
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Informe o email e a senha.");
      return;
    }
    try {
      const response = await api.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      persistUser(response?.data?.user, response?.data?.token);
      window.dispatchEvent(new Event("auth-change"));
      setLocation("/profile");
    } catch (error) {
      const { code } = getErrorDetails(error);
      if (code === "session_conflict") {
        setLoginError(
          "Detectamos acesso em outro dispositivo. As sessões foram encerradas por segurança. Entre novamente ou redefina a senha."
        );
        return;
      }
      setLoginError("Email ou senha inválidos.");
    }
  };

  const handleSignup = async () => {
    setSignupError("");
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) {
      setSignupError("Preencha nome, email e senha.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("As senhas não conferem.");
      return;
    }
    try {
      const response = await api.post("/api/auth/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      persistUser(response?.data?.user, response?.data?.token);
      window.dispatchEvent(new Event("auth-change"));
      setLocation("/profile");
    } catch (error) {
      const { status } = getErrorDetails(error);
      if (status === 409) {
        try {
          const response = await api.post("/api/auth/login", {
            email: signupEmail,
            password: signupPassword,
          });
          persistUser(response?.data?.user, response?.data?.token);
          window.dispatchEvent(new Event("auth-change"));
          setLocation("/profile");
          return;
        } catch (loginError) {
          const { code } = getErrorDetails(loginError);
          if (code === "session_conflict") {
            setSignupError(
              "Detectamos acesso em outro dispositivo. As sessões foram encerradas por segurança. Entre novamente ou redefina a senha."
            );
            return;
          }
          setSignupError("Esse email já está cadastrado.");
          return;
        }
      }
      setSignupError("Não foi possível criar a conta agora.");
    }
  };

  const handleRecoveryOpen = () => {
    setRecoveryOpen(true);
    setRecoveryStep("request");
    setRecoveryEmail(loginEmail);
    setRecoveryToken("");
    setRecoveryPassword("");
    setRecoveryConfirm("");
    setRecoveryError("");
    setRecoveryNotice("");
  };

  const handleRecoveryClose = () => {
    setRecoveryOpen(false);
    setRecoveryError("");
    setRecoveryNotice("");
  };

  const handleRecoveryRequest = async () => {
    setRecoveryError("");
    setRecoveryNotice("");
    if (!recoveryEmail) {
      setRecoveryError("Informe o email da conta.");
      return;
    }
    try {
      const response = await api.post("/api/auth/forgot-password", {
        email: recoveryEmail,
      });
      const token = response?.data?.resetToken;
      if (token) {
        setRecoveryToken(token);
        setRecoveryNotice("Use o código enviado para definir uma nova senha.");
        setRecoveryStep("reset");
      } else {
        setRecoveryNotice("Se o email existir, você receberá um código.");
      }
    } catch {
      setRecoveryError("Não foi possível iniciar a recuperação.");
    }
  };

  const handleRecoveryReset = async () => {
    setRecoveryError("");
    setRecoveryNotice("");
    if (!recoveryToken || !recoveryPassword || !recoveryConfirm) {
      setRecoveryError("Preencha o código e a nova senha.");
      return;
    }
    if (recoveryPassword !== recoveryConfirm) {
      setRecoveryError("As senhas não conferem.");
      return;
    }
    try {
      await api.post("/api/auth/reset-password", {
        token: recoveryToken,
        password: recoveryPassword,
      });
      setRecoveryNotice("Senha atualizada. Você já pode entrar.");
      setRecoveryStep("request");
      setRecoveryOpen(false);
    } catch {
      setRecoveryError("Código inválido ou expirado.");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
        gap: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ pr: { md: 4 } }}>
        <Stack spacing={2.5}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Tenha clareza do que fazer a cada etapa.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", fontSize: 18 }}
          >
            Pipeline, agenda, finanças e contatos no mesmo lugar para você vender com mais consistência e acompanhar o que ficou pendente.
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {highlights.map(item => (
              <CardSection key={item.title} size="flush" sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  {item.desc}
                </Typography>
              </CardSection>
            ))}
          </Box>

          <CardSection size="flush" sx={{ mt: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              O que você ganha no dia a dia
            </Typography>
            <Stack spacing={1.25}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                • Registro de leads, tarefas e próximos passos em um só lugar.
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                • Visibilidade do que está parado e do que precisa de atenção.
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                • Menos planilhas e menos troca de abas durante o dia.
              </Typography>
            </Stack>
          </CardSection>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Planos no seu ritmo
            </Typography>
            <Stack spacing={2}>
              {plans.map(plan => (
                <CardSection
                  key={plan.title}
                  size="flush"
                  sx={{ p: 2.5 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {plan.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {plan.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {plan.detail}
                  </Typography>
                </CardSection>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <CardSection size="lg">
        <Stack
          spacing={3}
          component="form"
          onSubmit={event => {
            event.preventDefault();
            if (mode === "login") {
              void handleLogin();
              return;
            }
            void handleSignup();
          }}
        >
          <Tabs
            value={mode}
            onChange={(_, value) => {
              setMode(value);
              setLoginError("");
              setSignupError("");
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Entrar" value="login" />
            <Tab label="Criar conta" value="signup" />
          </Tabs>

          {mode === "login" ? (
            <>
              <Stack spacing={1}>
                <Typography variant="h5">Entrar</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Entre com seu email e senha.
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={loginEmail}
                  onChange={event => setLoginEmail(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleLogin();
                    }
                  }}
                />
                <TextField
                  label="Senha"
                  type={showLoginPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  value={loginPassword}
                  onChange={event => setLoginPassword(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleLogin();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowLoginPassword(prev => !prev)}
                          edge="end"
                        >
                          {showLoginPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberMe}
                        onChange={event => setRememberMe(event.target.checked)}
                      />
                    }
                    label="Manter conectado"
                  />
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={handleRecoveryOpen}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    Esqueci minha senha
                  </Button>
                </Stack>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                onClick={handleLogin}
              >
                Entrar
              </Button>

              {loginError ? (
                <Typography variant="caption" color="error">
                  {loginError}
                </Typography>
              ) : null}

              <Button
                type="button"
                variant="text"
                size="large"
                onClick={() => setMode("signup")}
                fullWidth
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Criar conta
              </Button>
            </>
          ) : (
            <>
              <Stack spacing={1}>
                <Typography variant="h5">Criar conta</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Configure seu acesso e comece a usar.
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label="Nome completo"
                  fullWidth
                  value={signupName}
                  onChange={event => setSignupName(event.target.value)}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={signupEmail}
                  onChange={event => setSignupEmail(event.target.value)}
                />
                <TextField
                  label="Senha"
                  type={showSignupPassword ? "text" : "password"}
                  fullWidth
                  value={signupPassword}
                  onChange={event => setSignupPassword(event.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowSignupPassword(prev => !prev)}
                          edge="end"
                        >
                          {showSignupPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmar senha"
                  type={showSignupConfirm ? "text" : "password"}
                  fullWidth
                  value={signupConfirm}
                  onChange={event => setSignupConfirm(event.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowSignupConfirm(prev => !prev)}
                          edge="end"
                        >
                          {showSignupConfirm ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSignup}
              >
                Criar conta
              </Button>

              {signupError ? (
                <Typography variant="caption" color="error">
                  {signupError}
                </Typography>
              ) : null}

              <Divider />

              <Button
                type="button"
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => setMode("login")}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Entrar
              </Button>
            </>
          )}
        </Stack>
      </CardSection>

      <Dialog
        open={recoveryOpen}
        onClose={handleRecoveryClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Recuperar senha</Typography>
              <Button
                variant="text"
                onClick={handleRecoveryClose}
                sx={{ minWidth: 0, px: 1, color: "text.secondary" }}
              >
                x
              </Button>
            </Box>
            {recoveryStep === "request" ? (
              <>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Informe seu email para receber o código de recuperação.
                </Typography>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={recoveryEmail}
                  onChange={event => setRecoveryEmail(event.target.value)}
                />
                {recoveryError ? (
                  <Typography variant="caption" color="error">
                    {recoveryError}
                  </Typography>
                ) : null}
                {recoveryNotice ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {recoveryNotice}
                  </Typography>
                ) : null}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="flex-end"
                >
                  <Button variant="outlined" onClick={handleRecoveryClose}>
                    Cancelar
                  </Button>
                  <Button variant="contained" onClick={handleRecoveryRequest}>
                    Enviar codigo
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Informe o codigo recebido e escolha uma nova senha.
                </Typography>
                <TextField
                  label="Codigo"
                  fullWidth
                  value={recoveryToken}
                  onChange={event => setRecoveryToken(event.target.value)}
                />
                <TextField
                  label="Nova senha"
                  type={showRecoveryPassword ? "text" : "password"}
                  fullWidth
                  value={recoveryPassword}
                  onChange={event => setRecoveryPassword(event.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowRecoveryPassword(prev => !prev)}
                          edge="end"
                        >
                          {showRecoveryPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmar senha"
                  type={showRecoveryConfirm ? "text" : "password"}
                  fullWidth
                  value={recoveryConfirm}
                  onChange={event => setRecoveryConfirm(event.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowRecoveryConfirm(prev => !prev)}
                          edge="end"
                        >
                          {showRecoveryConfirm ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {recoveryError ? (
                  <Typography variant="caption" color="error">
                    {recoveryError}
                  </Typography>
                ) : null}
                {recoveryNotice ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {recoveryNotice}
                  </Typography>
                ) : null}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="flex-end"
                >
                  <Button variant="outlined" onClick={handleRecoveryClose}>
                    Cancelar
                  </Button>
                  <Button variant="contained" onClick={handleRecoveryReset}>
                    Atualizar senha
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
