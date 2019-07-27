import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';

injectable(ModelModules.Roulette.Request,
  [],
  async (): Promise<ModelTypes.Roulette.Request> =>

    async (param) => {
      return null;
    });


injectable(ModelModules.Roulette.Status,
  [],
  async () => {});
