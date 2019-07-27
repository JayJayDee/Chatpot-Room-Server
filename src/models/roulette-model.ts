import { injectable } from 'smart-factory';
import { ModelModules } from './modules';

injectable(ModelModules.Roulette.Request,
  [],
  async () => {});

injectable(ModelModules.Roulette.Status,
  [],
  async () => {});
