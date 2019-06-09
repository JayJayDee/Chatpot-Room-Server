import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { BaseLogicError } from '../errors';

injectable(ModelModules.Converter.Room,
  [],
  async (): Promise<ModelTypes.Converter.Room> =>
    (r: any) => ({
      no: r.no,
      room_type: getRoomType(r),
      token: r.token,
      title: r.title,
      owner_no: r.owner_no,
      num_attendee: r.num_attendee,
      max_attendee: r.max_attendee,
      reg_date: r.reg_date
    }));

class InvalidRoomTypeError extends BaseLogicError {
  constructor(gainRoomType: string) {
    super('INVALID_ROOM_TYPE', `${gainRoomType} is not an valid room type`);
  }
}

const getRoomType = (r: any): ModelTypes.RoomType => {
  if (r.room_type === 'PUBLIC') return ModelTypes.RoomType.PUBLIC;
  else if (r.room_type === 'ROULETTE') return ModelTypes.RoomType.ROULETTE;
  else if (r.room_type === 'ONEONONE') return ModelTypes.RoomType.ONEONEONE;
  throw new InvalidRoomTypeError(r.room_type);
};