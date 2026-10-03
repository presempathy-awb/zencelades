export type MovementRoutine = "settle" | "look" | "reach" | "stretch" | "recline" | "tucked-crouch";

export interface MovementRoutinePose {
  routine: MovementRoutine;
  motion: number;
  motionX: number;
  torsoPitch: number;
  torsoYaw: number;
  torsoRoll: number;
  headPitch: number;
  headYaw: number;
  armLift: number;
  armReach: number;
  hipTuck: number;
  kneeBend: number;
  bodyLift: number;
}

const ROUTINES: readonly MovementRoutine[] = [
  "settle",
  "look",
  "reach",
  "stretch",
  "recline",
  "tucked-crouch",
];
const ROUTINE_SECONDS = 8;
const TRANSITION_SECONDS = 1.5;
const LOOP_SECONDS = ROUTINES.length * ROUTINE_SECONDS;

function smooth(value: number): number {
  const bounded = Math.max(0, Math.min(1, value));
  return bounded * bounded * (3 - 2 * bounded);
}

function writeRoutine(routine: MovementRoutine, phase: number, pose: MovementRoutinePose): void {
  const action = Math.sin(Math.PI * phase);
  const pulse = Math.sin(Math.PI * 2 * phase);
  pose.routine = routine;
  pose.motion = 0.12;
  pose.motionX = 0;
  pose.torsoPitch = 0;
  pose.torsoYaw = 0;
  pose.torsoRoll = 0;
  pose.headPitch = 0;
  pose.headYaw = 0;
  pose.armLift = 0;
  pose.armReach = 0;
  pose.hipTuck = 0;
  pose.kneeBend = 0;
  pose.bodyLift = 0;
  switch (routine) {
    case "settle":
      pose.motion = 0.12 + action * 0.08;
      pose.motionX = pulse * 0.08;
      pose.torsoPitch = action * 0.025;
      pose.headPitch = action * -0.03;
      pose.hipTuck = action * 0.04;
      pose.kneeBend = action * 0.06;
      break;
    case "look":
      pose.motion = 0.28 + action * 0.08;
      pose.motionX = action * -0.28;
      pose.torsoYaw = action * -0.07;
      pose.torsoRoll = action * 0.025;
      pose.headPitch = action * 0.035;
      pose.headYaw = action * 0.24;
      pose.armLift = action * 0.06;
      break;
    case "reach":
      pose.motion = 0.52 + action * 0.16;
      pose.motionX = action * 0.46;
      pose.torsoPitch = action * 0.1;
      pose.torsoYaw = action * 0.11;
      pose.headYaw = action * 0.13;
      pose.armLift = action * 0.28;
      pose.armReach = action * 0.58;
      pose.hipTuck = action * 0.08;
      break;
    case "stretch":
      pose.motion = 0.44 + action * 0.12;
      pose.motionX = pulse * 0.12;
      pose.torsoPitch = action * -0.07;
      pose.headPitch = action * -0.08;
      pose.armLift = action * 0.72;
      pose.armReach = action * 0.24;
      pose.bodyLift = action * 0.045;
      break;
    case "recline":
      pose.motion = 0.34 + action * 0.1;
      pose.motionX = pulse * 0.1;
      pose.torsoPitch = action * -0.2;
      pose.torsoRoll = action * -0.025;
      pose.headPitch = action * 0.08;
      pose.armLift = action * 0.1;
      pose.armReach = action * 0.2;
      pose.hipTuck = action * 0.14;
      pose.kneeBend = action * 0.2;
      pose.bodyLift = action * -0.035;
      break;
    case "tucked-crouch":
      pose.motion = 0.48 + action * 0.14;
      pose.motionX = pulse * 0.16;
      pose.torsoPitch = action * 0.2;
      pose.torsoRoll = action * 0.025;
      pose.headPitch = action * -0.09;
      pose.armLift = action * 0.14;
      pose.armReach = action * 0.1;
      pose.hipTuck = action * 0.34;
      pose.kneeBend = action * 0.48;
      pose.bodyLift = action * -0.09;
      break;
  }
}

let cachedSeed = 0;
let cachedOrder = [...ROUTINES];

function routineOrder(seed: number): readonly MovementRoutine[] {
  const finite = Number.isFinite(seed) ? Math.trunc(seed) : 0;
  if (finite === cachedSeed) return cachedOrder;
  cachedSeed = finite;
  cachedOrder = [...ROUTINES];
  if (finite === 0) return cachedOrder;
  let value = (finite ^ 0x9e3779b9) >>> 0;
  for (let index = cachedOrder.length - 1; index > 0; index--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const swap = Math.floor((value / 4294967296) * (index + 1));
    [cachedOrder[index], cachedOrder[swap]] = [cachedOrder[swap], cachedOrder[index]];
  }
  return cachedOrder;
}

/** Sample a deterministic looping action, optionally reusing a caller-owned pose object. */
export function routinePoseAt(
  seconds: number,
  seed: number,
  target?: MovementRoutinePose,
): MovementRoutinePose {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const loopTime = ((safeSeconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  const sequence = Math.floor(loopTime / ROUTINE_SECONDS);
  const localTime = loopTime - sequence * ROUTINE_SECONDS;
  const order = routineOrder(seed);
  const routine = order[sequence];
  const nextRoutine = order[(sequence + 1) % order.length];
  const pose =
    target ??
    ({
      routine,
      motion: 0,
      motionX: 0,
      torsoPitch: 0,
      torsoYaw: 0,
      torsoRoll: 0,
      headPitch: 0,
      headYaw: 0,
      armLift: 0,
      armReach: 0,
      hipTuck: 0,
      kneeBend: 0,
      bodyLift: 0,
    } satisfies MovementRoutinePose);
  writeRoutine(routine, localTime / ROUTINE_SECONDS, pose);
  const transition = smooth(
    (localTime - (ROUTINE_SECONDS - TRANSITION_SECONDS)) / TRANSITION_SECONDS,
  );
  if (transition === 0) return pose;
  const motion = pose.motion;
  const motionX = pose.motionX;
  const torsoPitch = pose.torsoPitch;
  const torsoYaw = pose.torsoYaw;
  const torsoRoll = pose.torsoRoll;
  const headPitch = pose.headPitch;
  const headYaw = pose.headYaw;
  const armLift = pose.armLift;
  const armReach = pose.armReach;
  const hipTuck = pose.hipTuck;
  const kneeBend = pose.kneeBend;
  const bodyLift = pose.bodyLift;
  writeRoutine(nextRoutine, 0, pose);
  pose.routine = transition < 0.5 ? routine : nextRoutine;
  pose.motion = motion + (pose.motion - motion) * transition;
  pose.motionX = motionX + (pose.motionX - motionX) * transition;
  pose.torsoPitch = torsoPitch + (pose.torsoPitch - torsoPitch) * transition;
  pose.torsoYaw = torsoYaw + (pose.torsoYaw - torsoYaw) * transition;
  pose.torsoRoll = torsoRoll + (pose.torsoRoll - torsoRoll) * transition;
  pose.headPitch = headPitch + (pose.headPitch - headPitch) * transition;
  pose.headYaw = headYaw + (pose.headYaw - headYaw) * transition;
  pose.armLift = armLift + (pose.armLift - armLift) * transition;
  pose.armReach = armReach + (pose.armReach - armReach) * transition;
  pose.hipTuck = hipTuck + (pose.hipTuck - hipTuck) * transition;
  pose.kneeBend = kneeBend + (pose.kneeBend - kneeBend) * transition;
  pose.bodyLift = bodyLift + (pose.bodyLift - bodyLift) * transition;
  return pose;
}
