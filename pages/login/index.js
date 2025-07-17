// pages/login.js
import { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 
  

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', form);
      setMsg(res.data.message);
      if (res.status === 200) {
        router.push('/chat'); // Redirect to chat page
      }
    } catch (err) {
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
        <Typography variant="h5">Login</Typography>
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
            Login
          </Button>
        </form>
        {msg && <Typography color="error">{msg}</Typography>}
      </Box>
    </Container>
  );
}
