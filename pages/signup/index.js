import { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res =   await axios.post('/api/signup', form);
      console.log('res of signup',res);
      router.push('/login');
      setMsg(res.data.message);
    } catch (err) {
      console.log('err of signup',err);
      setMsg(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h5">Signup</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            margin="normal"
            value={form.password}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
          >
            Signup
          </Button>
        </form>
        {msg && <Typography color={msg.includes('created') ? 'primary' : 'error'}>{msg}</Typography>}
      </Box>
    </Container>
  );
}
