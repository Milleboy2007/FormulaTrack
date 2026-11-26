import 'reflect-metadata'; // doit être chargé avant les schémas décorés

//pour import de un seul file au lieu de plein
export { default as databaseConnection } from './connect';

export * from './schemas/circuit.schema';
export * from './schemas/cornerStats.schema';
export * from './schemas/driver.schema';
export * from './schemas/grandprix.schema';
export * from './schemas/lap.schema';
export * from './schemas/lapTelemetry.schema';
export * from './schemas/raceEvent.schema';
export * from './schemas/raceSummary.schema';
export * from './schemas/result.schema';
export * from './schemas/session.schema';
export * from './schemas/user.schema';