import { find } from 'lodash';
import { injectable } from 'smart-factory';

import { ServiceModules } from './modules';
import { ServiceTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';
import { UtilModules, UtilTypes } from '../utils';
import { LoggerModules, LoggerTypes } from '../loggers';
import { RoomJoinError, RoomLeaveError } from './errors';
import { RouletteMatcherModules, RouletteMatcherTypes } from '../roulette-matcher';

const cvtMember = () =>
  (fromMember: ExtApiTypes.Member): ServiceTypes.Member => {
    if (!fromMember) return null;
    return {
      token: fromMember.token,
      region: fromMember.region,
      language: fromMember.language,
      gender: fromMember.gender,
      nick: fromMember.nick,
      avatar: fromMember.avatar,
      login_id: fromMember.login_id,
      auth_type: fromMember.auth_type
    };
  };

injectable(ServiceModules.Room.List,
  [ ExtApiModules.AuthReq.MembersByNos,
    ModelModules.Room.List ],
  async (requestMembersViaApi: ExtApiTypes.AuthReq.MembersByNos,
    getRooms: ModelTypes.Room.List): Promise<ServiceTypes.RoomService.List> =>

    async (param, order) => {
      const convert = cvtMember();
      param.order = order;
      const roomResp = await getRooms(param);
      const memberNos: number[] = roomResp.list.map((r) => r.owner_no);
      const members = await requestMembersViaApi(memberNos);

      const rooms: ServiceTypes.Room[] = roomResp.list.map((r) => {
        const owner = convert(find(members, {member_no: r.owner_no}));
        if (!owner) return null;
        return {
          room_token: r.token,
          room_type: r.room_type,
          owner: convert(find(members, {member_no: r.owner_no})),
          title: r.title,
          num_attendee: r.num_attendee,
          max_attendee: r.max_attendee,
          reg_date: r.reg_date
        };
      }).filter((r) => r);

      return {
        all: roomResp.all,
        size: roomResp.size,
        offset: roomResp.offset,
        list: rooms
      };
    });

injectable(ServiceModules.Room.Create,
  [ LoggerModules.Logger,
    ModelModules.Room.Create,
    ModelModules.Room.UpdateToken,
    ModelModules.RoomMember.AddMember,
    UtilModules.Auth.CrateRoomToken,
    ModelModules.History.Write,
    ExtApiModules.MessageReq.EnterRoom ],
  async (log: LoggerTypes.Logger,
    create: ModelTypes.Room.Create,
    updateToken: ModelTypes.Room.UpdateToken,
    addMember: ModelTypes.RoomMember.AddMember,
    createRoomToken: UtilTypes.Auth.CreateRoomToken,
    history: ModelTypes.History.Write,
    enterDevTokensProcess: ExtApiTypes.MessageReq.EnterRoom): Promise<ServiceTypes.RoomService.Create> =>

    async (param) => {
      const createdRoomNo = await create({
        title: param.title,
        owner_no: param.owner_no,
        max_attendee: param.max_attendee,
        room_type: ModelTypes.RoomType.PUBLIC
      });
      const token = createRoomToken(createdRoomNo);
      log.debug(`[room-service] room:${createdRoomNo} created`);

      await updateToken(createdRoomNo, token);
      log.debug(`[room-service] room:${createdRoomNo}, member-token:${token} updated`);

      const addResp = await addMember({
        room_no: createdRoomNo,
        member_no: param.owner_no,
        is_owner: true
      });
      if (addResp.success === true) {
        log.debug(`[room-service] room:${createdRoomNo}, member:${param.owner_no} joined`);
      } else {
        log.error(`[room-service] room:${createdRoomNo}, member:${param.owner_no} join fail: ${addResp.cause}`);
      }

      history({
        action: ModelTypes.HistoryAction.CREATE,
        member_no: param.owner_no,
        room_no: createdRoomNo,
        room_title: param.title
      });

      // fcm subscribe
      await enterDevTokensProcess(param.owner_token, token);

      return {
        room_token: token
      };
    });


injectable(ServiceModules.Room.CreateRoulette,
  [ LoggerModules.Logger,
    UtilModules.Auth.CrateRoomToken,
    ModelModules.Room.Create,
    ModelModules.Room.UpdateToken,
    ModelModules.RoomMember.AddMember,
    ModelModules.History.Write,
    ExtApiModules.MessageReq.EnterRoom ],
  async (log: LoggerTypes.Logger,
    createRoomToken: UtilTypes.Auth.CreateRoomToken,
    createRoom: ModelTypes.Room.Create,
    updateRoomToken: ModelTypes.Room.UpdateToken,
    addMember: ModelTypes.RoomMember.AddMember,
    history: ModelTypes.History.Write,
    enterDevTokensProcess: ExtApiTypes.MessageReq.EnterRoom): Promise<ServiceTypes.RoomService.CreateRoulette> =>

    async (param) => {
      const roomNo = await createRoom({
        owner_no: param.owner_no,
        max_attendee: 2,
        title: '-',
        room_type: ModelTypes.RoomType.ROULETTE
      });
      const roomToken = createRoomToken(roomNo);
      await updateRoomToken(roomNo, roomToken);
      log.debug(`[room-service] roulette-room:${roomNo} created`);

      await addMember({
        room_no: roomNo,
        member_no: param.owner_no,
        is_owner: true
      });
      await addMember({
        room_no: roomNo,
        member_no: param.attendee_no,
        is_owner: false
      });

      history({
        action: ModelTypes.HistoryAction.CREATE,
        member_no: param.owner_no,
        room_no: roomNo,
        room_title: '-'
      });
      history({
        action: ModelTypes.HistoryAction.JOIN,
        member_no: param.attendee_no,
        room_no: roomNo,
        room_title: '-'
      });

      await enterDevTokensProcess(param.owner_token, roomToken);
      await enterDevTokensProcess(param.attendee_token, roomToken);

      return {
        room_token: roomToken,
        room_no: roomNo
      };
    });


injectable(ServiceModules.Room.Join,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.AddMember,
    ModelModules.History.Write,
    ExtApiModules.MessageReq.EnterRoom,
    ExtApiModules.MessageReq.PublishNotification,
    ExtApiModules.AuthReq.MembersByNos ],
  async (log: LoggerTypes.Logger,
    addMemberToRoom: ModelTypes.RoomMember.AddMember,
    history: ModelTypes.History.Write,
    enterDevTokensProcess: ExtApiTypes.MessageReq.EnterRoom,
    publishNotification: ExtApiTypes.MessageReq.PublishNotification,
    getMembersByNos: ExtApiTypes.AuthReq.MembersByNos): Promise<ServiceTypes.RoomService.Join> =>

      async (param) => {
        const resp = await addMemberToRoom({
          member_no: param.member_no,
          room_no: param.room_no,
          is_owner: false
        });
        if (resp.success === false) {
          throw new RoomJoinError(resp.cause, 'failed to join room');
        }
        log.debug(`[room-service] member:${param.member_no} joined the room:${param.room_no}`);

        const members = await getMembersByNos([ param.member_no ]);
        if (members.length === 0) {
          throw new RoomJoinError('MEMBER_NOT_FOUND', `member with token:${param.member_token} not found`);
        }

        // publish join notification to room
        await publishNotification(param.room_token, {
          messageType: ExtApiTypes.MessageType.NOTIFICATION,
          action: 'JOIN_ROOM',
          member: members[0],
          roomTitle: resp.room_title
        });

        // fcm subscribe
        await enterDevTokensProcess(param.member_token, param.room_token);

        history({
          action: ModelTypes.HistoryAction.JOIN,
          member_no: param.member_no,
          room_no: param.room_no
        });
      });

injectable(ServiceModules.Room.Leave,
  [ LoggerModules.Logger,
    ModelModules.RoomMember.RemoveMember,
    ModelModules.Room.Destroy,
    ModelModules.History.Write,
    ExtApiModules.MessageReq.LeaveRoom,
    ExtApiModules.MessageReq.PublishNotification,
    ExtApiModules.AuthReq.MembersByNos,
    ExtApiModules.MessageReq.PublishRouletteDestroyed,
    RouletteMatcherModules.CleanupCheckers ],
  async (log: LoggerTypes.Logger,
    removeMemberFromRoom: ModelTypes.RoomMember.RemoveMember,
    destroyRoom: ModelTypes.Room.Destroy,
    history: ModelTypes.History.Write,
    leaveDevTokensProcess: ExtApiTypes.MessageReq.LeaveRoom,
    publishNotification: ExtApiTypes.MessageReq.PublishNotification,
    getMembersByNos: ExtApiTypes.AuthReq.MembersByNos,
    publishRouletteDestroyed: ExtApiTypes.MessageReq.PublishRouletteDestroyed,
    cleanupMatchCheckers: RouletteMatcherTypes.CleanupCheckers): Promise<ServiceTypes.RoomService.Leave> =>

    async (param) => {
      const resp = await removeMemberFromRoom(param.member_no, param.room_no);
      if (resp.success === false) {
        throw new RoomLeaveError(resp.cause, 'failed to leave room');
      }

      const members = await getMembersByNos([ param.member_no ]);
      if (members.length === 0) {
        throw new RoomLeaveError('MEMBER_NOT_FOUND', `member with token:${param.member_token} not found`);
      }
      log.debug(`[room-service] member:${param.member_no} left the room:${param.room_no}`);

      if (resp.newOwnerNo) {
        log.debug(`[room-service] member:${resp.newOwnerNo} elected as a new owner`);
        // TODO: send push message to new-owner
      }

      await history({
        action: ModelTypes.HistoryAction.LEAVE,
        member_no: param.member_no,
        room_no: param.room_no
      });

      await leaveDevTokensProcess(param.member_token, param.room_token);

      if (resp.destroyRequired === true) {
        log.debug(`[room-service] room destroyed: ${param.room_no}`);
        history({
          action: ModelTypes.HistoryAction.DESTROY,
          member_no: param.member_no,
          room_no: param.room_no,
        });

        if (resp.roomType === ModelTypes.RoomType.ROULETTE) {
          // TODO: destroy notification publish api call
        }

        await destroyRoom(param.room_no);
        await cleanupMatchCheckers(param.room_no);
      }

      // normal leave.
      if (resp.destroyRequired === false) {
        // send leave notification to room
        await publishNotification(param.room_token, {
          messageType: ExtApiTypes.MessageType.NOTIFICATION,
          action: 'LEAVE_ROOM',
          member: members[0],
          roomTitle: resp.roomTitle
        });
      }
    });

injectable(ServiceModules.Room.Get,
  [ ModelModules.Room.Get,
    ModelModules.RoomMember.Members,
    ExtApiModules.AuthReq.MembersByNos ],
  async (getRoom: ModelTypes.Room.Get,
    getMembers: ModelTypes.RoomMember.Members,
    requestMembersViaApi: ExtApiTypes.AuthReq.MembersByNos): Promise<ServiceTypes.RoomService.Get> =>

    async (roomNo: number) => {
      const room = await getRoom(roomNo);
      if (room === null) return null;

      const membersFromDb = await getMembers(roomNo);
      const memberNos = membersFromDb.map((m) => m.member_no);
      const membersFromApi = await requestMembersViaApi(memberNos);
      const convert = cvtMember();

      const roomDetail: ServiceTypes.RoomDetail = {
        room_token: room.token,
        owner: convert(find(membersFromApi, {member_no: room.owner_no})),
        title: room.title,
        room_type: room.room_type,
        num_attendee: room.num_attendee,
        max_attendee: room.max_attendee,
        reg_date: room.reg_date,
        members: membersFromDb.map((m) => convert(find(membersFromApi, {member_no: m.member_no})))
      };
      return roomDetail;
    });