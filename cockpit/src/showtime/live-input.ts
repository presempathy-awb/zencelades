export interface LiveInput {
  start(): Promise<boolean>;
  stop(): void;
  readonly active: boolean;
  readonly pending: boolean;
}

/** Manage an explicitly enabled camera stream for the local projection. */
export function createLiveInput(
  video: HTMLVideoElement,
  mediaDevices?: Pick<MediaDevices, "getUserMedia">,
): LiveInput {
  let generation = 0;
  let stream: MediaStream | null = null;
  let starting: Promise<boolean> | null = null;
  let active = false;
  let removeEndedListeners = (): void => {};

  const stop = (): void => {
    generation++;
    starting = null;
    active = false;
    removeEndedListeners();
    removeEndedListeners = () => {};
    const previous = stream;
    stream = null;
    video.pause();
    video.srcObject = null;
    for (const track of previous?.getTracks() ?? []) track.stop();
  };

  return {
    start: () => {
      if (active) return Promise.resolve(true);
      if (starting) return starting;
      const requestedGeneration = ++generation;
      starting = Promise.resolve()
        .then(async () => {
          if (requestedGeneration !== generation) return false;
          const devices =
            mediaDevices ?? (typeof navigator !== "undefined" ? navigator.mediaDevices : undefined);
          if (!devices?.getUserMedia) {
            throw new Error(
              "Camera access is unavailable. Open Showtime in a secure browser context.",
            );
          }
          const granted = await devices.getUserMedia({
            audio: false,
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          if (requestedGeneration !== generation) {
            for (const track of granted.getTracks()) track.stop();
            return false;
          }
          stream = granted;
          const tracks = granted.getVideoTracks();
          const ended = (): void => {
            if (requestedGeneration === generation) stop();
          };
          for (const track of tracks) track.addEventListener("ended", ended);
          removeEndedListeners = () => {
            for (const track of tracks) track.removeEventListener("ended", ended);
          };
          video.muted = true;
          video.playsInline = true;
          video.srcObject = granted;
          try {
            await video.play();
          } catch (error) {
            if (requestedGeneration === generation) stop();
            throw error;
          }
          if (requestedGeneration !== generation) return false;
          active = true;
          return true;
        })
        .finally(() => {
          if (requestedGeneration === generation) starting = null;
        });
      return starting;
    },
    stop,
    get active() {
      return active;
    },
    get pending() {
      return starting !== null;
    },
  };
}
