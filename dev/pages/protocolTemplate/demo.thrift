/**
 * Types and Structures
 */
typedef i64 Timestamp
typedef i64 Geohash
typedef string Json

const i16 DEFAULT_LIST_SIZE = 100
const i16 MAX_LIST_SIZE = 1000

enum PoiType {
    COMMON = 0,
    BUS_STATION = 1,
    SUBWAY_STATION = 2,
    BUS_LINE = 3,
    REGION = 4,
}

enum TPoiSearchOrderBy {
    DISTANCE_ASC = 1,
    DISTANCE_DESC = 2,
}

enum UtpAreaType {
    WHITE = 1,
    CAMPUS = 2,
}

struct TGeohashName {
    1: required i64 geohash,
    2: required i32 is_filled,
    3: required i32 city_id,
    4: required i32 district_id,
    5: required string name,
    6: required string address,
    7: required string pguid,
    8: required Timestamp created_at,
    9: required i32 is_manually,
    10: required bool online_payment,
}

struct TPoi {
    1: optional i32 id,
    2: optional string name,
    3: optional string address,
    4: optional double latitude,
    5: optional double longitude,
    6: optional string pguid,
    7: optional string psn,
    8: optional string city,
    9: optional string info_json,
    10: optional i32 city_id,
}

struct TAmendedPoi {
    1: required i32 id,
    2: required string name,
    3: required string address,
    4: required string extra_tag,
    5: required i32 city_id,
    6: required double latitude,
    7: required double longitude,
    8: optional Timestamp created_at,
    9: optional string pguid,
}

struct TCity {
    1: required i32 id,
    2: required string name,
    3: required string abbr,
    4: required string hint,
    5: required string area_code,
    6: required string company_name,
    7: required string company_address,
    8: required i32 sort,
    9: required string notice_emails,
    10: required i16 is_valid,
    11: required i32 district_code,
    12: required string boundary,
    13: required double latitude,
    14: required double longitude,
    15: required string company_abbr,
    16: required i32 country_region_id,
    17: required i16 is_map,
    18: required string pinyin,
}

struct TDistrict {
    1: optional i32 id,
    2: optional string name,
    3: optional i32 city_id,
    4: optional i32 sort,
    5: optional i16 is_valid,
    6: optional Timestamp created_at,
    7: optional string attributes,
    8: optional i16 need_az_group,
}

struct TZone {
    1: optional i32 id,
    2: optional string name,
    3: optional i32 district_id,
    4: optional i32 city_id,
    5: optional i32 sort,
    6: optional i16 is_valid,
    7: optional Timestamp created_at,
    8: optional i16 need_az_group,
}

struct TCityQuery {
    1: optional bool is_valid,
    2: optional i32 offset,
    3: optional i32 limit,
}

struct TZoneQuery {
    1: optional i32 limit,
    2: optional i32 offset,
    3: optional i16 is_valid
    4: optional i32 district_id,
    5: optional i32 city_id,
}

struct TDistrictQuery {
    1: optional i32 limit,
    2: optional i32 offset,
    3: optional i16 is_valid
    4: optional i32 city_id,
}

struct TPoiSearchWithKeywordAndCityParams {
    1: required string keyword,
    2: optional string city_name,
    3: optional bool extend_boundary,
    4: optional i32 limit,
    5: optional i32 offset,
    6: optional TPoiSearchOrderBy order_by,
    7: optional string uuid,
    8: optional string category,
    9: optional bool only_hit_poi_name,
}

struct TPoiSearchWithKeywordAndGeoParams {
    1: required string keyword,
    2: required double latitude,
    3: required double longitude,
    4: optional bool extend_boundary,
    5: optional i32 limit,
    6: optional i32 offset,
    7: optional TPoiSearchOrderBy order_by,
    8: optional string uuid,
    9: optional string category,
    10: optional bool only_hit_poi_name,
}

struct TPoiSearchNearbyParams {
    1: required double latitude,
    2: required double longitude,
    3: optional i32 radius,
    4: optional i32 limit,
    5: optional i32 offset,
    6: optional TPoiSearchOrderBy order_by,
    7: optional string uuid,
    8: optional string category,
}

struct TPoiSearchResult {
    1: required string id,
    2: required string name,
    3: required string address,
    4: required string short_address,
    5: required double latitude,
    6: required double longitude,
    7: required string province,
    8: required string city,
    9: required string district,
    10: optional string request_id,
    11: optional i32 city_id,
}

struct TPoiSuggestionParams {
    1: required string keyword,
    2: required double latitude,
    3: required double longitude,
    4: optional bool extend_boundary,
    5: optional string uuid,
    6: optional string category,
}

struct TPoiSuggestionByCityParams {
    1: required string keyword,
    2: required string city_name,
    3: optional bool extend_boundary,
    4: optional string uuid,
    5: optional string category,
}

struct TPoiSuggestionResult {
    1: required string id,
    2: required string name,
    3: required string address,
    4: required string short_address,
    5: required double latitude,
    6: required double longitude,
    7: required string province,
    8: required string city,
    9: required string district,
    10: optional string request_id,
    11: optional i32 city_id,
}

struct TAddressComponent {
    1: required string nation,
    2: required string province,
    3: required string city,
    4: optional string district,
    5: optional string street,
    6: optional string street_number,
}

struct TAddressInfo {
    1: required string adcode,
    2: required string name,
    3: required double latitude,
    4: required double longitude,
    5: required string nation,
    6: required string province,
    7: required string city,
    8: optional string district,
    9: optional i32 city_id,
}

struct TReverseGeoCodingPOI {
    1: required string id,
    2: required string title,
    3: required string address,
    4: required string category,
    5: required double latitude,
    6: required double longitude,
    7: required double distance,
    8: optional string request_id,
}

struct ReverseGeoCodingResult {
    1: required string address,
    2: required string formatted_addresses,
    3: required TAddressComponent address_component,
    4: required TAddressInfo address_info,
    5: optional list<TReverseGeoCodingPOI> poi_list,
}

struct ReverseGeoCodingParams {
    1: required double latitude,
    2: required double longitude,
    3: optional i16 get_poi,
}

struct TConvertedPoiAddress {
    1: required string address,
    2: required string formatted_address,
    3: required string best_matched_poi_address,
}

struct TUtpArea {
    1: required i32 utp_id,
    2: required i32 bu_id,
    3: required UtpAreaType region_type,
    4: required i32 status,
}

struct GeoCodingResult {
    1: required double latitude,
    2: required double longitude,
    3: required double similarity,
    4: required double deviation,
    5: required double reliability,
}


/**
 * Exceptions
 */
enum GaiaErrorCode {
    UNKNOWN_ERROR = 0,
    DATABASE_ERROR = 1,

    GEOHASH_NOT_VALID = 2,
    POI_NAME_EMPTY = 3,
    POI_CITY_EMPTY = 4,
    POI_LOC_EMPTY = 5,
    CRAWL_POI_ERROR = 6,
    POI_NOT_FOUND = 7,
    INVALID_LAT_LON = 8,
    NO_PGUID_IN_POI = 9,
    GEOHASH_NAME_NOT_FOUND = 10,
    QUERY_AREA_TOO_LARGE = 11,
    AMENDED_POI_NOT_FOUND = 12,
    INVALID_FIELD_VALUE = 13,
    CITY_NOT_FOUND = 14,
    DISTRICT_NOT_FOUND = 15,
    ZONE_NOT_FOUND = 16,
    QQMAP_ERROR = 17,
    INVALID_PARAM = 18,

    UTP_AREA_NOT_FOUND = 19,
}

exception GaiaUserException {
   1: required GaiaErrorCode error_code,
   2: required string error_name,
   3: optional string message,
}

exception GaiaSystemException {
   1: required GaiaErrorCode error_code,
   2: required string error_name,
   3: optional string message,
}

exception GaiaUnknownException {
   1: required GaiaErrorCode error_code,
   2: required string error_name,
   3: required string message,
}

/**
 * API
 */
service GaiaService {
    /*
    * test for connection
    */
    bool ping()
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception,)

    // 根据pguid（高德兴趣点id）爬取兴趣点地址信息入库POI表
    void crawl_poi(1:string pguid)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    # 保存地点信息入库
    i32 save_poi(1:i32 poi_id, 2:TPoi t_poi)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    # 批量保存地点信息入库 deprecated, use msave_poi instead
    void msave_poi_by_pguid(1:list<TPoi> t_pois)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //批量保存地点信息入库
    void msave_poi(1:list<TPoi> t_pois)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据geohash_id获取GeoHashName信息
    TGeohashName get_geohash_name(1: Geohash geohash_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据poi_id获取地址信息（主库查询）
    TPoi master_get_poi(1: i32 poi_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据poi_id获取地址信息
    TPoi get_poi(1: i32 poi_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据pguid获取地址信息
    TPoi get_poi_by_pguid(1: string pguid)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据uuid获取地址信息
    TPoi get_poi_by_psn(1: string psn)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #批量根据uuid获取地址信息
    list<TPoi> mget_poi_by_psn(1: list<string> psn_list)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据经纬度获取地址信息，找到最近的点
    TPoi get_poi_by_loc(1: double lat,
                        2: double lon)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据经纬度批量获取地址信息，按照距离排序，拿到20条地址信息记录
    list<TPoi> query_poi_by_loc(1: double lat,
                                2: double lon)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //通过经纬度和名称获取POI信息，名称按照匹配度排序，返回匹配度最高的地址信息
    TPoi get_poi_by_name(1: double lat,
                         2: double lon,
                         3: string name)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据两点做矩形，返回矩形内的地址信息列表
    list<TPoi> query_poi_in_box(1: double lat1,
                                2: double lon1,
                                3: double lat2,
                                4: double lon2)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //保存POI信息（POI信息扩展表）
    void save_amended_poi(1: i32 id, 2: TAmendedPoi poi)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据城市id以及关键字查询POI信息
    list<TAmendedPoi> query_amended_poi(1: i32 city_id, 2: string keyword)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //绑定主库写入city信息，新增或更新
    i32 save_city(1:i32 city_id, 2:TCity t_city)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据经纬度返回城市id
    TCity get_city(1: i32 city_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据城市名称获取城市信息
    TCity get_city_by_name(1: string city_name)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #批量获取城市信息
    map<i32, TCity> mget_city(1: list<i32> city_ids)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据地区码获取城市信息
    TCity get_city_by_code(1: i32 district_code)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),


    #根据区域码获取城市信息
    TCity get_city_by_area_code(1: string area_code)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #分页获取有效的城市列表 会根据sort字段排序
    list<TCity> query_city(1: TCityQuery query_struct)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //新增或者更新地区信息
    i32 save_district(1:i32 district_id,
                      2: TDistrict t_district)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #根据地区id查询分区信息
    TDistrict get_district(1: i32 district_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据地区查询条件,分页查询地区列表
    list<TDistrict> query_district(1: TDistrictQuery query_struct)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #保存或者更新街道信息
    i32 save_zone(1:i32 zone_id,
                  2: TZone t_zone)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据街道id获取街道信息
    TZone get_zone(1: i32 zone_id)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据街道查询条件，分页查询街道列表
    list<TZone> query_zone(1: TZoneQuery query_struct)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    /*
    * 根据关键字和经纬度查询 符合要求的地址列表
    *（经纬度用于反向查询城市信息）
    */
    list<TPoiSearchResult> search_poi_with_keyword_and_geo(1: TPoiSearchWithKeywordAndGeoParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据关键字和城市查询 符合要求的地址列表
    list<TPoiSearchResult> search_poi_with_keyword_and_city(1: TPoiSearchWithKeywordAndCityParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #按照经纬度、距离范围、分类查询附近的地点
    list<TPoiSearchResult> search_poi_nearby(1: TPoiSearchNearbyParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据关键字、经纬度、分类等获取提示地址列表
    list<TPoiSuggestionResult> suggest_poi(1: TPoiSuggestionParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据关键词、城市等获取提示地址列表
    list<TPoiSuggestionResult> suggest_poi_by_city(1: TPoiSuggestionByCityParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #逆地址解析，根据经纬度获取地址信息
    ReverseGeoCodingResult reverse_geo_coding(1: ReverseGeoCodingParams params)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据经纬度返回匹配字符的地址信息
    TConvertedPoiAddress convert_geo_to_poi_address(1: double longitude,
                                                    2: double latitude,
                                                    3: string address_to_match)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #临时服务，废弃 ，表在geos的pgsql里
    TUtpArea get_utp_area_by_point(1: double longitude,
                                   2: double latitude)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #临时服务，废弃 ，表在geos的pgsql里
    list<TUtpArea> get_utp_areas_by_point(1: double longitude,
                                          2: double latitude)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    //根据经纬度返回城市id
    i32 get_city_id_by_location(1: double longitude,
                                2: double latitude)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),

    #逆地址解析，根据经纬度获取地址信息
    GeoCodingResult geo_coding(1:string address)
        throws (1: GaiaUserException user_exception,
                2: GaiaSystemException system_exception,
                3: GaiaUnknownException unknown_exception),
}
