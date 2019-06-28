export namespace ServiceModules {
  export enum Room {
    List = 'Service/Room/List',
    Create = 'Service/Room/Create',
    Join = 'Service/Room/Join',
    Leave = 'Service/Room/Leave',
    Get = 'Service/Room/Get'
  }

  export enum My {
    Rooms = 'Service/Room/My/Rooms'
  }

  export enum Roulette {
    MatchRequest = 'Service/Roulette/MatchRequest',
    GetMyRequests = 'Service/Roulette/GetMyRequests'
  }
}