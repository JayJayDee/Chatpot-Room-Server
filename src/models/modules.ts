export namespace ModelModules {
  export enum Room {
    List = 'Model/Room/List',
    Get = 'Model/Room/Get',
    Create = 'Model/Room/Create',
    UpdateToken = 'Model/Room/UpdateToken',
    Destroy = 'Model/Room/Destroy'
  }

  export enum RoomMember {
    AddMember = 'Model/RoomMember/AddMember',
    RemoveMember = 'Model/RoomMember/RemoveMember',
    MyRooms = 'Model/RoomMember/MyRooms'
  }

  export enum Converter {
    Room = 'Model/Converter/Room'
  }

  export enum History {
    Write = 'Model/History/Write'
  }
}