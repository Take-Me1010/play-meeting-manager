import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"player" | "observer">("player");
  const [style, setStyle] = useState<"環境" | "カジュアル">("環境");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("名前を入力してください");
      return;
    }

    try {
      await login(name.trim(), role, style);
      navigate("/");
    } catch {
      // エラーはAuthContextで処理される
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            textAlign="center"
          >
            交流会対戦管理
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            参加登録を行ってください
          </Typography>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />

            <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
              <FormLabel component="legend">参加タイプ</FormLabel>
              <RadioGroup
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "player" | "observer")
                }
              >
                <FormControlLabel
                  value="player"
                  control={<Radio />}
                  label="対戦者（試合に参加）"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="observer"
                  control={<Radio />}
                  label="観戦者（観戦のみ）"
                  disabled={isLoading}
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
              <FormLabel component="legend">デッキランク</FormLabel>
              <RadioGroup
                value={style}
                onChange={(e) =>
                  setStyle(e.target.value as "環境" | "カジュアル")
                }
              >
                <FormControlLabel
                  value="環境"
                  control={<Radio />}
                  label="環境デッキ"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="カジュアル"
                  control={<Radio />}
                  label="カジュアルデッキ"
                  disabled={isLoading}
                />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "参加登録"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
