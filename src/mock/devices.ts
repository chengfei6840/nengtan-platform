import type { Device } from './types'

export const devices: Device[] = [
  {
    "id": "dev-001",
    "name": "华芯变压器1",
    "code": "DV-001",
    "type": "变压器",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-011",
      "mtr-012"
    ],
    "ratedPower": 2500,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 12000,
    "lastMaintainDate": "2026-01-05",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-002",
    "name": "华芯变压器2",
    "code": "DV-002",
    "type": "变压器",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-013",
      "mtr-014"
    ],
    "ratedPower": 1600,
    "status": "running",
    "installDate": "2019-02-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 12137,
    "lastMaintainDate": "2026-02-06",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-003",
    "name": "华芯空压机1",
    "code": "DV-003",
    "type": "空压机",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-015",
      "mtr-016"
    ],
    "ratedPower": 250,
    "status": "running",
    "installDate": "2019-03-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 12274,
    "lastMaintainDate": "2026-01-07",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-004",
    "name": "华芯空压机2",
    "code": "DV-004",
    "type": "空压机",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-017",
      "mtr-018"
    ],
    "ratedPower": 160,
    "status": "idle",
    "installDate": "2019-04-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 12411,
    "lastMaintainDate": "2026-02-08",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-005",
    "name": "华芯冷机1",
    "code": "DV-005",
    "type": "冷机",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-019",
      "mtr-020"
    ],
    "ratedPower": 900,
    "status": "fault",
    "installDate": "2019-05-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 12548,
    "lastMaintainDate": "2026-01-09",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-006",
    "name": "华芯水泵1",
    "code": "DV-006",
    "type": "水泵",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-021",
      "mtr-022"
    ],
    "ratedPower": 55,
    "status": "maintenance",
    "installDate": "2019-06-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 12685,
    "lastMaintainDate": "2026-02-10",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-007",
    "name": "华芯配电柜1",
    "code": "DV-007",
    "type": "配电柜",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-023"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 12822,
    "lastMaintainDate": "2026-01-11",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-008",
    "name": "华芯冷却塔1",
    "code": "DV-008",
    "type": "冷却塔",
    "buildingId": "bld-002",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-025",
      "mtr-026"
    ],
    "ratedPower": 110,
    "status": "running",
    "installDate": "2019-08-20",
    "manufacturer": "良机",
    "model": "LBC-200",
    "runHours": 12959,
    "lastMaintainDate": "2026-02-12",
    "enterpriseId": "ent-001"
  },
  {
    "id": "dev-009",
    "name": "鼎力变压器3",
    "code": "DV-009",
    "type": "变压器",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-027",
      "mtr-028"
    ],
    "ratedPower": 2000,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 13096,
    "lastMaintainDate": "2026-01-13",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-010",
    "name": "鼎力空压机3",
    "code": "DV-010",
    "type": "空压机",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-029",
      "mtr-030"
    ],
    "ratedPower": 200,
    "status": "idle",
    "installDate": "2019-02-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 13233,
    "lastMaintainDate": "2026-02-14",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-011",
    "name": "鼎力锅炉1",
    "code": "DV-011",
    "type": "锅炉",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-031",
      "mtr-032"
    ],
    "ratedPower": 1500,
    "status": "fault",
    "installDate": "2019-03-20",
    "manufacturer": "中正锅炉",
    "model": "WNS6",
    "runHours": 13370,
    "lastMaintainDate": "2026-01-15",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-012",
    "name": "鼎力风机1",
    "code": "DV-012",
    "type": "风机",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-033",
      "mtr-034"
    ],
    "ratedPower": 37,
    "status": "maintenance",
    "installDate": "2019-04-20",
    "manufacturer": "南方风机",
    "model": "4-72",
    "runHours": 13507,
    "lastMaintainDate": "2026-02-16",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-013",
    "name": "鼎力水泵2",
    "code": "DV-013",
    "type": "水泵",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-035",
      "mtr-036"
    ],
    "ratedPower": 45,
    "status": "running",
    "installDate": "2019-05-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 13644,
    "lastMaintainDate": "2026-01-17",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-014",
    "name": "鼎力配电柜2",
    "code": "DV-014",
    "type": "配电柜",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-037"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-06-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 13781,
    "lastMaintainDate": "2026-02-18",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-015",
    "name": "鼎力热交换器1",
    "code": "DV-015",
    "type": "热交换器",
    "buildingId": "bld-004",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-039",
      "mtr-040"
    ],
    "ratedPower": 100,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "阿法拉伐",
    "model": "M10",
    "runHours": 13918,
    "lastMaintainDate": "2026-01-19",
    "enterpriseId": "ent-002"
  },
  {
    "id": "dev-016",
    "name": "绿能变压器4",
    "code": "DV-016",
    "type": "变压器",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-041",
      "mtr-042"
    ],
    "ratedPower": 2500,
    "status": "idle",
    "installDate": "2019-08-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 14055,
    "lastMaintainDate": "2026-02-20",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-017",
    "name": "绿能空压机4",
    "code": "DV-017",
    "type": "空压机",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-043",
      "mtr-044"
    ],
    "ratedPower": 160,
    "status": "fault",
    "installDate": "2019-01-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 14192,
    "lastMaintainDate": "2026-01-21",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-018",
    "name": "绿能冷机2",
    "code": "DV-018",
    "type": "冷机",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-045",
      "mtr-046"
    ],
    "ratedPower": 700,
    "status": "maintenance",
    "installDate": "2019-02-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 14329,
    "lastMaintainDate": "2026-02-22",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-019",
    "name": "绿能水泵3",
    "code": "DV-019",
    "type": "水泵",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-047",
      "mtr-048"
    ],
    "ratedPower": 55,
    "status": "running",
    "installDate": "2019-03-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 14466,
    "lastMaintainDate": "2026-01-23",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-020",
    "name": "绿能冷却塔2",
    "code": "DV-020",
    "type": "冷却塔",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-049",
      "mtr-050"
    ],
    "ratedPower": 90,
    "status": "running",
    "installDate": "2019-04-20",
    "manufacturer": "良机",
    "model": "LBC-200",
    "runHours": 14603,
    "lastMaintainDate": "2026-02-24",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-021",
    "name": "绿能配电柜3",
    "code": "DV-021",
    "type": "配电柜",
    "buildingId": "bld-007",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-051"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-05-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 14740,
    "lastMaintainDate": "2026-01-05",
    "enterpriseId": "ent-003"
  },
  {
    "id": "dev-022",
    "name": "安驰变压器5",
    "code": "DV-022",
    "type": "变压器",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-053",
      "mtr-054"
    ],
    "ratedPower": 1600,
    "status": "idle",
    "installDate": "2019-06-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 14877,
    "lastMaintainDate": "2026-02-06",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-023",
    "name": "安驰空压机5",
    "code": "DV-023",
    "type": "空压机",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-055",
      "mtr-056"
    ],
    "ratedPower": 200,
    "status": "fault",
    "installDate": "2019-07-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 15014,
    "lastMaintainDate": "2026-01-07",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-024",
    "name": "安驰锅炉2",
    "code": "DV-024",
    "type": "锅炉",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-057",
      "mtr-058"
    ],
    "ratedPower": 1200,
    "status": "maintenance",
    "installDate": "2019-08-20",
    "manufacturer": "中正锅炉",
    "model": "WNS6",
    "runHours": 15151,
    "lastMaintainDate": "2026-02-08",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-025",
    "name": "安驰风机2",
    "code": "DV-025",
    "type": "风机",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-059",
      "mtr-060"
    ],
    "ratedPower": 30,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "南方风机",
    "model": "4-72",
    "runHours": 15288,
    "lastMaintainDate": "2026-01-09",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-026",
    "name": "安驰水泵4",
    "code": "DV-026",
    "type": "水泵",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-061",
      "mtr-062"
    ],
    "ratedPower": 37,
    "status": "running",
    "installDate": "2019-02-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 15425,
    "lastMaintainDate": "2026-02-10",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-027",
    "name": "安驰配电柜4",
    "code": "DV-027",
    "type": "配电柜",
    "buildingId": "bld-010",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-063"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-03-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 15562,
    "lastMaintainDate": "2026-01-11",
    "enterpriseId": "ent-004"
  },
  {
    "id": "dev-028",
    "name": "恒达变压器6",
    "code": "DV-028",
    "type": "变压器",
    "buildingId": "bld-014",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-065",
      "mtr-066"
    ],
    "ratedPower": 1250,
    "status": "idle",
    "installDate": "2019-04-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 15699,
    "lastMaintainDate": "2026-02-12",
    "enterpriseId": "ent-005"
  },
  {
    "id": "dev-029",
    "name": "恒达锅炉3",
    "code": "DV-029",
    "type": "锅炉",
    "buildingId": "bld-014",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-067",
      "mtr-068"
    ],
    "ratedPower": 2000,
    "status": "fault",
    "installDate": "2019-05-20",
    "manufacturer": "中正锅炉",
    "model": "WNS6",
    "runHours": 15836,
    "lastMaintainDate": "2026-01-13",
    "enterpriseId": "ent-005"
  },
  {
    "id": "dev-030",
    "name": "恒达水泵5",
    "code": "DV-030",
    "type": "水泵",
    "buildingId": "bld-014",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-069",
      "mtr-070"
    ],
    "ratedPower": 55,
    "status": "maintenance",
    "installDate": "2019-06-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 15973,
    "lastMaintainDate": "2026-02-14",
    "enterpriseId": "ent-005"
  },
  {
    "id": "dev-031",
    "name": "恒达热交换器2",
    "code": "DV-031",
    "type": "热交换器",
    "buildingId": "bld-014",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-071",
      "mtr-072"
    ],
    "ratedPower": 150,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "阿法拉伐",
    "model": "M10",
    "runHours": 16110,
    "lastMaintainDate": "2026-01-15",
    "enterpriseId": "ent-005"
  },
  {
    "id": "dev-032",
    "name": "恒达配电柜5",
    "code": "DV-032",
    "type": "配电柜",
    "buildingId": "bld-014",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-073"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-08-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 16247,
    "lastMaintainDate": "2026-02-16",
    "enterpriseId": "ent-005"
  },
  {
    "id": "dev-033",
    "name": "金谷变压器7",
    "code": "DV-033",
    "type": "变压器",
    "buildingId": "bld-025",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-075",
      "mtr-076"
    ],
    "ratedPower": 1250,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 16384,
    "lastMaintainDate": "2026-01-17",
    "enterpriseId": "ent-006"
  },
  {
    "id": "dev-034",
    "name": "金谷锅炉4",
    "code": "DV-034",
    "type": "锅炉",
    "buildingId": "bld-025",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-077",
      "mtr-078"
    ],
    "ratedPower": 1600,
    "status": "idle",
    "installDate": "2019-02-20",
    "manufacturer": "中正锅炉",
    "model": "WNS6",
    "runHours": 16521,
    "lastMaintainDate": "2026-02-18",
    "enterpriseId": "ent-006"
  },
  {
    "id": "dev-035",
    "name": "金谷冷机3",
    "code": "DV-035",
    "type": "冷机",
    "buildingId": "bld-025",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-079",
      "mtr-080"
    ],
    "ratedPower": 600,
    "status": "fault",
    "installDate": "2019-03-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 16658,
    "lastMaintainDate": "2026-01-19",
    "enterpriseId": "ent-006"
  },
  {
    "id": "dev-036",
    "name": "金谷水泵6",
    "code": "DV-036",
    "type": "水泵",
    "buildingId": "bld-025",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-081",
      "mtr-082"
    ],
    "ratedPower": 45,
    "status": "maintenance",
    "installDate": "2019-04-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 16795,
    "lastMaintainDate": "2026-02-20",
    "enterpriseId": "ent-006"
  },
  {
    "id": "dev-037",
    "name": "金谷配电柜6",
    "code": "DV-037",
    "type": "配电柜",
    "buildingId": "bld-025",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-083"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-05-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 16932,
    "lastMaintainDate": "2026-01-21",
    "enterpriseId": "ent-006"
  },
  {
    "id": "dev-038",
    "name": "迅达变压器8",
    "code": "DV-038",
    "type": "变压器",
    "buildingId": "bld-037",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-085",
      "mtr-086"
    ],
    "ratedPower": 800,
    "status": "running",
    "installDate": "2019-06-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 17069,
    "lastMaintainDate": "2026-02-22",
    "enterpriseId": "ent-007"
  },
  {
    "id": "dev-039",
    "name": "迅达风机3",
    "code": "DV-039",
    "type": "风机",
    "buildingId": "bld-037",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-087",
      "mtr-088"
    ],
    "ratedPower": 22,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "南方风机",
    "model": "4-72",
    "runHours": 17206,
    "lastMaintainDate": "2026-01-23",
    "enterpriseId": "ent-007"
  },
  {
    "id": "dev-040",
    "name": "迅达配电柜7",
    "code": "DV-040",
    "type": "配电柜",
    "buildingId": "bld-037",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-089"
    ],
    "ratedPower": 0,
    "status": "idle",
    "installDate": "2019-08-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 17343,
    "lastMaintainDate": "2026-02-24",
    "enterpriseId": "ent-007"
  },
  {
    "id": "dev-041",
    "name": "博瑞变压器9",
    "code": "DV-041",
    "type": "变压器",
    "buildingId": "bld-026",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-091",
      "mtr-092"
    ],
    "ratedPower": 630,
    "status": "fault",
    "installDate": "2019-01-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 17480,
    "lastMaintainDate": "2026-01-05",
    "enterpriseId": "ent-008"
  },
  {
    "id": "dev-042",
    "name": "博瑞空压机6",
    "code": "DV-042",
    "type": "空压机",
    "buildingId": "bld-026",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-093",
      "mtr-094"
    ],
    "ratedPower": 75,
    "status": "maintenance",
    "installDate": "2019-02-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 17617,
    "lastMaintainDate": "2026-02-06",
    "enterpriseId": "ent-008"
  },
  {
    "id": "dev-043",
    "name": "星河变压器10",
    "code": "DV-043",
    "type": "变压器",
    "buildingId": "bld-015",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-095",
      "mtr-096"
    ],
    "ratedPower": 1000,
    "status": "running",
    "installDate": "2019-03-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 17754,
    "lastMaintainDate": "2026-01-07",
    "enterpriseId": "ent-009"
  },
  {
    "id": "dev-044",
    "name": "星河冷机4",
    "code": "DV-044",
    "type": "冷机",
    "buildingId": "bld-015",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-001",
      "mtr-002"
    ],
    "ratedPower": 400,
    "status": "running",
    "installDate": "2019-04-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 17891,
    "lastMaintainDate": "2026-02-08",
    "enterpriseId": "ent-009"
  },
  {
    "id": "dev-045",
    "name": "星河水泵7",
    "code": "DV-045",
    "type": "水泵",
    "buildingId": "bld-015",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-003",
      "mtr-004"
    ],
    "ratedPower": 30,
    "status": "running",
    "installDate": "2019-05-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 18028,
    "lastMaintainDate": "2026-01-09",
    "enterpriseId": "ent-009"
  },
  {
    "id": "dev-046",
    "name": "云智变压器11",
    "code": "DV-046",
    "type": "变压器",
    "buildingId": "bld-027",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-005",
      "mtr-006"
    ],
    "ratedPower": 800,
    "status": "idle",
    "installDate": "2019-06-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 18165,
    "lastMaintainDate": "2026-02-10",
    "enterpriseId": "ent-011"
  },
  {
    "id": "dev-047",
    "name": "云智冷机5",
    "code": "DV-047",
    "type": "冷机",
    "buildingId": "bld-027",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-007",
      "mtr-008"
    ],
    "ratedPower": 500,
    "status": "fault",
    "installDate": "2019-07-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 18302,
    "lastMaintainDate": "2026-01-11",
    "enterpriseId": "ent-011"
  },
  {
    "id": "dev-048",
    "name": "园区变压器12",
    "code": "DV-048",
    "type": "变压器",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-009",
      "mtr-010"
    ],
    "ratedPower": 3150,
    "status": "maintenance",
    "installDate": "2019-08-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 18439,
    "lastMaintainDate": "2026-02-12"
  },
  {
    "id": "dev-049",
    "name": "园区变压器13",
    "code": "DV-049",
    "type": "变压器",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-011",
      "mtr-012"
    ],
    "ratedPower": 3150,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 18576,
    "lastMaintainDate": "2026-01-13"
  },
  {
    "id": "dev-050",
    "name": "园区锅炉5",
    "code": "DV-050",
    "type": "锅炉",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-013",
      "mtr-014"
    ],
    "ratedPower": 2500,
    "status": "running",
    "installDate": "2019-02-20",
    "manufacturer": "中正锅炉",
    "model": "WNS6",
    "runHours": 18713,
    "lastMaintainDate": "2026-02-14"
  },
  {
    "id": "dev-051",
    "name": "园区水泵8",
    "code": "DV-051",
    "type": "水泵",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-015",
      "mtr-016"
    ],
    "ratedPower": 75,
    "status": "running",
    "installDate": "2019-03-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 18850,
    "lastMaintainDate": "2026-01-15"
  },
  {
    "id": "dev-052",
    "name": "园区水泵9",
    "code": "DV-052",
    "type": "水泵",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-017",
      "mtr-018"
    ],
    "ratedPower": 55,
    "status": "idle",
    "installDate": "2019-04-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 18987,
    "lastMaintainDate": "2026-02-16"
  },
  {
    "id": "dev-053",
    "name": "园区冷却塔3",
    "code": "DV-053",
    "type": "冷却塔",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-019",
      "mtr-020"
    ],
    "ratedPower": 120,
    "status": "fault",
    "installDate": "2019-05-20",
    "manufacturer": "良机",
    "model": "LBC-200",
    "runHours": 19124,
    "lastMaintainDate": "2026-01-17"
  },
  {
    "id": "dev-054",
    "name": "园区配电柜8",
    "code": "DV-054",
    "type": "配电柜",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-021"
    ],
    "ratedPower": 0,
    "status": "maintenance",
    "installDate": "2019-06-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 19261,
    "lastMaintainDate": "2026-02-18"
  },
  {
    "id": "dev-055",
    "name": "园区配电柜9",
    "code": "DV-055",
    "type": "配电柜",
    "buildingId": "bld-035",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-023"
    ],
    "ratedPower": 0,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "施耐德",
    "model": "MVnex",
    "runHours": 19398,
    "lastMaintainDate": "2026-01-19"
  },
  {
    "id": "dev-056",
    "name": "威特变压器14",
    "code": "DV-056",
    "type": "变压器",
    "buildingId": "bld-018",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-025",
      "mtr-026"
    ],
    "ratedPower": 1000,
    "status": "running",
    "installDate": "2019-08-20",
    "manufacturer": "特变电工",
    "model": "S11-2000",
    "runHours": 19535,
    "lastMaintainDate": "2026-02-20",
    "enterpriseId": "ent-016"
  },
  {
    "id": "dev-057",
    "name": "威特空压机7",
    "code": "DV-057",
    "type": "空压机",
    "buildingId": "bld-018",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-027",
      "mtr-028"
    ],
    "ratedPower": 110,
    "status": "running",
    "installDate": "2019-01-20",
    "manufacturer": "阿特拉斯",
    "model": "GA90",
    "runHours": 19672,
    "lastMaintainDate": "2026-01-21",
    "enterpriseId": "ent-016"
  },
  {
    "id": "dev-058",
    "name": "威特水泵10",
    "code": "DV-058",
    "type": "水泵",
    "buildingId": "bld-018",
    "zoneId": "zone-east",
    "relatedMeterIds": [
      "mtr-029",
      "mtr-030"
    ],
    "ratedPower": 30,
    "status": "idle",
    "installDate": "2019-02-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 19809,
    "lastMaintainDate": "2026-02-22",
    "enterpriseId": "ent-016"
  },
  {
    "id": "dev-059",
    "name": "优鲜冷机6",
    "code": "DV-059",
    "type": "冷机",
    "buildingId": "bld-028",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-031",
      "mtr-032"
    ],
    "ratedPower": 350,
    "status": "fault",
    "installDate": "2019-03-20",
    "manufacturer": "约克",
    "model": "YVAA",
    "runHours": 19946,
    "lastMaintainDate": "2026-01-23",
    "enterpriseId": "ent-013"
  },
  {
    "id": "dev-060",
    "name": "优鲜水泵11",
    "code": "DV-060",
    "type": "水泵",
    "buildingId": "bld-028",
    "zoneId": "zone-west",
    "relatedMeterIds": [
      "mtr-033",
      "mtr-034"
    ],
    "ratedPower": 22,
    "status": "maintenance",
    "installDate": "2019-04-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 20083,
    "lastMaintainDate": "2026-02-24",
    "enterpriseId": "ent-013"
  },
  {
    "id": "dev-061",
    "name": "污水站水泵12",
    "code": "DV-061",
    "type": "水泵",
    "buildingId": "bld-036",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-035",
      "mtr-036"
    ],
    "ratedPower": 37,
    "status": "running",
    "installDate": "2019-05-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 20220,
    "lastMaintainDate": "2026-01-05"
  },
  {
    "id": "dev-062",
    "name": "污水站水泵13",
    "code": "DV-062",
    "type": "水泵",
    "buildingId": "bld-036",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-037",
      "mtr-038"
    ],
    "ratedPower": 37,
    "status": "running",
    "installDate": "2019-06-20",
    "manufacturer": "格兰富",
    "model": "CR64",
    "runHours": 20357,
    "lastMaintainDate": "2026-02-06"
  },
  {
    "id": "dev-063",
    "name": "污水站风机4",
    "code": "DV-063",
    "type": "风机",
    "buildingId": "bld-036",
    "zoneId": "zone-public",
    "relatedMeterIds": [
      "mtr-039",
      "mtr-040"
    ],
    "ratedPower": 15,
    "status": "running",
    "installDate": "2019-07-20",
    "manufacturer": "南方风机",
    "model": "4-72",
    "runHours": 20494,
    "lastMaintainDate": "2026-01-07"
  }
]

export const devicesById = Object.fromEntries(devices.map((d) => [d.id, d])) as Record<
  string,
  Device
>
