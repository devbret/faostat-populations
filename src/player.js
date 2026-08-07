import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createPlayer({ years, onChange }) {
  const first = years[0];
  const last = years.at(-1);

  let year = first;
  let playing = false;
  let rate = 4;
  let endMode = "loop";
  let timer = null;

  function emit(cause) {
    onChange({ year, playing, rate, endMode, cause });
  }

  function clamp(y) {
    return Math.max(first, Math.min(last, y));
  }

  function setYear(y, cause = "set") {
    const next = clamp(Math.round(y));
    if (next === year && cause !== "wrap") {
      emit(cause);
      return year;
    }
    year = next;
    emit(cause);
    return year;
  }

  function step(delta = 1) {
    const next = year + delta;
    if (next > last) {
      if (endMode === "loop") return setYear(first, "wrap");
      pause();
      return setYear(last, "end");
    }
    if (next < first) {
      return setYear(first, "step");
    }
    return setYear(next, "step");
  }

  function advance() {
    step(1);
  }

  function restart() {
    if (timer) timer.stop();
    if (!playing) return;
    timer = d3.interval(advance, 1000 / rate);
  }

  function play() {
    if (endMode === "once" && year >= last) setYear(first, "rewind");
    playing = true;
    restart();
    emit("play");
  }

  function pause() {
    playing = false;
    if (timer) timer.stop();
    timer = null;
    emit("pause");
  }

  function toggle() {
    if (playing) pause();
    else play();
  }

  return {
    get year() {
      return year;
    },
    get playing() {
      return playing;
    },
    get rate() {
      return rate;
    },
    get endMode() {
      return endMode;
    },
    first,
    last,
    play,
    pause,
    toggle,
    step,
    setYear,
    setRate(r) {
      rate = Math.max(0.5, Math.min(30, r));
      restart();
      emit("rate");
    },
    setEndMode(m) {
      endMode = m;
      emit("endMode");
    },
  };
}
