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
  Stack,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/useAuth";
import { Layout } from "../components/Layout";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, isLoading, error } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState<"player" | "observer">(
    user?.role || "player",
  );
  const [style, setStyle] = useState<"環境" | "カジュアル">(
    user?.style || "環境",
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    if (!name.trim()) {
      setLocalError("名前を入力してください");
      return;
    }

    try {
      await updateUser({ name: name.trim(), role, style });
      setSuccess(true);
    } catch {
      // エラーはuseAuthで処理される
    }
  };

  const hasChanges =
    name !== user?.name || role !== user?.role || style !== user?.style;

  return (
    <Layout>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1">
          プロフィール編集
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              プロフィールを更新しました
            </Alert>
          )}
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

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !hasChanges}
                sx={{ flexGrow: 1 }}
              >
                {isLoading ? <CircularProgress size={24} /> : "保存"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Layout>
  );
}
