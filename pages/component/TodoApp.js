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
  const [notificationPermission, setNotificationPermission] =
    useState("default");
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
    if (todos.length === 0) return;

    const checkNotifications = async () => {
      const now = new Date();
      const todosToNotify = [];

      for (const todo of todos) {
        if (todo.scheduledAt && !todo.completed && !todo.notified) {
          const scheduledTime = new Date(todo.scheduledAt);
          // Check if scheduled time has arrived (within 1 minute tolerance)
          const timeDiff = scheduledTime.getTime() - now.getTime();

          if (timeDiff <= 60000 && timeDiff >= -60000) {
            // Within 1 minute of scheduled time
            todosToNotify.push(todo);
          }
        }
      }

      // Show notifications and mark as notified
      for (const todo of todosToNotify) {
        showNotification(todo);
        try {
          await axios.put(
            "/api/todos",
            { id: todo.id, notified: true },
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Error marking todo as notified:", error);
        }
      }

      // Refresh todos if any were notified
      if (todosToNotify.length > 0) {
        fetchTodos();
      }
    };

    // Check every 30 seconds for more accurate notifications
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [todos, fetchTodos]);

  // Check notification permission status
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        alert(
          "Notifications enabled! You'll receive reminders for scheduled tasks."
        );
      }
    }
  };

  const showNotification = (todo) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`Task Reminder: ${todo.title}`, {
          body: todo.description || "Time to complete this task!",
          icon: "/favicon.ico",
          tag: `todo-${todo.id}`,
          requireInteraction: true, // Keep notification until user interacts
        });
      } else if (Notification.permission === "default") {
        // Request permission if not yet requested
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`Task Reminder: ${todo.title}`, {
              body: todo.description || "Time to complete this task!",
              icon: "/favicon.ico",
              tag: `todo-${todo.id}`,
              requireInteraction: true,
            });
          }
        });
      }
    }
  };

  const handleOpenDialog = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      // Convert scheduledAt to local datetime format for editing
      let scheduledAtValue = "";
      if (todo.scheduledAt) {
        const date = new Date(todo.scheduledAt);
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        scheduledAtValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      setFormData({
        title: todo.title,
        description: todo.description || "",
        scheduledAt: scheduledAtValue,
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
        // Compare old and new scheduledAt values
        const oldScheduledAt = editingTodo.scheduledAt
          ? new Date(editingTodo.scheduledAt).toISOString().slice(0, 16)
          : "";
        const newScheduledAt = formData.scheduledAt || "";

        const updateData = { ...formData, id: editingTodo.id };

        // Reset notified if scheduledAt changed or was cleared
        if (oldScheduledAt !== newScheduledAt) {
          updateData.notified = false; // Reset notification when schedule changes
        }

        await axios.put("/api/todos", updateData, { withCredentials: true });
      } else {
        await axios.post("/api/todos", formData, { withCredentials: true });
      }
      fetchTodos();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving todo:", error);
      alert(
        "Error saving todo: " + (error.response?.data?.error || error.message)
      );
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          My Tasks
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {notificationPermission !== "granted" && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Icon icon="solar:bell-bold" width={18} />}
              onClick={requestNotificationPermission}
            >
              Enable Notifications
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Icon icon="solar:add-circle-bold" width={20} />}
            onClick={() => handleOpenDialog()}
          >
            Add Task
          </Button>
        </Box>
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
