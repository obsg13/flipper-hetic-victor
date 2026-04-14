import {
  DRAIN_MIN_Z,
  DRAIN_MAX_Z,
  DRAIN_MIN_X,
  DRAIN_MAX_X,
  DRAIN_MAX_Y,
  COLLISION_COOLDOWN_MS,
} from "./constants.js";

/**
 * Branche la detection de collision de la bille et emet `collision` au serveur.
 */
export function attachCollisionEmitter(ballBody, emitCollision) {
  const lastByKey = new Map();

  ballBody.addEventListener("collide", (event) => {
    const type = event.body?.userData?.type;
    if (!type || !["bumper", "wall", "flipper", "drain"].includes(type)) return;

    const key = `${type}:${event.body.id}`;
    const now = performance.now();
    const prev = lastByKey.get(key);
    if (prev != null && now - prev < COLLISION_COOLDOWN_MS) return;
    lastByKey.set(key, now);

    emitCollision(type);
  });
}

/**
 * Drain logique : une perte de bille max jusqu'au prochain reset.
 */
export function createDrainWatcher() {
  return {
    canLoseBall: true,
  };
}

export function detectDrain(ballBody, drainState) {
  if (!drainState.canLoseBall) return false;
  const p = ballBody.position;
  const insideX = p.x >= DRAIN_MIN_X && p.x <= DRAIN_MAX_X;
  const insideZ = p.z >= DRAIN_MIN_Z && p.z <= DRAIN_MAX_Z;
  const belowY = p.y <= DRAIN_MAX_Y;
  if (!(insideX && insideZ && belowY)) return false;
  drainState.canLoseBall = false;
  return true;
}
