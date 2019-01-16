import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';

injectable(ModelModules.Converter.Room,
  [],
  async (): Promise<ModelTypes.Converter.Room> =>
    (r: any) => ({
      no: r.no,
      token: r.token,
      title: r.title,
      owner_no: r.owner_no,
      num_attendee: r.num_attendee,
      max_attendee: r.max_attendee,
      reg_date: r.reg_date
    }));