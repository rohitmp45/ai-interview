import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
  });

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      const res = await axios.get("/api/todos", { withCredentials: true });
      setTodos(res.data.todos || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Check for scheduled todos and show notifications
  useEffect(() => {
    const checkNotifications = async () => {
      const now = new Date();
      for (const todo of todos) {
        if (
          todo.scheduledAt &&
          !todo.completed &&
          !todo.notified &&
          new Date(todo.scheduledAt) <= now
        ) {
          showNotification(todo);
          // Mark as notified in database
          try {
            await axios.put(
              "/api/todos",
              { id: todo.id, notified: true },
              { withCredentials: true }
            );
            fetchTodos(); // Refresh to update notified status
          } catch (error) {
            console.error("Error marking todo as notified:", error);
          }
        }
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [todos, fetchTodos]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (todo) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Task Reminder: ${todo.title}`, {
        body: todo.description || "Time to complete this task!",
        icon: "/favicon.ico",
        tag: `todo-${todo.id}`,
      });
    }
  };

  const handleOpenDialog = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      setFormData({
        title: todo.title,
        description: todo.description || "",
        scheduledAt: todo.scheduledAt
          ? new Date(todo.scheduledAt).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setEditingTodo(null);
      setFormData({ title: "", description: "", scheduledAt: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTodo(null);
    setFormData({ title: "", description: "", scheduledAt: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await axios.put(
          "/api/todos",
          { ...formData, id: editingTodo.id },
          { withCredentials: true }
        );
      } else {
        await axios.post("/api/todos", formData, { withCredentials: true });
      }
      fetchTodos();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving todo:", error);
      alert("Error saving todo");
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await axios.put(
        "/api/todos",
        { id: todo.id, completed: !todo.completed },
        { withCredentials: true }
      );
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/api/todos?id=${id}`, { withCredentials: true });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOverdue = (scheduledAt, completed) => {
    if (!scheduledAt || completed) return false;
    return new Date(scheduledAt) < new Date();
  };

  if (loading) {
    return <Typography>Loading todos...</Typography>;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          My Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-bold" width={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      {todos.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary">
              No tasks yet. Create your first task!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {todos.map((todo) => {
            const overdue = isOverdue(todo.scheduledAt, todo.completed);
            return (
              <Card
                key={todo.id}
                sx={{
                  mb: 1,
                  border: overdue ? 2 : 1,
                  borderColor: overdue ? "error.main" : "divider",
                  bgcolor:
                    overdue && !todo.completed
                      ? "error.light"
                      : "background.paper",
                }}
              >
                <ListItem>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                  />
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                            color: todo.completed
                              ? "text.secondary"
                              : overdue
                              ? "error.main"
                              : "text.primary",
                            fontWeight: overdue && !todo.completed ? 700 : 400,
                          }}
                        >
                          {todo.title}
                        </Typography>
                        {todo.scheduledAt && (
                          <Chip
                            label={formatDate(todo.scheduledAt)}
                            size="small"
                            color={
                              isOverdue(todo.scheduledAt, todo.completed)
                                ? "error"
                                : "primary"
                            }
                            icon={
                              <Icon
                                icon="solar:calendar-bold"
                                width={16}
                                height={16}
                              />
                            }
                          />
                        )}
                        {todo.completed && (
                          <Chip
                            label="Completed"
                            size="small"
                            color="success"
                            icon={
                              <Icon
                                icon="solar:check-circle-bold"
                                width={16}
                                height={16}
                              />
                            }
                          />
                        )}
                      </Box>
                    }
                    secondary={todo.description}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(todo)}
                      sx={{ mr: 1 }}
                    >
                      <Icon icon="solar:pen-bold" width={20} />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(todo.id)}
                      color="error"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" width={20} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Card>
            );
          })}
        </List>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTodo ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <TextField
                label="Schedule Date & Time"
                type="datetime-local"
                fullWidth
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              {formData.scheduledAt && (
                <Alert severity="info">
                  You&apos;ll receive a notification when this time arrives
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTodo ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
