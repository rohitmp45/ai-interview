import { useState, useEffect, useCallback, useMemo } from "react";
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
  Grid,
  LinearProgress,
  Paper,
  Divider,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

export default function TodoApp() {
  const { theme } = useTheme();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [viewMode, setViewMode] = useState("tasks"); // 'tasks' or 'analytics'
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

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const overdue = todos.filter(
      (t) =>
        t.scheduledAt && !t.completed && new Date(t.scheduledAt) < new Date()
    ).length;
    const scheduled = todos.filter((t) => t.scheduledAt && !t.completed).length;

    // Weekly completion data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const weeklyData = last7Days.map((date) => {
      const dayTodos = todos.filter((todo) => {
        if (!todo.createdAt) return false;
        const todoDate = new Date(todo.createdAt);
        todoDate.setHours(0, 0, 0, 0);
        return todoDate.getTime() === date.getTime();
      });
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        created: dayTodos.length,
        completed: dayTodos.filter((t) => t.completed).length,
      };
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      overdue,
      scheduled,
      weeklyData,
    };
  }, [todos]);

  // Check for scheduled todos and show notifications
  useEffect(() => {
    if (todos.length === 0) return;

    const checkNotifications = async () => {
      const now = new Date();
      const todosToNotify = [];

      for (const todo of todos) {
        if (todo.scheduledAt && !todo.completed && !todo.notified) {
          const scheduledTime = new Date(todo.scheduledAt);
          const timeDiff = scheduledTime.getTime() - now.getTime();

          if (timeDiff <= 60000 && timeDiff >= -60000) {
            todosToNotify.push(todo);
          }
        }
      }

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

      if (todosToNotify.length > 0) {
        fetchTodos();
      }
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();

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
          requireInteraction: true,
        });
      } else if (Notification.permission === "default") {
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
      let scheduledAtValue = "";
      if (todo.scheduledAt) {
        const date = new Date(todo.scheduledAt);
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
        const oldScheduledAt = editingTodo.scheduledAt
          ? new Date(editingTodo.scheduledAt).toISOString().slice(0, 16)
          : "";
        const newScheduledAt = formData.scheduledAt || "";

        const updateData = { ...formData, id: editingTodo.id };

        if (oldScheduledAt !== newScheduledAt) {
          updateData.notified = false;
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

  // Chart component for weekly data
  const WeeklyChart = () => {
    const maxValue = Math.max(
      ...analytics.weeklyData.map((d) => Math.max(d.created, d.completed)),
      1
    );

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Activity
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            height: 200,
            mt: 2,
          }}
        >
          {analytics.weeklyData.map((day, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "100%",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: `${(day.created / maxValue) * 100}%`,
                    bgcolor: "primary.main",
                    borderRadius: "4px 4px 0 0",
                    minHeight: day.created > 0 ? "4px" : "0",
                    transition: "all 0.3s ease",
                  }}
                  title={`Created: ${day.created}`}
                />
                <Box
                  sx={{
                    width: "100%",
                    height: `${(day.completed / maxValue) * 100}%`,
                    bgcolor: "success.main",
                    borderRadius: "0 0 4px 4px",
                    minHeight: day.completed > 0 ? "4px" : "0",
                    transition: "all 0.3s ease",
                  }}
                  title={`Completed: ${day.completed}`}
                />
              </Box>
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                {day.date}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "primary.main",
                borderRadius: 1,
              }}
            />
            <Typography variant="caption">Created</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "success.main",
                borderRadius: 1,
              }}
            />
            <Typography variant="caption">Completed</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading todos...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header with View Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Task Manager
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant={viewMode === "tasks" ? "contained" : "outlined"}
            onClick={() => setViewMode("tasks")}
            startIcon={<Icon icon="solar:list-check-bold" width={20} />}
          >
            Tasks
          </Button>
          <Button
            variant={viewMode === "analytics" ? "contained" : "outlined"}
            onClick={() => setViewMode("analytics")}
            startIcon={<Icon icon="solar:chart-2-bold" width={20} />}
          >
            Analytics
          </Button>
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

      {viewMode === "analytics" ? (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon icon="solar:clipboard-list-bold" width={32} />
                  <Typography variant="h6">Total Tasks</Typography>
                </Box>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  {analytics.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon icon="solar:check-circle-bold" width={32} />
                  <Typography variant="h6">Completed</Typography>
                </Box>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  {analytics.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon icon="solar:clock-circle-bold" width={32} />
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  {analytics.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon icon="solar:calendar-mark-bold" width={32} />
                  <Typography variant="h6">Overdue</Typography>
                </Box>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                  {analytics.overdue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Completion Rate */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completion Rate
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {analytics.completionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.completionRate}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 6,
                        background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Scheduled Tasks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scheduled Tasks
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, fontWeight: 700 }}>
                  {analytics.scheduled}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Tasks with scheduled dates
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <WeeklyChart />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <>
          {todos.length === 0 ? (
            <Card
              sx={{
                textAlign: "center",
                py: 6,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
              }}
            >
              <CardContent>
                <Icon
                  icon="solar:clipboard-list-bold"
                  width={64}
                  style={{ opacity: 0.5, marginBottom: 16 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create your first task to get started!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Icon icon="solar:add-circle-bold" width={20} />}
                  onClick={() => handleOpenDialog()}
                >
                  Create Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {todos.map((todo) => {
                const overdue = isOverdue(todo.scheduledAt, todo.completed);
                return (
                  <Grid item xs={12} sm={6} md={4} key={todo.id}>
                    <Card
                      sx={{
                        height: "100%",
                        border: overdue ? 2 : 1,
                        borderColor: overdue ? "error.main" : "divider",
                        bgcolor:
                          overdue && !todo.completed
                            ? "error.light"
                            : "background.paper",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: 4,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <ListItem>
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo)}
                          sx={{ mr: 1 }}
                        />
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  textDecoration: todo.completed
                                    ? "line-through"
                                    : "none",
                                  color: todo.completed
                                    ? "text.secondary"
                                    : overdue
                                    ? "error.main"
                                    : "text.primary",
                                  fontWeight:
                                    overdue && !todo.completed ? 700 : 500,
                                }}
                              >
                                {todo.title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {todo.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  {todo.description}
                                </Typography>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                {todo.scheduledAt && (
                                  <Chip
                                    label={formatDate(todo.scheduledAt)}
                                    size="small"
                                    color={
                                      isOverdue(
                                        todo.scheduledAt,
                                        todo.completed
                                      )
                                        ? "error"
                                        : "primary"
                                    }
                                    icon={
                                      <Icon
                                        icon="solar:calendar-bold"
                                        width={14}
                                        height={14}
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
                                        width={14}
                                        height={14}
                                      />
                                    }
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          p: 1,
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(todo)}
                          color="primary"
                        >
                          <Icon icon="solar:pen-bold" width={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(todo.id)}
                          color="error"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ pb: 1 }}>
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
                autoFocus
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
                <Alert
                  severity="info"
                  icon={<Icon icon="solar:bell-bold" width={20} />}
                >
                  You&apos;ll receive a notification when this time arrives
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
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
