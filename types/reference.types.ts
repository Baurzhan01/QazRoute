// types/reference.types.ts

export type ReferenceType =
  | "FamilyReason"                // По семейным обстоятельствам
  | "SickByCall"                  // Болезнь по звонку (утром)
  | "PoliceCallBeforeDeparture"   // 102 (до выезда на линию)
  | "GasStationIssue"             // АЗС (пробки, колонка не работает)
  | "PoliceOperation"             // ОПМ (проверка ГАИ)
  | "AccidentInDepot"             // ДТП на территории парка
  | "DriverLate"                  // Опоздание вина водителя
  | "TechnicalIssue"              // Техническая неисправность
  | "AlcoholIntoxication"         // Алкогольная интоксикация
  | "NoCharge"                    // Нет зарядки
  | "EmergencyInDepot"            // ЧС (травма на территории)
  | "Other";                      // Остальное

export enum ReferenceTypeCode {
  FamilyReason = 0,
  SickByCall = 1,
  PoliceCallBeforeDeparture = 2,
  GasStationIssue = 3,
  PoliceOperation = 4,
  AccidentInDepot = 5,
  DriverLate = 6,
  TechnicalIssue = 7,
  AlcoholIntoxication = 8,
  NoCharge = 9,
  EmergencyInDepot = 10,
  Other = 11,
}

export interface ReferenceCreateRequest {
  dispatchBusLineId: string;
  type: ReferenceType;       // сервер принимает строковое имя типа
  description: string;       // обязателен, но по ТЗ заполняем только для Other
}

export interface ReferenceUpdateRequest {
  type: ReferenceType;
  description: string;
}

export interface ReferenceDto {
  id: string;
  dispatchBusLineId: string;
  typeCode: number;          // enum код с бэка
  type: ReferenceType | string;
  description: string | null;
  routeNumber: string | null;
  busLineNumber: string | null;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  error: string | null;
  statusCode: number;
  value: T;
}
