import { useEffect, useRef, useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import { Icon } from "@iconify/react";

export default function VoiceTitle({ defaultTitle = "Task Manager - Dashboard" }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const previousTitleRef = useRef(defaultTitle);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      const text = (final || interim).trim();
      if (text) {
        setTranscript(text);
        document.title = text;
      }
    };

    recognition.onerror = () => {
      recognition.stop();
      setListening(false);
      document.title = previousTitleRef.current;
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      document.title = previousTitleRef.current;
    };
  }, []);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert("SpeechRecognition not supported in this browser");

    if (!listening) {
      previousTitleRef.current = document.title || defaultTitle;
      try {
        rec.start();
        setListening(true);
      } catch (e) {}
    } else {
      try {
        rec.stop();
      } catch (e) {}
      setListening(false);
      document.title = previousTitleRef.current;
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        variant={listening ? "contained" : "outlined"}
        color={listening ? "success" : "primary"}
        onClick={toggle}
        startIcon={<Icon icon={listening ? "ic:baseline-mic" : "ic:baseline-mic-none"} />}
        sx={{ textTransform: "none", fontWeight: 700 }}
      >
        {listening ? "Listening..." : "Start Voice Title"}
      </Button>
      <Typography variant="body2" color="text.secondary">
        {transcript ? `Live: ${transcript}` : "No speech yet"}
      </Typography>
    </Box>
  );
}
