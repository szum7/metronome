const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${protocol}//${location.host}`);
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const bpmInput = document.getElementById("bpm");

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isRunning = false;

function playClick() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "tick") {
    playClick();
  } else if (data.type === "start") {
    isRunning = true;
    bpmInput.value = data.bpm;
  } else if (data.type === "stop") {
    isRunning = false;
  }
};

startBtn.onclick = () => {
  const bpm = parseInt(bpmInput.value, 10);
  socket.send(JSON.stringify({ type: "start", bpm }));
};

stopBtn.onclick = () => {
  socket.send(JSON.stringify({ type: "stop" }));
};
