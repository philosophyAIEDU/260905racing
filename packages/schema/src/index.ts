import { z } from 'zod';

export const vehicleSchema = z.object({
  centerOfMassY: z.number(),
  inertiaPitch: z.number().positive(),
  inertiaYaw: z.number().positive(),
  inertiaRoll: z.number().positive(),
  name: z.string(),
  mass: z.number().positive(),
  engineForce: z.number().positive(),
  brakeImpulse: z.number().positive(),
  maxSpeed: z.number().positive(),
  reverseSpeed: z.number().positive(),
  maxSteer: z.number().min(0.1).max(0.8),
  steerSpeed: z.number().positive(),
  wheelRadius: z.number().positive(),
  suspensionRest: z.number().positive(),
  suspensionStiffness: z.number().positive(),
  suspensionCompression: z.number().positive(),
  suspensionRelaxation: z.number().positive(),
  suspensionTravel: z.number().positive(),
  maxSuspensionForce: z.number().positive(),
  frictionSlip: z.number().positive(),
  lateralStiffness: z.number().positive(),
  driftGrip: z.number().positive(),
  drag: z.number().nonnegative(),
  downforce: z.number().nonnegative(),
});
export type VehicleConfig = z.infer<typeof vehicleSchema>;

export const preferencesSchema = z.object({
  language: z.enum(['ko', 'en']).default('ko'),
  assists: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  camera: z.enum(['chase', 'hood']).default('chase'),
  color: z.enum(['#e5fa62', '#ff7047', '#77bfe5']).default('#e5fa62'),
  quality: z.enum(['standard', 'low']).default('standard'),
  tilt: z.boolean().default(false),
  movementGuard: z.boolean().default(false),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const recordSchema = z.object({
  bestLap: z.number().positive().nullable(),
  runs: z.number().int().nonnegative(),
});
